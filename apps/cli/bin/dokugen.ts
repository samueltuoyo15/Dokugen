#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import * as path from "path";
import { select } from "@clack/prompts";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import { setTimeout as sleep } from "timers/promises";
import { detectProjectType } from "./projectDetect.js";
import { getUserInfo, getGitRepoUrl, scanFiles, checkInternetConnection } from "./utils.js";
import { generateReadmeCore } from "./generator.js";

let readmeBackup: string | null = null;
let currentReadmePath: string = "";

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

const generateReadme = async (
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

    const userInfo = getUserInfo();
    const repoUrl = getGitRepoUrl();

    const spinner = createSpinner(chalk.blue("Generating README...")).start();

    return await generateReadmeCore(
      {
        projectType,
        projectFiles,
        projectDir,
        userInfo,
        repoUrl,
        options: { includeSetup, includeContributionGuideLine },
        existingReadme,
        templateUrl,
      },
      readmePath,
      {
        onSuccess: (text: string) => {
          spinner.success({ text: chalk.green(`\n${text}`) });
          readmeBackup = null;
        },
        onError: (text: string, err: any) => {
          console.log(chalk.red(`\n${text}`));
          spinner.error({ text: chalk.red("Failed to generate README") });
        }
      }
    );
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
  .version("3.9.0")
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

      if (options.template) {
        if (readmeExists && !options.overwrite) {
          const existingContent = await fs.readFile(readmePath, "utf-8");
          await generateReadme(
            projectType,
            projectFiles,
            projectDir,
            existingContent,
            options.template,
          );
        } else {
          await generateReadme(
            projectType,
            projectFiles,
            projectDir,
            undefined,
            options.template,
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
          );
        } else {
          const overwrite = await askYesNo("README.md exists. Overwrite?");

          if (overwrite === true) {
            await generateReadme(projectType, projectFiles, projectDir);
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
        await generateReadme(projectType, projectFiles, projectDir);
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

program.parse(process.argv);

process.on("SIGINT", () => {
  console.log(chalk.yellow("\nProcess interrupted. Changes discarded"));
  process.exit(0);
});

process.on("unhandledRejection", () => {
  process.exit(1);
});
