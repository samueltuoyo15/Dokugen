import os from "node:os";
import * as path from "node:path";
import { isCancel, select, text } from "@clack/prompts";
import chalk from "chalk";
import { getStoredConfig, saveStoredConfig } from "./auth.js";

const DOKUGEN_CONFIG_DIR = path.join(os.homedir(), ".dokugen");
const DOKUGEN_CONFIG_FILE = path.join(DOKUGEN_CONFIG_DIR, "config.json");

interface DokugenProfile {
  linkedinUsername?: string;
  twitterUsername?: string;
}

const loadProfile = async (): Promise<DokugenProfile> => {
  return getStoredConfig();
};

const saveProfile = async (profile: DokugenProfile): Promise<void> => {
  if (!saveStoredConfig(profile)) {
    throw new Error("Could not save social profile");
  }
};

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
      return "cancel";
    }

    return response === "yes";
  } catch (error) {
    return "cancel";
  }
};

async function askHandle(
  fieldName: "LinkedIn" | "X (Twitter)",
  savedValue: string | undefined,
): Promise<string | undefined> {
  const options: Array<{ value: string; label: string }> = [];

  if (savedValue) {
    options.push({ value: "__saved__", label: `Use saved details (@${savedValue})` });
  }
  options.push({ value: "__enter__", label: `Enter new ${fieldName} username` });
  options.push({ value: "__skip__", label: "Skip" });

  const choice = await select({
    message: `${fieldName} username:`,
    options,
  });

  if (isCancel(choice) || choice === "__skip__") return undefined;
  if (choice === "__saved__") return savedValue;

  const entered = await text({
    message: `Enter your ${fieldName} username (without @):`,
    placeholder: fieldName === "LinkedIn" ? "e.g. samueltuoyo" : "e.g. samueltuoyo15",
  });

  if (isCancel(entered) || !(entered as string)?.trim()) return undefined;
  return (entered as string).trim();
}

export const askSocialHandles = async (): Promise<{
  linkedinUsername?: string;
  twitterUsername?: string;
}> => {
  try {
    const profile = await loadProfile();

    const linkedinUsername = await askHandle("LinkedIn", profile.linkedinUsername);
    const twitterUsername = await askHandle("X (Twitter)", profile.twitterUsername);

    // Only re-save if the user actually typed in a NEW value (not just used saved details)
    const linkedinChanged = linkedinUsername !== undefined && linkedinUsername !== profile.linkedinUsername;
    const twitterChanged = twitterUsername !== undefined && twitterUsername !== profile.twitterUsername;

    if (linkedinChanged || twitterChanged) {
      const updated: DokugenProfile = {
        linkedinUsername: linkedinUsername ?? profile.linkedinUsername,
        twitterUsername: twitterUsername ?? profile.twitterUsername,
      };
      await saveProfile(updated);
      console.log(chalk.dim(`Socials saved to ${DOKUGEN_CONFIG_FILE}`));
    }

    return {
      linkedinUsername: linkedinUsername ?? profile.linkedinUsername ?? undefined,
      twitterUsername: twitterUsername ?? profile.twitterUsername ?? undefined,
    };
  } catch {
    return {};
  }
};
