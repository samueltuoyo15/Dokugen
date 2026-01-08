import axios from "axios";
import { Readable } from "stream";
import fs from "fs-extra";
import { GenerateOptions } from "./types.js";
import { extractFullCode } from "./utils.js";

const API_TIMEOUT = 300000;

export interface GeneratorCallbacks {
    onProgress?: (text: string) => void;
    onChunk?: (chunk: string) => void;
    onSuccess?: (text: string) => void;
    onError?: (text: string, error?: any) => void;
}

export const generateReadmeCore = async (
    options: GenerateOptions,
    readmePath: string,
    callbacks: GeneratorCallbacks = {}
): Promise<string | null> => {
    try {
        callbacks.onProgress?.("Analyzing project files...");
        const fullCode = await extractFullCode(options.projectFiles, options.projectDir);

        callbacks.onProgress?.("Generating README...");
        const fileStream = fs.createWriteStream(readmePath);

        const getBackendDomain = await axios.get<{ domain: string }>(
            "https://dokugen-readme.vercel.app/api/get-server-url",
        );
        const backendDomain = getBackendDomain.data.domain;

        const response = await axios.post(
            `${backendDomain}/api/generate-readme`,
            {
                projectType: options.projectType,
                projectFiles: options.projectFiles,
                fullCode,
                userInfo: options.userInfo,
                options: options.options,
                existingReadme: options.existingReadme,
                repoUrl: options.repoUrl,
                templateUrl: options.templateUrl,
            },
            {
                responseType: "stream",
                timeout: API_TIMEOUT,
            },
        );

        const responseStream = response.data as Readable;
        return new Promise((resolve, reject) => {
            let buffer = "";

            responseStream.on("data", (chunk: Buffer) => {
                buffer += chunk.toString();

                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                lines.forEach((line) => {
                    if (line.startsWith("data:")) {
                        try {
                            const json = JSON.parse(line.replace("data: ", "").trim());
                            if (json.response && typeof json.response === "string") {
                                fileStream.write(json.response);
                                callbacks.onChunk?.(json.response);
                            }
                        } catch (error) {
                            // callbacks.onError?.("Skipping invalid event data", error);
                        }
                    }
                });
            });

            responseStream.on("end", () => {
                fileStream.end(async () => {
                    callbacks.onSuccess?.("README.md created successfully");
                    resolve(readmePath);
                });
            });

            fileStream.on("error", async (err) => {
                callbacks.onError?.("Failed to write README", err);
                fileStream.end();
                reject(err);
            });

            responseStream.on("error", async (err: Error) => {
                callbacks.onError?.("Error receiving stream data", err);
                reject(err);
            });
        });
    } catch (error: any) {
        callbacks.onError?.("Error Generating Readme", error.response?.data || error.message);
        return null;
    }
};
