import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { gzip } from "node:zlib";
import axios from "axios";
import chalk from "chalk";
import { createSpinner } from "nanospinner";
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

interface UpdateCommand {
  executable: string;
  args: string[];
  forceArgs: string[];
  hint: string;
}

const getInstallationPath = (entrypoint = process.argv[1] || ""): string => {
  try {
    return fs.realpathSync(entrypoint).toLowerCase();
  } catch {
    return entrypoint.toLowerCase();
  }
};

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const detectPackageManager = (
  entrypoint = process.argv[1] || "",
  environment: NodeJS.ProcessEnv = process.env,
): PackageManager => {
  const normalize = (value: string): string => value.replace(/\\/g, "/").toLowerCase().replace(/\/$/, "");
  const paths = [normalize(entrypoint), normalize(getInstallationPath(entrypoint))].filter(Boolean);
  const pnpmHome = normalize(environment.PNPM_HOME || "");

  if (
    (pnpmHome && paths.some((candidate) => candidate === pnpmHome || candidate.startsWith(`${pnpmHome}/`))) ||
    paths.some(
      (candidate) =>
        candidate.includes("/.pnpm/") ||
        candidate.includes("/pnpm/global/") ||
        candidate.includes("/pnpm-global/") ||
        candidate.includes("/share/pnpm/"),
    )
  ) {
    return "pnpm";
  }
  if (paths.some((candidate) => candidate.includes("/yarn/global/") || candidate.includes("/.yarn/"))) {
    return "yarn";
  }
  if (paths.some((candidate) => candidate.includes("/.bun/") || candidate.includes("/bun-install/"))) {
    return "bun";
  }
  return "npm";
};

export const getUpdateCommand = (
  version = "latest",
  entrypoint = process.argv[1] || "",
  environment: NodeJS.ProcessEnv = process.env,
): UpdateCommand => {
  const spec = `dokugen@${version}`;
  const packageManager = detectPackageManager(entrypoint, environment);

  if (packageManager === "pnpm") {
    return {
      executable: "pnpm",
      args: ["add", "-g", spec],
      forceArgs: ["add", "-g", "--force", spec],
      hint: `pnpm add -g --force ${spec}`,
    };
  }
  if (packageManager === "yarn") {
    return {
      executable: "yarn",
      args: ["global", "add", spec],
      forceArgs: ["global", "add", "--force", spec],
      hint: `yarn global add --force ${spec}`,
    };
  }
  if (packageManager === "bun") {
    return {
      executable: "bun",
      args: ["add", "-g", spec],
      forceArgs: ["add", "-g", "--force", spec],
      hint: `bun add -g --force ${spec}`,
    };
  }
  return {
    executable: "npm",
    args: ["install", "-g", spec, "--ignore-scripts"],
    forceArgs: ["install", "-g", "--force", spec, "--ignore-scripts"],
    hint: `npm install -g --force ${spec}`,
  };
};

const getEntrypointPackageVersion = (): string | null => {
  if (!getInstallationPath()) return null;

  try {
    let directory = path.dirname(fs.realpathSync(process.argv[1]));
    for (let depth = 0; depth < 10; depth++) {
      const packagePath = path.join(directory, "package.json");
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8")) as {
          name?: string;
          version?: string;
        };
        if (packageJson.name === "dokugen" && packageJson.version) return packageJson.version;
      }
      const parent = path.dirname(directory);
      if (parent === directory) break;
      directory = parent;
    }
  } catch {}
  return null;
};

const cleanShadowingBinaries = (): void => {
  try {
    const pnpmHome = process.env.PNPM_HOME;
    if (pnpmHome) {
      const legacyPath = path.join(pnpmHome, "dokugen");
      const modernPath = path.join(pnpmHome, "bin", "dokugen");
      if (fs.existsSync(legacyPath) && fs.existsSync(modernPath) && legacyPath !== modernPath) {
        fs.unlinkSync(legacyPath);
      }
    }
  } catch {}
};

export const checkAndUpdate = async (): Promise<void> => {
  try {
    cleanShadowingBinaries();
    const currentVersion = CURRENT_VERSION;

    const response = await axios.get<{ version: string }>("https://registry.npmjs.org/dokugen/latest", {
      timeout: 3000,
    });
    const latestVersion = response.data.version;

    if (isNewerVersion(latestVersion, currentVersion)) {
      console.log(chalk.cyan(`\nNew version available: ${latestVersion} (current: ${currentVersion})`));
      const updateSpinner = createSpinner(chalk.blue("Updating dokugen...")).start();

      const command = getUpdateCommand(latestVersion);
      let updated = false;
      try {
        execFileSync(command.executable, command.args, {
          stdio: "pipe",
          timeout: 60000,
        });
        cleanShadowingBinaries();
        updated = getEntrypointPackageVersion() === latestVersion;
      } catch {}

      if (!updated) {
        updateSpinner.update({
          text: chalk.blue("Normal update did not replace this installation. Retrying forcefully..."),
        });
        try {
          execFileSync(command.executable, command.forceArgs, {
            stdio: "pipe",
            timeout: 60_000,
          });
          cleanShadowingBinaries();
          updated = getEntrypointPackageVersion() === latestVersion;
        } catch {}
      }

      if (updated) {
        updateSpinner.success({
          text: chalk.green(`Successfully updated to v${latestVersion}!`),
        });
        console.log(chalk.yellow("Please re-run your command to use the new version.\n"));
        process.exit(0);
      } else {
        updateSpinner.error({
          text: chalk.red(`Update required, but this installation could not be replaced. Run: ${command.hint}`),
        });
        process.exit(1);
      }
    }
  } catch (error) {
    return;
  }
};

export const getBackendDomain = async (): Promise<string> => {
  const envDomain = process.env.DOKUGEN_LOCAL_BACKEND_DOMAIN || process.env.BACKEND_DOMAIN;
  if (envDomain) {
    return envDomain;
  }

  const ports = ["3000", "3002", "3001"];
  for (const port of ports) {
    try {
      const localHealth = await axios.get<{ status?: string }>(`http://localhost:${port}/api/health`, { timeout: 500 });
      if (localHealth.status === 200 && localHealth.data?.status === "Ok") {
        return `http://localhost:${port}`;
      }
    } catch (err) {}
  }

  try {
    const response = await axios.get<{ domain: string }>("https://dokugen.samueltuoyo.com/api/get-server-url", {
      timeout: 5000,
    });
    return response.data.domain;
  } catch (err) {
    return "https://dokugen.samueltuoyo.com";
  }
};
