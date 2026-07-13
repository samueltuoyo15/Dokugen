import * as path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import axios from "axios";
import { exec } from "child_process";
import { Readable } from "stream";
import { createSpinner } from "nanospinner";
import { select, isCancel } from "@clack/prompts";
import { askYesNo, askSocialHandles } from "./prompts.js";
import {
  extractFullCode,
  loadCache,
  saveCache,
  getFileHash,
  getDokugenBackupPath,
} from "./fileOps.js";
import { getUserInfo, getGitRepoUrl } from "./git.js";
import { compressData, getBackendDomain } from "./network.js";
import { API_TIMEOUT } from "./constants.js";

function terminalLink(text: string, url: string): string {
  const supports = !!(
    process.env.FORCE_HYPERLINK === "1" ||
    (process.stdout.isTTY &&
      (!process.env.CI &&
        (process.env.WT_SESSION ||
          process.env.TERM_PROGRAM === "vscode" ||
          process.env.TERM_PROGRAM === "iTerm.app" ||
          process.env.TERM_PROGRAM === "Hyper" ||
          process.env.TERM_PROGRAM === "WezTerm" ||
          process.env.TERM_PROGRAM === "Alacritty" ||
          process.env.VTE_VERSION)))
  );
  if (supports) {
    return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
  }
  return text === url ? text : `${text}: ${url}`;
}

let readmeBackup: string | null = null;
let currentReadmePath: string = "";

function openBrowser(url: string): void {
  const platform = process.platform;
  const isTermux = !!process.env.TERMUX_VERSION;

  if (isTermux) {
    exec(`termux-open-url "${url}"`);
  } else if (platform === "win32") {
    exec(`start "" "${url}"`);
  } else if (platform === "darwin") {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

async function promptMyhappr(): Promise<void> {
  try {
    console.log("");
    const projectName = path.basename(process.cwd());
    const rawUsername = getUserInfo()?.username || "developer";
    const username = rawUsername.replace(/\d+/g, "");

    const action = await select({
      message: chalk.cyan(`Want to monetize ${projectName}? like receive donations... right? ${username}`),
      options: [
        { value: "yes", label: "Set up a funding page on myhappr (opens browser)" },
        { value: "no", label: "Maybe later" },
      ],
    });

    if (isCancel(action) || action === "no") return;

    const spinner = createSpinner("Opening myhappr...").start();
    const MAX_RETRIES = 3;
    let uri: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await axios.get<{ data: { uri: string } }>(
          "https://api.myhappr.com/api/v1/auth/google-auth",
          { timeout: 5000 },
        );
        uri = res.data?.data?.uri ?? null;
        if (uri) break;
      } catch {
        if (attempt < MAX_RETRIES) continue;
      }
    }

    if (uri) {
      spinner.success({ text: chalk.green("Browser opened. Make sure to complete account setup on myhappr.") });
      openBrowser(uri);
    } else {
      spinner.error({ text: chalk.yellow("Something went wrong connecting to myhappr. Please try again later.") });
    }
  } catch {
  }
}

export const backupReadme = async (readmePath: string): Promise<void> => {
  try {
    if (await fs.pathExists(readmePath)) {
      currentReadmePath = readmePath;
      readmeBackup = await fs.readFile(readmePath, "utf-8");
      const backupFile = getDokugenBackupPath(path.dirname(readmePath));
      try {
        await fs.ensureDir(path.dirname(backupFile));
        await fs.writeFile(backupFile, readmeBackup, "utf-8");
      } catch {
      }
      console.log(
        chalk.green(
          `[${new Date().toISOString()}] Current README backed up in memory`,
        ),
      );
    }
  } catch (error) {
    console.error(chalk.red("Failed to backup README:"), error);
  }
};

export const restoreReadme = async (): Promise<string | null> => {
  if (readmeBackup && currentReadmePath) {
    try {
      await fs.writeFile(currentReadmePath, readmeBackup);
      console.log(chalk.green("Original README content restored successfully"));
      const backup = readmeBackup;
      readmeBackup = null;
      currentReadmePath = "";
      return backup;
    } catch (error) {
      console.error(chalk.red("Failed to restore README:"), error);
      readmeBackup = null;
      currentReadmePath = "";
      return null;
    }
  } else {
    console.log(chalk.yellow("No README backup available to restore"));
    return null;
  }
};

function getHttpErrorLabel(error: any): string {
  const status =
    error?.response?.status ||
    error?.response?.data?.error?.code ||
    error?.code;

  if (!status) {
    const msg = (error?.message || "").toLowerCase();
    if (msg.includes("timeout") || msg.includes("timedout") || msg.includes("econnaborted")) {
      return "Request Timed Out";
    }
    if (msg.includes("network") || msg.includes("enotfound") || msg.includes("econnrefused")) {
      return "Network Error";
    }
    return "Unexpected Error";
  }

  const labels: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };

  return labels[status] ? `${labels[status]} (${status})` : `Error ${status}`;
}

export const generateReadme = async (
  projectType: string,
  projectFiles: string[],
  projectDir: string,
  existingReadme?: string,
  templateUrl?: string,
): Promise<string | null> => {
  let spinner: ReturnType<typeof createSpinner> | null = null;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  try {
    console.log(chalk.blue("Analyzing project files..."));
    const readmePath = path.join(projectDir, "README.md");

    let includeSetup = false;
    let includeContributionGuideLine = false;
    let includeApiDocs = false;
    let includeDiagrams = false;
    let linkedinUsername: string | undefined;
    let twitterUsername: string | undefined;

    if (!templateUrl) {
      const setupAnswer = await askYesNo(
        "Do you want to include setup instructions in the README?",
      );
      if (setupAnswer === "cancel") return null;
      includeSetup = setupAnswer === true;

      const contributionAnswer = await askYesNo(
        "Include contribution guidelines in README?",
      );
      if (contributionAnswer === "cancel") return null;
      includeContributionGuideLine = contributionAnswer === true;

      const apiDocsAnswer = await askYesNo(
        "Include API documentation in README?",
      );
      if (apiDocsAnswer === "cancel") return null;
      includeApiDocs = apiDocsAnswer === true;

      const diagramAnswer = await askYesNo(
        "Include system design diagrams in README?",
      );
      if (diagramAnswer === "cancel") return null;
      includeDiagrams = diagramAnswer === true;

      const socialHandles = await askSocialHandles();
      linkedinUsername = socialHandles.linkedinUsername;
      twitterUsername = socialHandles.twitterUsername;
    }

    let isIncremental = false;
    let modifiedFiles: string[] = [];
    const cache = await loadCache(projectDir);

    if (existingReadme && cache) {
      console.log(
        chalk.blue("Checking for codebase changes since last generation..."),
      );
      for (const file of projectFiles) {
        const filePath = path.resolve(projectDir, file);
        const currentHash = await getFileHash(filePath);
        const cachedHash = cache.files[file];
        if (currentHash !== cachedHash) {
          modifiedFiles.push(file);
        }
      }

      const cacheFilePaths = Object.keys(cache.files);
      const deletedFiles = cacheFilePaths.filter(
        (f) => !projectFiles.includes(f),
      );

      if (modifiedFiles.length === 0 && deletedFiles.length === 0) {
        console.log(
          chalk.green(
            "No changes detected in codebase. README is already up to date!",
          ),
        );
        return readmePath;
      }

      isIncremental = true;
      console.log(
        chalk.yellow(
          `Incremental update: ${modifiedFiles.length} file(s) changed, ${deletedFiles.length} file(s) deleted.`,
        ),
      );
    }

    const fullCode = await extractFullCode(
      isIncremental ? modifiedFiles : projectFiles,
      projectDir,
    );
    const startTime = Date.now();
    spinner = createSpinner(chalk.blue("Generating README...")).start();
    timerInterval = setInterval(() => {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      spinner!.update({
        text: chalk.blue(`Generating README... (${elapsedSec}s)`),
      });
    }, 100);

    const fileStream = fs.createWriteStream(readmePath);

    const backendDomain = await getBackendDomain();
    const userInfo = getUserInfo();
    const repoUrl = getGitRepoUrl();

    const compressedFullCode = await compressData(fullCode);
    const compressedExistingReadme = existingReadme
      ? await compressData(existingReadme)
      : undefined;

    const linkedinUrl = linkedinUsername
      ? `https://linkedin.com/in/${linkedinUsername}`
      : undefined;
    const twitterUrl = twitterUsername
      ? `https://x.com/${twitterUsername}`
      : undefined;

    const response = await axios.post(
      `${backendDomain}/api/generate-readme`,
      {
        projectType,
        projectFiles,
        fullCode: compressedFullCode,
        userInfo,
        options: {
          includeSetup: includeSetup === true,
          includeContributionGuideLine: includeContributionGuideLine === true,
          includeApiDocs: includeApiDocs === true,
          includeDiagrams: includeDiagrams === true,
          isIncremental,
          modifiedFiles: isIncremental ? modifiedFiles : undefined,
          linkedinUrl,
          twitterUrl,
        },
        existingReadme: compressedExistingReadme,
        repoUrl,
        templateUrl,
        compressed: true,
      },
      {
        responseType: "stream",
        timeout: API_TIMEOUT,
      },
    );

    const responseStream = response.data as Readable;
    return new Promise((resolve, reject) => {
      let buffer = "";
      const MAX_BUFFER_SIZE = 1024 * 1024;
      let isCleanedUp = false;

      const cleanup = async (success: boolean, error?: any) => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        if (timerInterval) clearInterval(timerInterval);

        responseStream.removeAllListeners();
        fileStream.removeAllListeners();

        if (!fileStream.closed) {
          fileStream.end();
        }

        buffer = "";

        if (success) {
          const elapsedMs = Date.now() - startTime;
          let timeString = "";
          if (elapsedMs < 1000) {
            timeString = `${elapsedMs}ms`;
          } else {
            const seconds = Math.floor(elapsedMs / 1000) % 60;
            const minutes = Math.floor(elapsedMs / (1000 * 60)) % 60;
            const hours = Math.floor(elapsedMs / (1000 * 60 * 60));

            const parts = [];
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
            timeString = parts.join(" ");
          }

          spinner!.success({
            text: chalk.green(`\nREADME.md created successfully in ${timeString}`),
          });
          console.log(
            chalk.cyan("\nYou like what you see? Support Dokugen financially: ") +
              chalk.blue.underline(
                terminalLink(
                  "https://myhappr.com/samueltuoyo",
                  "https://myhappr.com/samueltuoyo",
                ),
              ) +
              chalk.dim(" (Ctrl+Click or Cmd+Click to follow link)"),
          );
          readmeBackup = null;

          const newCacheFiles: Record<string, string> = {};
          for (const file of projectFiles) {
            const filePath = path.resolve(projectDir, file);
            newCacheFiles[file] = await getFileHash(filePath);
          }
          await saveCache(projectDir, { version: "1.0", files: newCacheFiles });

          await promptMyhappr();

          resolve(readmePath);
        } else {
          spinner!.error({ text: chalk.red("Failed to generate README") });
          const restoredContent = await restoreReadme();
          reject(restoredContent || error);
        }
      };

      responseStream.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();

        if (buffer.length > MAX_BUFFER_SIZE) {
          const lines = buffer.split("\n");
          buffer = lines.slice(-10).join("\n");
        }

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        lines.forEach((line) => {
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.replace("data: ", "").trim());
              if (json.response && typeof json.response === "string") {
                fileStream.write(json.response);
                fileStream.uncork();
              }
            } catch (error) {
              console.error("Skipping invalid event data:", line);
            }
          }
        });
      });

      responseStream.on("end", () => {
        cleanup(true);
      });

      fileStream.on("error", async (err) => {
        cleanup(false, err);
      });

      responseStream.on("error", async (err: Error) => {
        cleanup(false, err);
      });
    });
  } catch (error: unknown) {
    if (timerInterval) clearInterval(timerInterval);
    if (spinner) {
      const label = getHttpErrorLabel(error);
      spinner.error({ text: chalk.red(`Something went wrong: ${label}`) });
    }
    const restoredContent = await restoreReadme();
    return restoredContent || null;
  }
};
