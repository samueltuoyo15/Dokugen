#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import { registerGenerateCommand } from "./commands/generate.js";
import { registerUpdateCommand } from "./commands/update.js";
import { registerAicCommand } from "./commands/aic.js";
import { registerRevertCommand } from "./commands/revert.js";
import { runInteractiveMenu, isRunAsStandaloneBinary, waitForKeypress } from "./helpers/menu.js";
import { CURRENT_VERSION } from "./helpers/constants.js";

program
  .name("dokugen")
  .version(CURRENT_VERSION)
  .description(
    "Automatically generate high-quality README for your application",
  );

// Register commands
registerGenerateCommand(program);
registerUpdateCommand(program);
registerAicCommand(program);
registerRevertCommand(program);

const main = async (): Promise<void> => {
  try {
    const args = process.argv.slice(2);

    if (args.length > 0) {
      program.parse(process.argv);
    } else {
      await runInteractiveMenu();
    }
  } catch (error) {
    console.error(chalk.red("An unexpected error occurred:"), error);
  } finally {
    if (isRunAsStandaloneBinary()) {
      await waitForKeypress();
    }
  }
};

main();

process.on("SIGINT", async () => {
  console.log(chalk.yellow("\nProcess interrupted. Changes discarded"));
  try {
    const { restoreReadme } = await import("./helpers/readme.js");
    await restoreReadme();
  } catch (err) {
    // Ignore error
  }
  process.exit(0);
});

process.on("unhandledRejection", () => {
  process.exit(1);
});
