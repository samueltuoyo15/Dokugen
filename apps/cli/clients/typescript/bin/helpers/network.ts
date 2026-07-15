import axios from "axios";
import { gzip } from "zlib";
import { promisify } from "util";
import { createSpinner } from "nanospinner";
import { execSync } from "child_process";
import chalk from "chalk";
import { CURRENT_VERSION } from "./constants.js";

const gzipAsync = promisify(gzip);

export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    await axios.get("https://www.google.com", { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

export const compressData = async (data: string): Promise<string> => {
  const compressed = await gzipAsync(Buffer.from(data, "utf-8"));
  return compressed.toString("base64");
};

const isNewerVersion = (latest: string, current: string): boolean => {
  if (!latest || !current) return false;
  const latestParts = latest.split(".").map(Number);
  const currentParts = current.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};

export const checkAndUpdate = async (): Promise<void> => {
  try {
    const currentVersion = CURRENT_VERSION;

    const response = await axios.get<{ version: string }>("https://registry.npmjs.org/dokugen/latest", {
      timeout: 3000,
    });
    const latestVersion = response.data.version;

    if (isNewerVersion(latestVersion, currentVersion)) {
      console.log(chalk.cyan(`\nNew version available: ${latestVersion} (current: ${currentVersion})`));
      const updateSpinner = createSpinner(chalk.blue("Updating dokugen...")).start();

      try {
        execSync("npm install -g dokugen@latest --ignore-scripts", {
          stdio: "pipe",
          timeout: 60000
        });
        updateSpinner.success({
          text: chalk.green(`Successfully updated to v${latestVersion}!`)
        });
        console.log(chalk.yellow("Please re-run your command to use the new version.\n"));
        process.exit(0);
      } catch (error) {
        updateSpinner.error({
          text: chalk.yellow("Auto-update failed. Please run: npm install -g dokugen@latest")
        });
      }
    }
  } catch (error) {
    return;
  }
};

export const getBackendDomain = async (): Promise<string> => {
  try {
    const localHealth = await axios.get<{ status?: string }>("http://localhost:3000/api/health", { timeout: 500 });
    if (localHealth.status === 200 && localHealth.data?.status === "Ok") {
      return "http://localhost:3000";
    }
  } catch (err) {
  }

  try {
    const response = await axios.get<{ domain: string }>(
      "https://dokugen.samueltuoyo.com/api/get-server-url",
      { timeout: 5000 }
    );
    return response.data.domain;
  } catch (err) {
    return "https://dokugen.samueltuoyo.com";
  }
};
