import { Command } from "commander";
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import axios from "axios";
import { createSpinner } from "nanospinner";
import { isGitRepository, getUserInfo } from "../helpers/git.js";
import { getBackendDomain, checkAndUpdate, checkInternetConnection } from "../helpers/network.js";

export function registerChangelogCommand(program: Command) {
  program
    .command("changelog")
    .alias("ai-changelog")
    .description("AI-powered CHANGELOG generator and updater")
    .option("-v, --version-tag <version>", "Version header (e.g. v1.0.0)")
    .option("-n, --limit <number>", "Number of git commits to analyze", "50")
    .option("-o, --outfile <filepath>", "Output changelog file path", "CHANGELOG.md")
    .action(async (options: any) => {
      await checkAndUpdate();

      if (!isGitRepository()) {
        console.log(
          chalk.red(
            "Opps... No Git repository found. Please navigate to a project directory that has a Git repository, or initialize one using 'git init'."
          )
        );
        process.exit(1);
      }

      if (!(await checkInternetConnection())) {
        const rawUsername = getUserInfo()?.username;
        const username = rawUsername ? rawUsername.replace(/\d+/g, "") : "";
        console.log(
          chalk.red(
            `Opps... ${username} kindly check your device or pc internet connection and try again.`
          )
        );
        process.exit(1);
      }

      try {
        const limit = parseInt(options.limit, 10) || 50;
        let gitLogs = "";

        try {
          gitLogs = execSync(`git log -n ${limit} --pretty=format:"%h - %s (%an, %ad)" --date=short`, {
            encoding: "utf-8",
          }).trim();
        } catch (err) {
          console.error(chalk.red("Failed to retrieve git log history:"), err);
          process.exit(1);
        }

        if (!gitLogs) {
          console.log(chalk.yellow("No git commit history found in this repository."));
          process.exit(0);
        }

        let version = options.versionTag;
        if (!version) {
          try {
            version = execSync("git describe --tags --abbrev=0", { encoding: "utf-8" }).trim();
          } catch {
            if (fs.existsSync("package.json")) {
              try {
                const pkg = fs.readJsonSync("package.json");
                if (pkg.version) version = `v${pkg.version}`;
              } catch {
                version = "Unreleased";
              }
            } else {
              version = "Unreleased";
            }
          }
        }

        const outfile = path.resolve(process.cwd(), options.outfile || "CHANGELOG.md");
        let existingChangelog = "";

        if (fs.existsSync(outfile)) {
          existingChangelog = fs.readFileSync(outfile, "utf-8");
        }

        const startTime = Date.now();
        const spinner = createSpinner(chalk.blue("Analyzing commit history and generating CHANGELOG...")).start();

        const backendDomain = await getBackendDomain();
        const userInfo = getUserInfo();

        const response = await axios.post<{ changelog: string }>(
          `${backendDomain}/api/generate-changelog`,
          {
            logs: gitLogs,
            version,
            existingChangelog,
            userInfo,
          }
        );

        const generatedContent = response.data.changelog;
        if (!generatedContent) {
          throw new Error("No changelog content returned from backend");
        }

        fs.writeFileSync(outfile, generatedContent, "utf-8");

        const elapsedMs = Date.now() - startTime;
        let timeString = `${elapsedMs}ms`;
        if (elapsedMs >= 1000) {
          const seconds = (elapsedMs / 1000).toFixed(1);
          timeString = `${seconds}s`;
        }

        spinner.success({
          text: chalk.green(`CHANGELOG generated successfully in ${timeString}! Written to ${path.basename(outfile)}`),
        });
      } catch (error: any) {
        if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN" || error.code === "ECONNREFUSED" || !error.response) {
          const rawUsername = getUserInfo()?.username;
          const username = rawUsername ? rawUsername.replace(/\d+/g, "") : "";
          console.log(
            chalk.red(
              `Opps... ${username} kindly check your device or pc internet connection and try again.`
            )
          );
        } else {
          console.error(chalk.red("Changelog generation failed:"), error.response?.data?.error || error.message);
        }
        process.exit(1);
      }
    });
}
