import { execSync } from "node:child_process";
import os from "node:os";
import chalk from "chalk";
import { getStoredConfig } from "./auth.js";

export const getUserInfo = (): {
  username: string;
  email?: string;
  osInfo: { platform: string; arch: string; release: string };
  opted_out?: boolean;
} => {
  const stored = getStoredConfig();

  let gitName = "";
  let gitEmail = "";

  const osInfo = {
    platform: os.platform() || "unknown",
    arch: os.arch() || "unknown",
    release: os.release() || "unknown",
  };

  try {
    gitName = execSync("git config --get user.name", { encoding: "utf-8" }).trim();
  } catch {}

  try {
    gitEmail = execSync("git config --get user.email", { encoding: "utf-8" }).trim();
  } catch {}

  let username = stored.username || gitName;
  const email = stored.email || gitEmail;

  if (!username && email && email.includes("@users.noreply.github.com")) {
    const match = email.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i);
    if (match?.[1]) {
      username = match[1];
    }
  }

  if (!username) {
    try {
      username = os.userInfo()?.username || "";
    } catch {}
  }

  if (!username) {
    username = "Unknown";
  }

  return {
    username,
    email: email || undefined,
    osInfo,
    opted_out: stored.opted_out ?? false,
  };
};

export const getGitRepoUrl = (): string | null => {
  try {
    const repoUrl = execSync("git config --get remote.origin.url", {
      encoding: "utf-8",
    }).trim();
    return repoUrl || null;
  } catch {
    return null;
  }
};

export const isGitRepository = (): boolean => {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
