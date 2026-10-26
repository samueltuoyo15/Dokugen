import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import axios from "axios";
import chalk from "chalk";
import fs from "fs-extra";
import { createSpinner } from "nanospinner";
import { GITHUB_CLIENT_ID } from "./constants.js";
import { getBackendDomain } from "./network.js";

export interface DokugenConfig {
  username?: string;
  email?: string;
  opted_out?: boolean;
  access_token?: string;
  refresh_token?: string | null;
  access_token_expires_at?: number | null;
  refresh_token_expires_at?: number | null;
  linkedinUsername?: string;
  twitterUsername?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".dokugen");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function getStoredConfig(): DokugenConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return fs.readJsonSync(CONFIG_FILE);
    }
  } catch {}
  return {};
}

export function saveStoredConfig(config: Partial<DokugenConfig>): boolean {
  try {
    fs.ensureDirSync(CONFIG_DIR, { mode: 0o700 });
    const existing = getStoredConfig();
    fs.writeJsonSync(CONFIG_FILE, { ...existing, ...config }, { spaces: 2, mode: 0o600 });
    fs.chmodSync(CONFIG_FILE, 0o600);
    return true;
  } catch (error) {
    console.error(chalk.red("Failed to save Dokugen config:"), error);
    return false;
  }
}

export function clearStoredConfig(): void {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.removeSync(CONFIG_FILE);
    }
  } catch {}
}

export async function ensureAuthenticated(): Promise<DokugenConfig> {
  let config = getStoredConfig();
  if (config.username && config.access_token) {
    const expiresSoon = !!config.access_token_expires_at && config.access_token_expires_at <= Date.now() + 60_000;
    if (!expiresSoon) return config;
    if (await refreshGitHubAccessToken()) return getStoredConfig();
    clearStoredConfig();
    config = {};
  }

  console.log(chalk.cyan("\nGitHub authentication required. Please log in to continue."));
  const loggedIn = await loginWithGitHub();
  if (!loggedIn || !loggedIn.username) {
    throw new Error("Authentication required. Run 'dokugen login' to sign in.");
  }
  return loggedIn;
}

export async function refreshGitHubAccessToken(clientId = GITHUB_CLIENT_ID): Promise<boolean> {
  const config = getStoredConfig();
  if (!config.refresh_token) return false;

  try {
    const response = await axios.post<AccessTokenResponse>(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        grant_type: "refresh_token",
        refresh_token: config.refresh_token,
      },
      { headers: { Accept: "application/json" }, timeout: 15_000 },
    );
    if (!response.data.access_token || response.data.error) return false;

    const now = Date.now();
    return saveStoredConfig({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token || config.refresh_token,
      access_token_expires_at: response.data.expires_in ? now + response.data.expires_in * 1000 : null,
      refresh_token_expires_at: response.data.refresh_token_expires_in
        ? now + response.data.refresh_token_expires_in * 1000
        : config.refresh_token_expires_at,
    });
  } catch {
    return false;
  }
}

async function recoverAuthentication(): Promise<void> {
  if (await refreshGitHubAccessToken()) return;
  clearStoredConfig();
  console.log(chalk.yellow("\nYour GitHub session expired. Please authenticate again."));
  const loggedIn = await loginWithGitHub();
  if (!loggedIn?.access_token) throw new Error("GitHub authentication failed. Please run 'dokugen login'.");
}

export async function withAuthenticatedRequest<T>(
  request: (headers: { Authorization: string }) => PromiseLike<T>,
): Promise<T> {
  await ensureAuthenticated();
  try {
    return await request(getAuthHeaders());
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status !== 401) throw error;
    await recoverAuthentication();
    try {
      return await request(getAuthHeaders());
    } catch (retryError: unknown) {
      if ((retryError as { response?: { status?: number } })?.response?.status === 401) clearStoredConfig();
      throw retryError;
    }
  }
}

export function getAuthHeaders(): { Authorization: string } {
  const config = getStoredConfig();
  if (!config.access_token) {
    throw new Error("GitHub authentication is required. Run 'dokugen login'.");
  }
  return { Authorization: `Bearer ${config.access_token}` };
}

export async function updateLeaderboardPreference(optedOut: boolean): Promise<void> {
  const backendDomain = await getBackendDomain();
  await withAuthenticatedRequest((headers) =>
    axios.post(`${backendDomain}/api/auth/preferences`, { opted_out: optedOut }, { headers, timeout: 10000 }),
  );
  if (!saveStoredConfig({ opted_out: optedOut })) {
    throw new Error("The server preference was updated, but the local config could not be saved.");
  }
}

export function openBrowser(url: string): void {
  const platform = process.platform;
  const isTermux = !!process.env.TERMUX_VERSION;
  const isWsl = !!process.env.WSL_DISTRO_NAME || !!process.env.WSL_INTEROP;

  const fallback = () => {
    console.log(chalk.yellow("\nOpen this URL in your browser:"));
    console.log(chalk.cyan(url));
  };

  if (isTermux) {
    execFile("termux-open-url", [url], (err) => {
      if (err) fallback();
    });
  } else if (isWsl) {
    const escapedUrl = url.replace(/[&^<>|]/g, "^$&");
    execFile("cmd.exe", ["/c", "start", "", escapedUrl], (err) => {
      if (err)
        execFile("xdg-open", [url], (err2) => {
          if (err2) fallback();
        });
    });
  } else if (platform === "win32") {
    const escapedUrl = url.replace(/[&^<>|]/g, "^$&");
    execFile("cmd", ["/c", "start", "", escapedUrl], (err) => {
      if (err) fallback();
    });
  } else if (platform === "darwin") {
    execFile("open", [url], (err) => {
      if (err) fallback();
    });
  } else {
    execFile("xdg-open", [url], (err) => {
      if (err)
        execFile("sensible-browser", [url], (err2) => {
          if (err2) fallback();
        });
    });
  }
}

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval?: number;
  expires_in?: number;
}

interface AccessTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  error?: string;
  error_description?: string;
  interval?: number;
}

interface GitHubUserResponse {
  login: string;
  email?: string | null;
}

interface GitHubEmailItem {
  email: string;
  primary: boolean;
  verified: boolean;
}

export async function loginWithGitHub(clientId = GITHUB_CLIENT_ID): Promise<DokugenConfig | null> {
  const spinner = createSpinner("Requesting GitHub device code...").start();

  try {
    const deviceRes = await axios.post<DeviceCodeResponse>(
      "https://github.com/login/device/code",
      {
        client_id: clientId,
        scope: "read:user user:email offline_access",
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const { device_code, user_code, verification_uri, interval = 5, expires_in = 900 } = deviceRes.data;
    spinner.success({ text: chalk.green("Device code received!") });

    console.log(`\n  ${chalk.bold("1.")} Open verification page: ${chalk.cyan.underline(verification_uri)}`);
    console.log(`  ${chalk.bold("2.")} Enter one-time code:    ${chalk.bold.yellow(user_code)}\n`);

    openBrowser(verification_uri);

    const pollSpinner = createSpinner("Waiting for GitHub authorization in browser...").start();
    let pollInterval = interval;
    const expiresAt = Date.now() + expires_in * 1000;

    while (Date.now() < expiresAt) {
      await new Promise((r) => setTimeout(r, pollInterval * 1000));

      try {
        const tokenRes = await axios.post<AccessTokenResponse>(
          "https://github.com/login/oauth/access_token",
          {
            client_id: clientId,
            device_code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          },
          {
            headers: { Accept: "application/json" },
          },
        );

        const data = tokenRes.data;

        if (data.error) {
          if (data.error === "authorization_pending") {
            continue;
          }
          if (data.error === "slow_down") {
            pollInterval = (data.interval || pollInterval) + 5;
            continue;
          }
          if (data.error === "expired_token" || data.error === "access_denied") {
            pollSpinner.error({
              text: chalk.red(`Authentication failed: ${data.error_description || data.error}`),
            });
            return null;
          }
          continue;
        }

        if (data.access_token) {
          const accessToken = data.access_token;
          pollSpinner.update({ text: "Fetching user profile from GitHub..." });

          const userRes = await axios.get<GitHubUserResponse>("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          });

          const username = userRes.data.login;
          let email = userRes.data.email || "";

          if (!email) {
            try {
              const emailsRes = await axios.get<GitHubEmailItem[]>("https://api.github.com/user/emails", {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "application/json",
                },
              });
              const primaryEmail = emailsRes.data.find((e) => e.primary && e.verified);
              if (primaryEmail) email = primaryEmail.email;
            } catch {}
          }

          const existingConfig = getStoredConfig();
          const optedOut = existingConfig.opted_out ?? false;
          const now = Date.now();
          const tokenConfig: DokugenConfig = {
            username,
            email,
            opted_out: optedOut,
            access_token: accessToken,
            refresh_token: data.refresh_token || null,
            access_token_expires_at: data.expires_in ? now + data.expires_in * 1000 : null,
            refresh_token_expires_at: data.refresh_token_expires_in ? now + data.refresh_token_expires_in * 1000 : null,
          };
          if (!saveStoredConfig(tokenConfig)) {
            pollSpinner.error({ text: chalk.red("Authenticated, but failed to save credentials.") });
            return null;
          }
          pollSpinner.success({ text: chalk.green(`Successfully authenticated as @${username}!`) });
          return tokenConfig;
        }
      } catch {
        // Ignore polling errors while pending
      }
    }

    pollSpinner.error({ text: chalk.red("Authentication timed out. Please try again.") });
    return null;
  } catch (error: unknown) {
    spinner.error({ text: chalk.red("Failed to initiate GitHub login.") });
    const errObj = error as { response?: { data?: { error_description?: string } } };
    if (errObj?.response?.data?.error_description) {
      console.log(chalk.yellow(errObj.response.data.error_description));
    }
    return null;
  }
}
