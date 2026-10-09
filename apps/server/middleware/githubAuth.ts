import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export interface VerifiedGitHubUser {
  username: string;
  email?: string;
}

interface GitHubProfile {
  login?: string;
  email?: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface CachedIdentity {
  user: VerifiedGitHubUser;
  expiresAt: number;
}

const identityCache = new Map<string, CachedIdentity>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const tokenCacheKey = (token: string): string => createHash("sha256").update(token).digest("hex");

async function githubRequest<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "Dokugen-Server",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub identity verification failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

async function verifyGitHubToken(token: string): Promise<VerifiedGitHubUser> {
  const cacheKey = tokenCacheKey(token);
  const cached = identityCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.user;

  const profile = await githubRequest<GitHubProfile>("/user", token);
  if (!profile.login) throw new Error("GitHub profile did not contain a login");

  let email = profile.email || undefined;
  if (!email) {
    const emails = await githubRequest<GitHubEmail[]>("/user/emails", token);
    email = emails.find((item) => item.primary && item.verified)?.email;
  }

  const user = { username: profile.login.toLowerCase(), email: email?.toLowerCase() };
  if (identityCache.size >= 5_000) {
    for (const [key, value] of identityCache) {
      if (value.expiresAt <= Date.now()) identityCache.delete(key);
    }
    if (identityCache.size >= 5_000) identityCache.delete(identityCache.keys().next().value as string);
  }
  identityCache.set(cacheKey, { user, expiresAt: Date.now() + CACHE_TTL_MS });
  return user;
}

export async function requireGitHubAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorization = req.header("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    res.status(401).json({ error: "GitHub authentication required" });
    return;
  }

  try {
    res.locals.githubUser = await verifyGitHubToken(match[1]);
    next();
  } catch (error) {
    logger.warn({ error }, "Rejected invalid GitHub access token");
    res.status(401).json({ error: "GitHub authentication is invalid or expired" });
  }
}

export function getVerifiedGitHubUser(res: Response): VerifiedGitHubUser {
  return res.locals.githubUser as VerifiedGitHubUser;
}
