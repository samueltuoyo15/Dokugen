import { execSync } from "child_process";
import os from "os";
import chalk from "chalk";

export const getUserInfo = (): {
  username: string;
  email?: string;
  osInfo: { platform: string; arch: string; release: string };
} => {
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

  let username = gitName;

  if (!username && gitEmail && gitEmail.includes("@users.noreply.github.com")) {
    const match = gitEmail.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i);
    if (match && match[1]) {
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
    email: gitEmail,
    osInfo,
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
