import * as path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import axios from "axios";
import { Readable } from "stream";
import { createSpinner } from "nanospinner";
import { askYesNo } from "./prompts.js";
import {
  extractFullCode,
  loadCache,
  saveCache,
  getFileHash,
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

export const backupReadme = async (readmePath: string): Promise<void> => {
  try {
    if (await fs.pathExists(readmePath)) {
      currentReadmePath = readmePath;
      readmeBackup = await fs.readFile(readmePath, "utf-8");
      // Persist to disk so revert command can use it later
      const backupFile = path.join(path.dirname(readmePath), ".dokugen-backup.md");
      try {
        await fs.writeFile(backupFile, readmeBackup, "utf-8");
      } catch {
        // Non-critical — in-memory backup still available
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

export const generateReadme = async (
  projectType: string,
  projectFiles: string[],
  projectDir: string,
  existingReadme?: string,
  templateUrl?: string,
): Promise<string | null> => {
  try {
    console.log(chalk.blue("Analyzing project files..."));
    const readmePath = path.join(projectDir, "README.md");

    let includeSetup = false;
    let includeContributionGuideLine = false;
    let includeApiDocs = false;
    let includeDiagrams = false;

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

      // Check if any files were deleted
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
    const spinner = createSpinner(chalk.blue("Generating README...")).start();
    const timerInterval = setInterval(() => {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      spinner.update({
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
      const MAX_BUFFER_SIZE = 1024 * 1024; // 1MB limit for buffer
      let isCleanedUp = false;

      const cleanup = async (success: boolean, error?: any) => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        clearInterval(timerInterval);

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

          spinner.success({
            text: chalk.green(`\nREADME.md created successfully in ${timeString}`),
          });
          console.log(
            chalk.cyan("\nLove Dokugen? Consider supporting the project: ") +
              chalk.blue.underline(
                terminalLink(
                  "https://myhappr.com/samueltuoyo",
                  "https://myhappr.com/samueltuoyo",
                ),
              ) +
              chalk.dim(" (Cmd+Click / Ctrl+Click to follow link)"),
          );
          readmeBackup = null;

          // Save cache
          const newCacheFiles: Record<string, string> = {};
          for (const file of projectFiles) {
            const filePath = path.resolve(projectDir, file);
            newCacheFiles[file] = await getFileHash(filePath);
          }
          await saveCache(projectDir, { version: "1.0", files: newCacheFiles });

          resolve(readmePath);
        } else {
          console.log(chalk.red("\nFailed to generate README"));
          spinner.error({ text: chalk.red("Failed to generate README") });
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
    console.error(
      "\n Error Generating Readme",
      (error as any).response?.data || (error as any).message,
    );
    const restoredContent = await restoreReadme();
    return restoredContent || null;
  }
};
