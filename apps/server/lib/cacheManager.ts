import { GoogleGenAI } from "@google/genai";
import { createHash } from "crypto";
import { getSystemInstruction } from "../prompts/systemInstruction";
import logger from "../utils/logger";


interface CacheEntry {
  name: string;
  expiresAt: Date;
}

//  key: `${apiKey}:${includeDiagrams}`


const cacheStore = new Map<string, CacheEntry>();

/** How long (seconds) each cached-content lives on Google's servers. */
const CACHE_TTL_SECONDS = 3600; 

/**
 * How far before expiry we proactively refresh the cache (milliseconds).
 * Avoids a request racing against an expiring cache.
 */
const REFRESH_BUFFER_MS = 5 * 60 * 1000; 

// Model name helpers

/**
 * Context Caching requires a *versioned* model name (e.g. "gemini-2.5-flash-001").
 * If the caller passes an alias like "gemini-2.5-flash" we resolve it here.
 */
export function getVersionedModelName(model: string): string {
  const versionMap: Record<string, string> = {
    "gemini-2.5-flash":      "gemini-2.5-flash-001",
    "gemini-2.5-pro":        "gemini-2.5-pro-001",
    "gemini-2.0-flash":      "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite": "gemini-2.0-flash-lite-001",
    "gemini-1.5-flash":      "gemini-1.5-flash-001",
    "gemini-1.5-pro":        "gemini-1.5-pro-001",
  };
  return versionMap[model] ?? model;
}

/**
 * Models that do not support context caching on the free tier (limit=0).
 * Attempting to create a cache for these models wastes an API call and always
 * returns RESOURCE_EXHAUSTED, so we skip it entirely and fall back to uncached.
 */
const NO_CACHE_MODELS = new Set([
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-001",
]);

 //Core function
 
/**
 * Returns a valid Gemini cache name for the given API key + options combo.
 *
 * - On the first call it creates the cache.
 * - On subsequent calls it returns the cached name until it is about to expire,
 *   at which point it transparently refreshes it.
 * - If creation fails for any reason it returns `null` so the caller can fall
 *   back to a plain (uncached) request.
 *
 * @param apiKey          The Gemini API key to create the cache under.
 * @param options         README generation options (only `includeDiagrams` matters here).
 * @param modelName       The model name from env / request (versioned or aliased).
 * @returns               Cache resource name, or `null` on failure.
 */
export async function getCachedContentName(
  apiKey: string,
  options: { includeDiagrams?: boolean },
  modelName: string
): Promise<string | null> {
  // Skip caching entirely for models with no free-tier cache quota.
  if (NO_CACHE_MODELS.has(modelName)) {
    logger.info({ model: modelName }, "Context caching skipped - model has no free-tier cache quota");
    return null;
  }

  const withDiagrams = !!options.includeDiagrams;
  // Hash the key so plaintext API keys are never stored in process memory
  const keyHash  = createHash("sha256").update(apiKey).digest("hex").slice(0, 16);
  const cacheKey = `${keyHash}:${withDiagrams}`;
  const existing     = cacheStore.get(cacheKey);

  // Return the existing cache if it still has more than REFRESH_BUFFER_MS left.
  if (existing && existing.expiresAt.getTime() - Date.now() > REFRESH_BUFFER_MS) {
    logger.info(
      { keySuffix: `…${apiKey.slice(-6)}`, withDiagrams },
      "Context cache HIT — reusing cached system instruction"
    );
    return existing.name;
  }

  // Create (or refresh) the cache.
  try {
    const ai             = new GoogleGenAI({ apiKey });
    const versionedModel = getVersionedModelName(modelName);
    const systemInstruction = getSystemInstruction(options);

    logger.info(
      { model: versionedModel, withDiagrams },
      "Context cache MISS, creating new cached content"
    );

    const cache = await ai.caches.create({
      model: versionedModel,
      config: {
        displayName: `dokugen-sys-${withDiagrams ? "diagrams" : "plain"}`,
        systemInstruction,
        ttl: `${CACHE_TTL_SECONDS}s`,
      },
    });

    const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1_000);
    cacheStore.set(cacheKey, { name: cache.name!, expiresAt });

    logger.info(
      { cacheName: cache.name, expiresAt },
      "Context cache created successfully"
    );
    return cache.name!;
  } catch (err: any) {
    logger.warn(
      { error: err?.message },
      "Context cache creation failed — falling back to uncached request"
    );
    return null;
  }
}


export function clearCacheStore(): void {
  cacheStore.clear();
}
