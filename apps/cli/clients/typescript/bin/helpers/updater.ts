import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { CURRENT_VERSION } from "./constants.js";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

interface UpdateCommand {
  executable: string;
  args: string[];
  forceArgs: string[];
  hint: string;
}

export interface Installation {
  path: string;
  pm: PackageManager;
}

export interface ShadowedInstallation {
  activePath: string;
  activePm: PackageManager;
  shadowedPath: string;
  shadowedPm: PackageManager;
}

const isWindows = process.platform === "win32";

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

const getInstallationPath = (entrypoint = process.argv[1] || ""): string => {
  try {
    return fs.realpathSync(entrypoint).toLowerCase();
  } catch {
    return entrypoint.toLowerCase();
  }
};

/** Infers which package manager owns an install from the entrypoint location. */
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
  if (paths.some((candidate) => candidate.includes("/yarn/global/") || candidate.includes("/.yarn/"))) return "yarn";
  if (paths.some((candidate) => candidate.includes("/.bun/") || candidate.includes("/bun-install/"))) return "bun";
  return "npm";
};

const buildUpdateCommand = (packageManager: PackageManager, version: string): UpdateCommand => {
  const spec = `dokugen@${version}`;
  switch (packageManager) {
    case "pnpm":
      return {
        executable: "pnpm",
        args: ["add", "-g", spec],
        forceArgs: ["add", "-g", "--force", spec],
        hint: `pnpm add -g --force ${spec}`,
      };
    case "yarn":
      return {
        executable: "yarn",
        args: ["global", "add", spec],
        forceArgs: ["global", "add", "--force", spec],
        hint: `yarn global add --force ${spec}`,
      };
    case "bun":
      return {
        executable: "bun",
        args: ["add", "-g", spec],
        forceArgs: ["add", "-g", "--force", spec],
        hint: `bun add -g --force ${spec}`,
      };
    default:
      return {
        executable: "npm",
        args: ["install", "-g", spec, "--ignore-scripts"],
        forceArgs: ["install", "-g", "--force", spec, "--ignore-scripts"],
        hint: `npm install -g --force ${spec}`,
      };
  }
};

export const getUpdateCommand = (
  version = "latest",
  entrypoint = process.argv[1] || "",
  environment: NodeJS.ProcessEnv = process.env,
): UpdateCommand => buildUpdateCommand(detectPackageManager(entrypoint, environment), version);

/** Lists every distinct dokugen binary on PATH in resolution order (first wins in the shell). */
export const findInstallations = (environment: NodeJS.ProcessEnv = process.env): Installation[] => {
  try {
    const output = execFileSync(isWindows ? "where.exe" : "which", isWindows ? ["dokugen"] : ["-a", "dokugen"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const seen = new Set<string>();
    const installations: Installation[] = [];
    for (const line of output.split(/\r?\n/)) {
      const binaryPath = line.trim();
      if (!binaryPath || seen.has(getInstallationPath(binaryPath))) continue;
      seen.add(getInstallationPath(binaryPath));
      installations.push({ path: binaryPath, pm: detectPackageManager(binaryPath, environment) });
    }
    return installations;
  } catch {
    return [];
  }
};

export const detectShadowedInstallations = (environment: NodeJS.ProcessEnv = process.env): ShadowedInstallation | null => {
  const [active, ...others] = findInstallations(environment);
  const shadowed = others.find((installation) => installation.pm !== active?.pm);
  if (!active || !shadowed) return null;
  return { activePath: active.path, activePm: active.pm, shadowedPath: shadowed.path, shadowedPm: shadowed.pm };
};

export const reportShadowedInstallation = (info: ShadowedInstallation): void => {
  const removeCmd = info.activePm === "npm" ? "npm rm -g dokugen" : `${info.activePm} remove -g dokugen`;
  console.log(
    chalk.yellow(
      `\nMultiple Dokugen installations found in PATH:\n` +
        `  Active (${info.activePm}):   ${info.activePath}\n` +
        `  Shadowed (${info.shadowedPm}): ${info.shadowedPath}\n` +
        `To keep only ${info.shadowedPm}, remove the ${info.activePm} one: ${chalk.cyan(removeCmd)}\n`,
    ),
  );
};

/** Removes the legacy pnpm shim that can shadow the modern one. */
const cleanShadowingBinaries = (): void => {
  try {
    const pnpmHome = process.env.PNPM_HOME;
    if (!pnpmHome) return;
    const legacyPath = path.join(pnpmHome, "dokugen");
    const modernPath = path.join(pnpmHome, "bin", "dokugen");
    if (fs.existsSync(legacyPath) && fs.existsSync(modernPath)) fs.unlinkSync(legacyPath);
  } catch {}
};

/** Runs `dokugen` exactly as the user's shell would resolve it, skipping the update check. */
const runDokugen = (args: string[], stdio: "inherit" | "pipe") =>
  spawnSync(isWindows ? "cmd.exe" : "dokugen", isWindows ? ["/c", "dokugen", ...args] : args, {
    stdio: stdio === "pipe" ? ["ignore", "pipe", "ignore"] : "inherit",
    encoding: "utf-8",
    timeout: stdio === "pipe" ? 15_000 : undefined,
    env: { ...process.env, DOKUGEN_SKIP_UPDATE: "1" },
  });

const getPathVersion = (): string | null => {
  const result = runDokugen(["version"], "pipe");
  return result.status === 0 ? String(result.stdout).trim() : null;
};

/**
 * Updates Dokugen if a newer version exists. Every package manager that owns a dokugen
 * binary on PATH is updated, so a shadowing copy can never keep the user on an old version.
 * Success is judged by what the shell resolves next, not by what this process runs from.
 * Failure never blocks the user's command. On success the command is relaunched on the new version.
 * Set DOKUGEN_SKIP_UPDATE=1 to bypass.
 */
export const checkAndUpdate = async (): Promise<void> => {
  if (process.env.DOKUGEN_SKIP_UPDATE) return;
  try {
    cleanShadowingBinaries();
    const { data } = await axios.get<{ version: string }>("https://registry.npmjs.org/dokugen/latest", {
      timeout: 3000,
    });
    const latestVersion = data.version;
    if (!isNewerVersion(latestVersion, CURRENT_VERSION)) return;

    console.log(chalk.cyan(`\nNew version available: ${latestVersion} (current: ${CURRENT_VERSION})`));
    const spinner = createSpinner(chalk.blue("Updating dokugen...")).start();

    const managers = new Set<PackageManager>([
      detectPackageManager(),
      ...findInstallations().map((installation) => installation.pm),
    ]);
    const commands = [...managers].map((manager) => buildUpdateCommand(manager, latestVersion));

    const runAll = (mode: "args" | "forceArgs"): boolean => {
      for (const command of commands) {
        try {
          execFileSync(command.executable, command[mode], { stdio: "pipe", timeout: 60_000 });
        } catch {}
      }
      cleanShadowingBinaries();
      return getPathVersion() === latestVersion;
    };

    let updated = runAll("args");
    if (!updated) {
      spinner.update({ text: chalk.blue("Normal update did not take effect. Retrying forcefully...") });
      updated = runAll("forceArgs");
    }

    if (updated) {
      spinner.success({ text: chalk.green(`Updated to v${latestVersion}. Continuing...`) });
      process.exit(runDokugen(process.argv.slice(2), "inherit").status ?? 1);
    }

    spinner.error({ text: chalk.yellow(`Could not update automatically. Continuing with v${CURRENT_VERSION}.`) });
    console.log(chalk.yellow(`Update manually with: ${commands.map((command) => command.hint).join("  or  ")}`));
    const shadow = detectShadowedInstallations();
    if (shadow) reportShadowedInstallation(shadow);
  } catch {}
};
