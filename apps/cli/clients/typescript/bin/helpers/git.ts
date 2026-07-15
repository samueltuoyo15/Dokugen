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
  try {
    gitName =
      execSync("git config --get user.name", { encoding: "utf-8" }).trim() ??
      "";
    gitEmail =
      execSync("git config --get user.email", { encoding: "utf-8" }).trim() ??
      "";
    const osInfo = {
      platform: os.platform() || "unknown",
      arch: os.arch() || "unknown",
      release: os.release() || "unknown",
    };
    if (gitName && gitEmail && osInfo)
      return { username: gitName, email: gitEmail, osInfo };
  } catch {
    console.log(chalk.yellow("Git User Info not found. Using Defaults......"));
  }

  return {
    username: os.userInfo().username || "",
    email: "",
    osInfo: { platform: "Unknown", arch: "Unknown", release: "Unknown" },
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
