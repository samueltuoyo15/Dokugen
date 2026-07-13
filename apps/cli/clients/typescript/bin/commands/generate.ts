import { Command } from "commander";
import { setTimeout as sleep } from "timers/promises";
import chalk from "chalk";
import * as path from "path";
import fs from "fs-extra";
import { createSpinner } from "nanospinner";
import { checkAndUpdate, checkInternetConnection } from "../helpers/network.js";
import { DOKUGEN_BANNER } from "../helpers/constants.js";
import { getUserInfo, isGitRepository } from "../helpers/git.js";
import { backupReadme, generateReadme, restoreReadme } from "../helpers/readme.js";
import { scanFiles } from "../helpers/fileOps.js";
import { askYesNo } from "../helpers/prompts.js";
//@ts-ignore
import { detectProjectType } from "../projectDetect.mjs";

export function registerGenerateCommand(program: Command) {
  const projectName = path.basename(process.cwd());

  program
    .command("generate")
    .description(`Scan ${projectName} and generate a README.md`)
    .option(
      "--no-overwrite",
      "Do not overwrite existing README.md, append new features instead",
    )
    .option(
      "--template <url>",
      "use a custom GitHub repo readme file as a template to generate a concise and strict readme for your project",
    )
    .action(async (options: any) => {
      if (!isGitRepository()) {
        console.log(
          chalk.red(
            "Opps... No Git repository found. Please navigate to a project directory that has a Git repository, or initialize one using 'git init'."
          )
        );
        process.exit(1);
      }

      await checkAndUpdate();
      await sleep(50);
      console.log("\n" + chalk.hex("#000080")(DOKUGEN_BANNER) + "\n");
      const projectDir = process.cwd();
      const readmePath = path.join(projectDir, "README.md");
      const readmeExists = await fs.pathExists(readmePath);
      const connectionSpinner = createSpinner("Checking internet...").start();
      const hasGoodInternetConnection = await checkInternetConnection();
      connectionSpinner.stop();

      if (!hasGoodInternetConnection) {
        const rawUsername = getUserInfo()?.username;
        const username = rawUsername ? rawUsername.replace(/\d+/g, "") : "";
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
              undefined,
            );
          } else {
            const projectName = path.basename(projectDir);
            const overwrite = await askYesNo(`README.md exists for ${projectName}. Overwrite?`);

            if (overwrite === true) {
              await generateReadme(
                projectType,
                projectFiles,
                projectDir,
                undefined,
                undefined,
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
          );
        }
      } catch (error) {
        console.error(error);
        await restoreReadme();
        process.exit(1);
      }
    });
}
