import * as path from "node:path";
import { isCancel, select } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";
import fs from "fs-extra";
import { getDokugenBackupPath } from "../helpers/fileOps.js";
import { checkAndUpdate } from "../helpers/network.js";

export function registerRevertCommand(program: Command) {
  const projectName = path.basename(process.cwd());

  program
    .command("revert")
    .description(`Revert ${projectName} README.md to the previous Dokugen-generated backup`)
    .action(async () => {
      await checkAndUpdate();

      const projectDir = process.cwd();
      const backupFile = getDokugenBackupPath(projectDir);
      const readmePath = path.join(projectDir, "README.md");

      if (!(await fs.pathExists(backupFile))) {
        console.log(chalk.red("No backup found. Run 'dokugen generate' or 'dokugen update' first to create one."));
        process.exit(1);
      }

      console.log(chalk.blue("Found a previous README backup."));

      const action = await select({
        message: `Revert ${projectName} README.md to the previous Dokugen-generated version?`,
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
        console.log(chalk.green("README.md successfully reverted to the previous version!"));
      } catch (error: unknown) {
        const err = error as Error;
        console.error(chalk.red("Failed to revert README:"), err.message);
        process.exit(1);
      }
    });
}
