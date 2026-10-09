import chalk from "chalk";
import type { Command } from "commander";
import { clearStoredConfig, getStoredConfig, loginWithGitHub, updateLeaderboardPreference } from "../helpers/auth.js";

export function registerAuthCommands(program: Command) {
  program
    .command("login")
    .description("Authenticate with GitHub using device authorization")
    .action(async () => {
      const current = getStoredConfig();
      if (current.username) {
        console.log(chalk.yellow(`Already logged in as @${current.username}. Re-authenticating...`));
      }
      await loginWithGitHub();
    });

  program
    .command("logout")
    .description("Log out and clear stored Dokugen credentials")
    .action(async () => {
      const current = getStoredConfig();
      if (!current.username) {
        console.log(chalk.yellow("You are not currently logged in."));
        return;
      }
      clearStoredConfig();
      console.log(chalk.green(`Logged out from @${current.username}. Local config cleared.`));
    });

  program
    .command("config")
    .description("View or update your Dokugen configuration")
    .option("--opt-out-leaderboard", "Opt out of showing your username on the public leaderboard")
    .option("--opt-in-leaderboard", "Opt in to showing your username on the public leaderboard")
    .action(async (options: { optOutLeaderboard?: boolean; optInLeaderboard?: boolean }) => {
      const current = getStoredConfig();

      if (options.optOutLeaderboard) {
        await updateLeaderboardPreference(true);
        console.log(chalk.green("You are hidden from the public leaderboard. Aggregate usage will still be counted."));
        return;
      }

      if (options.optInLeaderboard) {
        await updateLeaderboardPreference(false);
        console.log(chalk.green("You have opted in to the public leaderboard."));
        return;
      }

      console.log(chalk.bold("\nDokugen Configuration:"));
      console.log(
        `  Username:    ${current.username ? chalk.cyan(`@${current.username}`) : chalk.dim("Not logged in (using git config)")}`,
      );
      console.log(`  Email:       ${current.email ? chalk.cyan(current.email) : chalk.dim("Not set")}`);
      console.log(
        `  Leaderboard: ${current.opted_out ? chalk.yellow("Opted out (Hidden)") : chalk.green("Opted in (Visible)")}\n`,
      );
    });
}
