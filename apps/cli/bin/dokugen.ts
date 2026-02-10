#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import * as path from "path";
import { select, text, isCancel } from "@clack/prompts";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import { setTimeout as sleep } from "timers/promises";
import axios from "axios";
import { Readable } from "stream";
import { execSync } from "child_process";
import os from "os";
import { gzip, gunzip } from "zlib";
import { promisify } from "util";
//@ts-ignore
import { detectProjectType } from "./projectDetect.mjs";

const gzipAsync = promisify(gzip);

const API_TIMEOUT = 300000;
let readmeBackup: string | null = null;
let currentReadmePath: string = "";

const checkAndUpdate = async (): Promise<void> => {
  try {
    const currentVersion = execSync("dokugen --version", {
      stdio: "pipe",
      timeout: 8000,
      encoding: "utf-8"
    }).trim();

    const response = await axios.get<{ version: string }>("https://registry.npmjs.org/dokugen/latest", {
      timeout: 3000,
    });
    const latestVersion = response.data.version;

    if (latestVersion !== currentVersion) {
      console.log(chalk.cyan(`\nNew version available: ${latestVersion} (current: ${currentVersion})`));
      const updateSpinner = createSpinner(chalk.blue("Updating dokugen...")).start();

      try {
        execSync("npm install -g dokugen@latest", {
          stdio: "pipe",
          timeout: 60000
        });
        updateSpinner.success({
          text: chalk.green(`Successfully updated to v${latestVersion}!`)
        });
        console.log(chalk.yellow("Please re-run your command to use the new version.\n"));
        process.exit(0);
      } catch (error) {
        updateSpinner.error({
          text: chalk.yellow("Auto-update failed. Please run: npm install -g dokugen@latest")
        });
      }
    }
  } catch (error) {
    return;
  }
};


const getUserInfo = (): {
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
    email: process.env.USER || "",
    osInfo: { platform: "Unknown", arch: "Unknown", release: "Unknown" },
  };
};

const backupReadme = async (readmePath: string): Promise<void> => {
  try {
    if (await fs.pathExists(readmePath)) {
      currentReadmePath = readmePath;
      readmeBackup = await fs.readFile(readmePath, "utf-8");
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

const restoreReadme = async (): Promise<string | null> => {
  if (readmeBackup && currentReadmePath) {
    try {
      await fs.writeFile(currentReadmePath, readmeBackup);
      console.log(chalk.green("Original README content restored successfully"));
      return readmeBackup;
    } catch (error) {
      console.error(chalk.red("Failed to restore README:"), error);
      return null;
    } finally {
      readmeBackup = null;
      currentReadmePath = "";
    }
  } else {
    console.log(chalk.yellow("No README backup available to restore"));
    return null;
  }
};

const getGitRepoUrl = (): string | null => {
  try {
    const repoUrl = execSync("git config --get remote.origin.url", {
      encoding: "utf-8",
    }).trim();
    return repoUrl || null;
  } catch {
    return null;
  }
};

const compressData = async (data: string): Promise<string> => {
  const compressed = await gzipAsync(Buffer.from(data, "utf-8"));
  return compressed.toString("base64");
};


const extractFullCode = async (
  projectFiles: string[],
  projectDir: string,
): Promise<string> => {
  const fileGroups: Record<string, string[]> = {};

  projectFiles.forEach((file) => {
    const dir = path.dirname(file);
    if (!fileGroups[dir]) fileGroups[dir] = [];
    fileGroups[dir].push(file);
  });

  const snippets = await Promise.all(
    Object.entries(fileGroups).map(async ([dir, files]) => {
      const dirSnippets = await Promise.all(
        files.map(async (file) => {
          try {
            const filePath = path.resolve(projectDir, file);
            const stats = await fs.stat(filePath);
            const contentStream = fs.createReadStream(filePath, "utf-8");
            let content = "";
            for await (const chunk of contentStream) content += chunk;

            return `### ${file}\n- **Path:** ${file}\n- **Size:** ${(stats.size / 1024).toFixed(2)} KB\n\`\`\`${path.extname(file).slice(1) || "txt"}\n${content}\n\`\`\`\n`;
          } catch (error) {
            console.error(chalk.red(`Failed to read file: ${file}`));
            console.error(error);
            return null;
          }
        }),
      );

      return `## ${dir}\n${dirSnippets.filter(Boolean).join("")}`;
    }),
  );
  return snippets.filter(Boolean).join("") || "No code snippets available";
};

const matchesIgnorePattern = (filename: string, pattern: string): boolean => {
  if (pattern.startsWith("*.")) {
    const ext = pattern.slice(1);
    return filename.endsWith(ext);
  }
  return filename === pattern;
};

const scanFiles = async (dir: string): Promise<string[]> => {
  const ignoreDirs = new Set([
    "node_modules", "bower_components", "jspm_packages", "web_modules",
    "dist", "build", "out", "target", "bin", "obj", "lib", "release", "debug",
    "artifacts", "generated", "temp", "tmp", "cache", ".cache", ".temp",
    ".next", ".nuxt", ".svelte-kit", ".vercel", ".serverless", ".expo", ".output",
    "dist-electron", "release-builds", ".parcel-cache",
    "android", "ios", "windows", "linux", "macos", "web",
    ".dart_tool", ".pub-cache", ".pub", "Pods", ".bundle",
    "venv", ".venv", "env", ".env", "virtualenv", "envs", "__pycache__",
    ".pytest_cache", ".mypy_cache", ".tox", "htmlcov", "site-packages",
    "vendor", "var", "storage",
    ".gradle", ".mvn", ".idea",
    "tests", "_tests_", "_test_", "__tests__", "coverage", "test", "spec",
    "cypress", "e2e", "reports",
    ".git", ".svn", ".hg", ".vscode", ".vs", ".history", ".github", ".gitlab",
    "public", "static", "assets", "images", "media", "uploads", "fonts", "icons",
    "migrations", "data", "db", "database", "logs", "log", "dump", "backups",
    "docs", "javadoc", "tools", "scripts", "config", "settings",
    "cmake-build-debug", "packages", "plugins", "examples", "samples"
  ]);
  const ignoreFiles = new Set([
    "*.exe", "*.dll", "*.so", "*.dylib", "*.bin", "*.iso", "*.img", "*.dmg",
    "*.zip", "*.tar", "*.gz", "*.rar", "*.7z", "*.bz2", "*.xz",
    "*.mp4", "*.mkv", "*.avi", "*.mov", "*.wmv", "*.flv", "*.webm",
    "*.mp3", "*.wav", "*.flac", "*.aac", "*.ogg", "*.wma",
    "*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp", "*.ico", "*.svg", "*.webp", "*.tiff",
    "*.pdf", "*.doc", "*.docx", "*.ppt", "*.pptx", "*.xls", "*.xlsx", "*.csv",
    "*.ttf", "*.otf", "*.woff", "*.woff2", "*.eot",
    "*.pyc", "*.pyo", "*.pyd",
    "*.class", "*.jar", "*.war", "*.ear",
    "*.o", "*.obj", "*.a", "*.lib",
    "*.lock", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Gemfile.lock", "composer.lock", "mix.lock", "pubspec.lock", "Cargo.lock",
    "*.log", "*.tmp", "*.temp", "*.swp", "*.swo", "*.bak", "*.old", "*.orig",
    ".DS_Store", "Thumbs.db", "desktop.ini",
    ".env", ".env.local", ".env.development", ".env.test", ".env.production",
    "Dockerfile", "docker-compose.yml", "Makefile", "CMakeLists.txt",
    "LICENSE", "CHANGELOG.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "README.md",
    ".gitignore", ".npmignore", ".dockerignore", ".eslintrc*", ".prettierrc*", "tsconfig.json",
    "*.min.js", "*.min.css", "*.map", "*.d.ts", "*.apk", "*.aab", "*.ipa", "*.hap"
  ]);

  const files: string[] = [];
  const queue: string[] = [dir];

  while (queue.length) {
    const folder = queue.shift();
    if (!folder) continue;

    try {
      const dirContents = await fs.readdir(folder, { withFileTypes: true });
      for (const file of dirContents) {
        const fullPath = path.join(folder, file.name);
        if (file.isDirectory()) {
          if (!ignoreDirs.has(file.name)) {
            queue.push(fullPath);
          }
        } else {
          const shouldIgnore = [...ignoreFiles].some((pattern) =>
            matchesIgnorePattern(file.name, pattern),
          );

          if (!shouldIgnore) {
            files.push(fullPath.replace(`${dir}/`, ""));
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return files;
};

const askYesNo = async (message: string): Promise<boolean | "cancel"> => {
  try {
    const response = await select({
      message,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    });

    if (response === null) {
      console.log(chalk.yellow("Readme Generation Cancelled"));
      return "cancel";
    }

    return response === "yes";
  } catch (error) {
    console.error(chalk.yellow("Readme Generation Cancelled"));
    return "cancel";
  }
};

const checkInternetConnection = async (): Promise<boolean> => {
  try {
    await axios.get("https://www.google.com", { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

const askForGeminiKey = async (): Promise<string | null> => {
  const hasKey = await select({
    message: "Do you have a Google Gemini API Key?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No (Use Dokugen's shared key)" },
    ],
  });

  if (isCancel(hasKey)) {
    console.log(chalk.yellow("Operation cancelled"));
    process.exit(0);
  }

  if (hasKey === "yes") {
    const key = await text({
      message: "Enter your Google Gemini API Key:",
      placeholder: "AIzaSy...",
      validate(value) {
        if (value.length === 0) return "Value is required!";
      },
    });

    if (isCancel(key)) {
      console.log(chalk.yellow("Operation cancelled"));
      process.exit(0);
    }
    return key as string;
  }
  return null;
};

const generateReadme = async (
  projectType: string,
  projectFiles: string[],
  projectDir: string,
  existingReadme?: string,
  templateUrl?: string,
  geminiApiKey?: string | null,
): Promise<string | null> => {
  try {
    console.log(chalk.blue("Analyzing project files..."));
    const projectDir = process.cwd();
    const readmePath = path.join(projectDir, "README.md");

    let includeSetup = false;
    let includeContributionGuideLine = false;

    if (!templateUrl) {
      const setupAnswer = await askYesNo(
        "Do you want to include setup instructions in the README?",
      );
      if (setupAnswer === "cancel") return null;
      includeSetup = setupAnswer;

      const contributionAnswer = await askYesNo(
        "Include contribution guidelines in README?",
      );
      if (contributionAnswer === "cancel") return null;
      includeContributionGuideLine = contributionAnswer;
    }

    const fullCode = await extractFullCode(projectFiles, projectDir);
    const userInfo = getUserInfo();
    const repoUrl = getGitRepoUrl();

    const spinner = createSpinner(chalk.blue("Generating README...")).start();
    const fileStream = fs.createWriteStream(readmePath);

    const getBackendDomain = await axios.get<{ domain: string }>(
      "https://dokugen-readme.vercel.app/api/get-server-url",
    );
    const backendDomain = getBackendDomain.data.domain;

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
        options: { includeSetup, includeContributionGuideLine },
        existingReadme: compressedExistingReadme,
        repoUrl,
        templateUrl,
        compressed: true,
        geminiApiKey,
      },
      {
        responseType: "stream",
        timeout: API_TIMEOUT,
      },
    );

    const responseStream = response.data as Readable;
    return new Promise((resolve, reject) => {
      let buffer = "";

      responseStream.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();

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
        fileStream.end(async () => {
          spinner.success({
            text: chalk.green("\nREADME.md created successfully"),
          });
          readmeBackup = null;
          resolve(readmePath);
        });
      });

      fileStream.on("error", async (err) => {
        console.log(chalk.red("\nFailed to write README"));
        spinner.error({ text: chalk.red("Failed to generate README") });
        const restoredContent = await restoreReadme();
        fileStream.end();
        reject(restoredContent || err);
      });

      responseStream.on("error", async (err: Error) => {
        console.log(chalk.red("\nError receiving stream data"));
        spinner.error({ text: chalk.red("Failed to generate README") });
        const restoredContent = await restoreReadme();
        reject(restoredContent || err);
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

program
  .name("dokugen")
  .version("3.10.0")
  .description(
    "Automatically generate high-quality README for your application",
  );
program
  .command("generate")
  .description("Scan project and generate a README.md")
  .option(
    "--no-overwrite",
    "Do not overwrite existing README.md, append new features instead",
  )
  .option(
    "--template <url>",
    "use a custom GitHub repo readme file as a template to generate a concise and strict readme for your project",
  )
  .action(async (options) => {
    await checkAndUpdate();
    await sleep(50);
    console.log(
      "\n\n" +
      chalk.hex("#000080")(
        figlet.textSync("DOKUGEN", {
          font: "Small Slant",
          horizontalLayout: "fitted",
        }),
      ) +
      "\n\n",
    );
    const projectDir = process.cwd();
    const readmePath = path.join(projectDir, "README.md");
    const readmeExists = await fs.pathExists(readmePath);
    const connectionSpinner = createSpinner("Checking internet...").start();
    const hasGoodInternetConnection = await checkInternetConnection();
    connectionSpinner.stop();

    if (!hasGoodInternetConnection) {
      const username = getUserInfo()?.username;
      return console.log(
        chalk.red(
          `Opps... ${username} kindly check your device or pc internet connection and try again.`,
        ),
      );
    }

    if (readmeExists) {
      await backupReadme(readmePath);
    }

    try {
      if (options.template && !options.template.includes("github.com")) {
        console.log(
          chalk.red(
            "Invalid GitHub URL. Use format: https://github.com/user/repo/blob/main/README.md",
          ),
        );
        process.exit(1);
      }

      const projectType = await detectProjectType(projectDir);
      const scanSpinner = createSpinner("Scanning project files...").start();
      const projectFiles = await scanFiles(projectDir);
      scanSpinner.success({
        text: chalk.yellow(
          `Found: ${projectFiles.length} files in the project`,
        ),
      });

      console.log(chalk.blue(`Detected project type: ${projectType}`));
      const geminiApiKey = await askForGeminiKey();

      if (options.template) {
        if (readmeExists && !options.overwrite) {
          const existingContent = await fs.readFile(readmePath, "utf-8");
          await generateReadme(
            projectType,
            projectFiles,
            projectDir,
            existingContent,
            options.template,
            geminiApiKey,
          );
        } else {
          await generateReadme(
            projectType,
            projectFiles,
            projectDir,
            undefined,
            options.template,
            geminiApiKey,
          );
        }
        console.log(chalk.green("README.md generated from template!"));
        return;
      }

      if (readmeExists) {
        if (!options.overwrite) {
          const existingContent = await fs.readFile(readmePath, "utf-8");
          await generateReadme(
            projectType,
            projectFiles,
            projectDir,
            existingContent,
            undefined,
            geminiApiKey,
          );
        } else {
          const overwrite = await askYesNo("README.md exists. Overwrite?");

          if (overwrite === true) {
            await generateReadme(
              projectType,
              projectFiles,
              projectDir,
              undefined,
              undefined,
              geminiApiKey,
            );
          } else if (overwrite === false) {
            console.log(
              chalk.yellow("README update skipped (user selected No)"),
            );
            return;
          } else if (overwrite === "cancel") {
            console.log(chalk.yellow("README generation cancelled"));
            await restoreReadme();
            return;
          }
        }
      } else {
        await generateReadme(
          projectType,
          projectFiles,
          projectDir,
          undefined,
          undefined,
          geminiApiKey,
        );
      }
    } catch (error) {
      console.error(error);
      await restoreReadme();
      process.exit(1);
    }
  });

program
  .command("compose-docker")
  .description(
    "Generate dockerfiles or docker compose for multiple services of your project",
  )
  .action(() => {
    console.log("testing coming soon.....");
  });

program
  .command("update")
  .description("Update auto-generated sections of README while preserving custom content")
  .option(
    "--template <url>",
    "use a custom GitHub repo readme file as a template",
  )
  .action(async (options) => {
    await checkAndUpdate();
    await sleep(50);
    console.log(
      "\n\n" +
      chalk.hex("#000080")(
        figlet.textSync("DOKUGEN", {
          font: "Small Slant",
          horizontalLayout: "fitted",
        }),
      ) +
      "\n\n",
    );

    const projectDir = process.cwd();
    const readmePath = path.join(projectDir, "README.md");
    const readmeExists = await fs.pathExists(readmePath);

    if (!readmeExists) {
      console.log(
        chalk.red(
          "No README.md found. Use 'dokugen generate' to create one first.",
        ),
      );
      process.exit(1);
    }

    const connectionSpinner = createSpinner("Checking internet...").start();
    const hasGoodInternetConnection = await checkInternetConnection();
    connectionSpinner.stop();

    if (!hasGoodInternetConnection) {
      const username = getUserInfo()?.username;
      return console.log(
        chalk.red(
          `Opps... ${username} kindly check your device or pc internet connection and try again.`,
        ),
      );
    }

    try {
      await backupReadme(readmePath);

      const geminiApiKey = await askForGeminiKey();

      if (options.template && !options.template.includes("github.com")) {
        console.log(
          chalk.red(
            "Invalid GitHub URL. Use format: https://github.com/user/repo/blob/main/README.md",
          ),
        );
        process.exit(1);
      }

      const existingContent = await fs.readFile(readmePath, "utf-8");

      const hasDokugenMarkers = existingContent.includes("<!-- DOKUGEN:") ||
        existingContent.includes("[![Readme was generated by Dokugen]");

      if (!hasDokugenMarkers) {
        console.log(
          chalk.yellow(
            "This README doesn't appear to be generated by Dokugen.",
          ),
        );
        const proceed = await askYesNo(
          "Do you want to regenerate the entire README?",
        );

        if (proceed === true) {
          const projectType = await detectProjectType(projectDir);
          const scanSpinner = createSpinner("Scanning project files...").start();
          const projectFiles = await scanFiles(projectDir);
          scanSpinner.success({
            text: chalk.yellow(
              `Found: ${projectFiles.length} files in the project`,
            ),
          });

          await generateReadme(
            projectType,
            projectFiles,
            projectDir,
            undefined,
            options.template,
            geminiApiKey,
          );
          console.log(chalk.green("README.md regenerated successfully!"));
          return;
        } else {
          console.log(chalk.yellow("Update cancelled."));
          await restoreReadme();
          return;
        }
      }

      console.log(chalk.blue("Analyzing README structure..."));

      const projectType = await detectProjectType(projectDir);
      const scanSpinner = createSpinner("Scanning project files...").start();
      const projectFiles = await scanFiles(projectDir);
      scanSpinner.success({
        text: chalk.yellow(
          `Found: ${projectFiles.length} files in the project`,
        ),
      });

      console.log(chalk.blue(`Detected project type: ${projectType}`));
      console.log(chalk.blue("Updating auto-generated sections..."));

      // Generate new content
      await generateReadme(
        projectType,
        projectFiles,
        projectDir,
        existingContent,
        options.template,
        geminiApiKey,
      );

      console.log(
        chalk.green(
          "README.md updated successfully! Custom sections preserved.",
        ),
      );
    } catch (error) {
      console.error(chalk.red("Error updating README:"), error);
      await restoreReadme();
      process.exit(1);
    }
  });

program.parse(process.argv);

process.on("SIGINT", () => {
  console.log(chalk.yellow("\nProcess interrupted. Changes discarded"));
  process.exit(0);
});

process.on("unhandledRejection", () => {
  process.exit(1);
});
