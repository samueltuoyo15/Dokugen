import { select, isCancel } from "@clack/prompts";
import { program } from "commander";
import chalk from "chalk";
import { DOKUGEN_BANNER, CURRENT_VERSION } from "./constants.js";
import { checkAndUpdate } from "./network.js";

export const waitForKeypress = async (): Promise<void> => {
  console.log(chalk.dim("\nPress Enter to exit..."));
  return new Promise((resolve) => {
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.setRawMode?.(false);
      resolve();
    });
  });
};

export const isRunAsStandaloneBinary = (): boolean => {
  const execPath = process.execPath.toLowerCase();
  return execPath.includes("dokugen-windows") ||
    execPath.includes("dokugen-linux") ||
    execPath.includes("dokugen-macos") ||
    execPath.endsWith(".exe") && !execPath.includes("node") && !execPath.includes("bun");
};

export const runInteractiveMenu = async (): Promise<void> => {
  await checkAndUpdate();

  console.log("\n" + chalk.hex("#000080")(DOKUGEN_BANNER) + "\n");
  console.log(chalk.blue(`Welcome to Dokugen (v${CURRENT_VERSION}) - Automatic README Generator\n`));

  const action = await select({
    message: "What would you like to do?",
    options: [
      { value: "generate", label: "Generate README", hint: "Scan project and create a new README.md" },
      { value: "update", label: "Update README", hint: "Update an existing Dokugen-generated README" },
      { value: "revert", label: "Revert README", hint: "Restore the previous Dokugen-generated README" },
      { value: "aic", label: "AI Git Commit", hint: "Generate commit message and commit staged changes" },
      { value: "help", label: "View Help", hint: "Show all available commands and options" },
      { value: "exit", label: "Exit" },
    ],
  });

  if (isCancel(action) || action === "exit") {
    console.log(chalk.yellow("Goodbye!"));
    return;
  }

  process.argv = [process.argv[0], process.argv[1], action as string];
  program.parse(process.argv);
};
