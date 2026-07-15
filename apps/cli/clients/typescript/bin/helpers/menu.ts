import { select, isCancel } from "@clack/prompts";
import { program } from "commander";
import chalk from "chalk";
import path from "path";
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

  const projectName = path.basename(process.cwd());

  const action = await select({
    message: "What would you like to do?",
    options: [
      { value: "generate", label: "Generate README", hint: `Scan ${projectName} and create a new README.md` },
      { value: "update", label: "Update README", hint: `Update an existing Dokugen-generated README for ${projectName}` },
      { value: "revert", label: "Revert README", hint: `Restore the previous Dokugen-generated README for ${projectName}` },
      { value: "license", label: "Generate LICENSE", hint: `Generate a LICENSE file. Without one, ${projectName} is copyright-protected by default but legally unclear, so contributors and companies will avoid it.` },
      { value: "aic", label: "AI Git Commit", hint: `Generate commit message and commit staged changes for ${projectName}` },
      { value: "help", label: "View Help", hint: "Show all available commands and options" },
      { value: "exit", label: "Exit" },
    ],
  });

  if (isCancel(action) || action === "exit") {
    process.stdout.write(process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H");
    console.log(chalk.bold.hex("#000080")("Dokugen: Goodbye!"));
    return;
  }

  process.argv = [process.argv[0], process.argv[1], action as string];
  program.parse(process.argv);
};
