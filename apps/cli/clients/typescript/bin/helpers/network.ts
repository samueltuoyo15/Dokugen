import { promisify } from "node:util";
import { gzip } from "node:zlib";
import axios from "axios";

export * from "./updater.js";

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
