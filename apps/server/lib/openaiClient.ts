import { createPrivateKey, sign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const TOKEN_REFRESH_BUFFER_SECONDS = 60;

interface ServiceAccountCredentials {
  type: "service_account";
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface CachedAccessToken {
  value: string;
  expiresAt: number;
}

let cachedAccessToken: CachedAccessToken | undefined;
let tokenRequest: Promise<string> | undefined;

const base64UrlEncode = (value: string): string => Buffer.from(value).toString("base64url");

const getBaseURL = (): string => {
  const baseURL = process.env.OPENAI_BASE_URL?.trim();
  if (!baseURL) {
    throw new Error("OPENAI_BASE_URL is required");
  }
  return baseURL;
};

const isVertexOpenAIEndpoint = (baseURL: string): boolean => {
  try {
    const hostname = new URL(baseURL).hostname;
    return hostname === "aiplatform.googleapis.com" || hostname.endsWith("-aiplatform.googleapis.com");
  } catch {
    return false;
  }
};

const loadServiceAccountCredentials = async (): Promise<ServiceAccountCredentials> => {
  const configuredPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!configuredPath) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is required for a Vertex AI endpoint");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(path.resolve(configuredPath), "utf8"));
  } catch {
    throw new Error("Could not read the service-account JSON specified by GOOGLE_APPLICATION_CREDENTIALS");
  }

  const credentials = parsed as Partial<ServiceAccountCredentials>;
  if (credentials.type !== "service_account" || !credentials.client_email || !credentials.private_key) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS must point to a valid service-account JSON file");
  }
  return credentials as ServiceAccountCredentials;
};

const exchangeServiceAccountJwt = async (): Promise<string> => {
  const credentials = await loadServiceAccountCredentials();
  const tokenUri = credentials.token_uri || "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);
  const unsignedJwt = [
    base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64UrlEncode(
      JSON.stringify({
        iss: credentials.client_email,
        scope: CLOUD_PLATFORM_SCOPE,
        aud: tokenUri,
        iat: now,
        exp: now + 3600,
      }),
    ),
  ].join(".");
  const signature = sign("RSA-SHA256", Buffer.from(unsignedJwt), createPrivateKey(credentials.private_key));
  const assertion = `${unsignedJwt}.${signature.toString("base64url")}`;

  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) {
    throw new Error(`Google OAuth token exchange failed with status ${response.status}`);
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token || typeof data.expires_in !== "number") {
    throw new Error("Google OAuth token exchange returned an invalid response");
  }

  cachedAccessToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - TOKEN_REFRESH_BUFFER_SECONDS) * 1000,
  };
  return data.access_token;
};

const getVertexAccessToken = async (): Promise<string> => {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) return cachedAccessToken.value;
  tokenRequest ??= exchangeServiceAccountJwt().finally(() => {
    tokenRequest = undefined;
  });
  return tokenRequest;
};

/**
 * Creates an OpenAI SDK client for any OpenAI-compatible endpoint.
 *
 * Set OPENAI_API_KEY for a normal API-key provider. When it is intentionally
 * empty and OPENAI_BASE_URL is a Vertex / Agent Platform endpoint, this obtains
 * a short-lived OAuth token from the service-account JSON using built-in Node APIs.
 */
export const createOpenAIClient = async (): Promise<OpenAI> => {
  const baseURL = getBaseURL();
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (apiKey) {
    return new OpenAI({ apiKey, baseURL });
  }

  if (!isVertexOpenAIEndpoint(baseURL)) {
    throw new Error("OPENAI_API_KEY is required unless OPENAI_BASE_URL is a Vertex AI endpoint");
  }

  return new OpenAI({ apiKey: await getVertexAccessToken(), baseURL });
};

/** Vertex's OpenAI-compatible endpoint expects Google publisher model IDs. */
export const getModelName = (modelName: string): string => {
  const baseURL = getBaseURL();
  return isVertexOpenAIEndpoint(baseURL) && !modelName.includes("/") ? `google/${modelName}` : modelName;
};
