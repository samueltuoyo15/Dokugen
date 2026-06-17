import { select, text, isCancel } from "@clack/prompts";
import chalk from "chalk";

export const askYesNo = async (message: string): Promise<boolean | "cancel"> => {
  try {
    const response = await select({
      message,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    });

    if (response === null || isCancel(response)) {
      console.log(chalk.yellow("Readme Generation Cancelled"));
      return "cancel";
    }

    return response === "yes";
  } catch (error) {
    console.error(chalk.yellow("Readme Generation Cancelled"));
    return "cancel";
  }
};
