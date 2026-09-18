import { execSync, spawnSync } from "node:child_process";
import { isCancel, select, text } from "@clack/prompts";
import axios from "axios";
import chalk from "chalk";
import type { Command } from "commander";
import { createSpinner } from "nanospinner";
import { getUserInfo, isGitRepository } from "../helpers/git.js";
import { checkAndUpdate, checkInternetConnection, getBackendDomain } from "../helpers/network.js";

interface AicOptions {
  push?: boolean;
}

export function registerAicCommand(program: Command) {
  program
    .command("aic")
    .alias("ai-commit")
    .description("AI-powered Git commit generator")
    .option("-p, --push", "Push after committing")
    .action(async (options: AicOptions) => {
      await checkAndUpdate();

      if (!isGitRepository()) {
        console.log(
          chalk.red(
            "Opps... No Git repository found. Please navigate to a project directory that has a Git repository, or initialize one using 'git init'.",
          ),
        );
        process.exit(1);
      }

      if (!(await checkInternetConnection())) {
        const rawUsername = getUserInfo()?.username;
        const username = rawUsername ? rawUsername.replace(/\d+/g, "") : "";
        console.log(chalk.red(`Opps... ${username} kindly check your device or pc internet connection and try again.`));
        process.exit(1);
      }

      try {
        let diff = "";
        try {
          execSync("git config core.autocrlf true");
          diff = execSync("git diff --cached --ignore-space-at-eol", { encoding: "utf-8" }).trim();
        } catch {}

        if (!diff) {
          console.log(chalk.yellow("No staged changes detected. Staging all files..."));
          try {
            execSync("git add .");
            diff = execSync("git diff --cached --ignore-space-at-eol", { encoding: "utf-8" }).trim();
          } catch (err) {
            console.error(chalk.red("Failed to stage files:"), err);
            process.exit(1);
          }
        }

        if (!diff) {
          console.log(chalk.yellow("No changes to commit!"));
          process.exit(0);
        }

        try {
          const stagedFiles = execSync("git diff --cached --name-only", { encoding: "utf-8" })
            .trim()
            .split("\n")
            .filter(Boolean);
          console.log(chalk.blue("\nFiles being committed:"));
          for (const file of stagedFiles) {
            console.log(chalk.cyan(`- ${file}`));
          }
          console.log("");
        } catch {}

        const startTime = Date.now();
        const spinner = createSpinner(chalk.blue("Analyzing staged changes...")).start();

        let commitMessage = "";
        try {
          const backendDomain = await getBackendDomain();
          const userInfo = getUserInfo();

          const response = await axios.post<{ message: string }>(`${backendDomain}/api/generate-commit`, {
            diff,
            userInfo,
          });

          commitMessage = response.data.message;
          if (!commitMessage) {
            throw new Error("No commit message generated from backend");
          }

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
            text: chalk.green(`Commit message generated successfully in ${timeString}`),
          });
        } catch (error: unknown) {
          spinner.error({ text: chalk.red("Failed to generate commit message") });
          throw error;
        }

        console.log(chalk.green(`"${commitMessage}"\n`));

        let finalCommitMessage = commitMessage;
        const backendDomain = await getBackendDomain();

        while (true) {
          const action = await select({
            message: "What would you like to do?",
            options: [
              { value: "commit", label: "Accept & Commit" },
              { value: "edit", label: "Edit message" },
              { value: "regenerate", label: "Regenerate message" },
              { value: "cancel", label: "Cancel" },
            ],
          });

          if (isCancel(action) || action === "cancel") {
            console.log(chalk.yellow("Commit cancelled."));
            process.exit(0);
          }

          if (action === "commit") {
            break;
          }
          if (action === "edit") {
            const edited = await text({
              message: "Edit commit message:",
              initialValue: finalCommitMessage,
              placeholder: "Enter new commit message",
            });

            if (isCancel(edited)) {
              continue;
            }
            finalCommitMessage = (edited as string).trim();
            console.log(chalk.green(`\nUpdated commit message:\n"${finalCommitMessage}"\n`));
          } else if (action === "regenerate") {
            const regenSpinner = createSpinner(chalk.blue("Regenerating commit message...")).start();
            try {
              const response = await axios.post<{ message: string }>(`${backendDomain}/api/generate-commit`, {
                diff,
                userInfo: getUserInfo(),
              });
              finalCommitMessage = response.data.message;
              if (!finalCommitMessage) {
                throw new Error("No commit message generated from backend");
              }
              regenSpinner.success({ text: chalk.green("New commit message generated successfully") });
              console.log(chalk.green(`"${finalCommitMessage}"\n`));
            } catch (err: unknown) {
              const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
              regenSpinner.error({ text: chalk.red("Failed to regenerate commit message") });
              console.error(chalk.red("Error details:"), errorObj.response?.data?.error || errorObj.message);
            }
          }
        }

        const commitResult = spawnSync("git", ["commit", "-m", finalCommitMessage], { stdio: "inherit" });
        if (commitResult.status !== 0) {
          throw new Error(`Git commit failed with exit status ${commitResult.status}`);
        }
        console.log(chalk.green("\nCommit successful"));

        if (options.push) {
          console.log(chalk.blue("> Running: git push"));
          execSync("git push", { stdio: "inherit" });
          console.log(chalk.green("Push successful"));
        }
      } catch (error: unknown) {
        const errObj = error as { code?: string; response?: unknown; message?: string };
        if (
          errObj.code === "ENOTFOUND" ||
          errObj.code === "EAI_AGAIN" ||
          errObj.code === "ECONNREFUSED" ||
          !errObj.response
        ) {
          const rawUsername = getUserInfo()?.username;
          const username = rawUsername ? rawUsername.replace(/\d+/g, "") : "";
          console.log(
            chalk.red(`Opps... ${username} kindly check your device or pc internet connection and try again.`),
          );
        } else {
          const responseErr = (errObj as { response?: { data?: { error?: string } } }).response?.data?.error;
          console.error(chalk.red("Commit failed:"), responseErr || errObj.message);
        }
        process.exit(1);
      }
    });
}
