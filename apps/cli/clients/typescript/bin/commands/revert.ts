import { Command } from "commander";
import chalk from "chalk";
import * as path from "path";
import fs from "fs-extra";
import { select, isCancel } from "@clack/prompts";
import { checkAndUpdate } from "../helpers/network.js";

export function registerRevertCommand(program: Command) {
  program
    .command("revert")
    .description("Revert README.md to the previous Dokugen-generated backup")
    .action(async () => {
      await checkAndUpdate();

      const projectDir = process.cwd();
      const backupFile = path.join(projectDir, ".dokugen-backup.md");
      const readmePath = path.join(projectDir, "README.md");

      if (!(await fs.pathExists(backupFile))) {
        console.log(
          chalk.red(
            "No backup found. Run 'dokugen generate' or 'dokugen update' first to create one."
          )
        );
        process.exit(1);
      }

      console.log(chalk.blue("Found a previous README backup."));

      const action = await select({
        message: "Revert README.md to the previous Dokugen-generated version?",
        options: [
          { value: "yes", label: "Yes, revert it" },
          { value: "no", label: "No, keep current" },
        ],
      });

      if (isCancel(action) || action === "no") {
        console.log(chalk.yellow("Revert cancelled."));
        return;
      }

      try {
        const backupContent = await fs.readFile(backupFile, "utf-8");
        await fs.writeFile(readmePath, backupContent, "utf-8");
        console.log(
          chalk.green("README.md successfully reverted to the previous version!")
        );
      } catch (error: any) {
        console.error(chalk.red("Failed to revert README:"), error.message);
        process.exit(1);
      }
    });
}
