import { execSync } from "child_process";
import os from "os";
import fs from "fs-extra";
import * as path from "path";
import axios from "axios";
import { UserInfo } from "./types.js";

export const getUserInfo = (): UserInfo => {
    let gitName = "";
    let gitEmail = "";
    try {
        gitName =
            execSync("git config --get user.name", { encoding: "utf-8" }).trim() ??
            "";
        gitEmail =
            execSync("git config --get user.email", { encoding: "utf-8" }).trim() ??
            "";
        const osInfo = {
            platform: os.platform() || "unknown",
            arch: os.arch() || "unknown",
            release: os.release() || "unknown",
        };
        if (gitName && gitEmail && osInfo)
            return { username: gitName, email: gitEmail, osInfo };
    } catch {
        // console.log(chalk.yellow("Git User Info not found. Using Defaults......"));
    }

    return {
        username: os.userInfo().username || "",
        email: process.env.USER || "",
        osInfo: { platform: "Unknown", arch: "Unknown", release: "Unknown" },
    };
};

export const getGitRepoUrl = (): string | null => {
    try {
        const repoUrl = execSync("git config --get remote.origin.url", {
            encoding: "utf-8",
        }).trim();
        return repoUrl || null;
    } catch {
        return null;
    }
};

export const matchesIgnorePattern = (filename: string, pattern: string): boolean => {
    if (pattern.startsWith("*.")) {
        const ext = pattern.slice(1);
        return filename.endsWith(ext);
    }
    return filename === pattern;
};

export const scanFiles = async (dir: string): Promise<string[]> => {
    const ignoreDirs = new Set([
        "node_modules",
        "dependencies",
        "ajax",
        "public",
        "android",
        "ios",
        ".expo",
        ".next",
        ".nuxt",
        ".svelte-kit",
        ".vercel",
        ".serverless",
        ".cache",
        "tests",
        "_tests_",
        "_test_",
        "__tests__",
        "coverage",
        "test",
        "spec",
        "cypress",
        "e2e",
        "dist",
        "build",
        "out",
        "bin",
        "obj",
        "lib",
        "target",
        "release",
        "debug",
        "artifacts",
        "generated",
        ".git",
        ".svn",
        ".hg",
        ".vscode",
        ".idea",
        ".vs",
        "venv",
        ".venv",
        "env",
        ".env",
        "virtualenv",
        "envs",
        "docs",
        "javadoc",
        "logs",
        "android",
        "ios",
        "windows",
        "linux",
        "macos",
        "web",
        ".dart_tool",
        ".gradle",
        ".mvn",
        ".npm",
        ".yarn",
        "tmp",
        "temp",
        "uploads",
        "public",
        "static",
        "assets",
        "images",
        "media",
        "migrations",
        "data",
        "db",
        "database",
        ".github",
        ".circleci",
        ".husky",
        "storage",
        "vendor",
        "cmake-build-debug",
        "packages",
        "plugins",
    ]);
    const ignoreFiles = new Set([
        "*.exe",
        "*.mp4",
        "*.iso",
        "*.mp3",
        "*.bin",
        "*.so",
        "*.a",
        "*.dll",
        "*.pyc",
        "*.class",
        "*.o",
        "*.jar",
        "*.war",
        "*.ear",
        "*.apk",
        "*.ipa",
        "*.dylib",
        "*.lock",
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "Gemfile.lock",
        "CHANGELOG.md",
        "style.css",
        "main.css",
        "output.css",
        ".gitignore",
        ".npmignore",
        "tsconfig.json",
        "jest.config.js",
        "README.md",
        ".DS_Store",
        ".env",
        "Thumbs.db",
        "tsconfig.*",
        "*.iml",
        ".editorconfig",
        ".prettierrc*",
        ".eslintrc*",
        "*.log",
        "*.min.js",
        "*.min.css",
        "*.pdf",
        "*.jpg",
        "*.png",
        "*.gif",
        "*.svg",
        "*.ico",
        "*.woff",
        "*.woff2",
        "*.ttf",
        "*.eot",
        "*.mp3",
        "*.mp4",
        "*.zip",
        "*.tar",
        "*.gz",
        "*.rar",
        "*.7z",
        "*.sqlite",
        "*.db",
        "*.sublime-workspace",
        "*.sublime-project",
        "*.bak",
        "*.swp",
        "*.swo",
        "*.pid",
        "*.seed",
        "*.pid.lock",
    ]);

    const files: string[] = [];
    const queue: string[] = [dir];

    while (queue.length) {
        const folder = queue.shift();
        if (!folder) continue;

        try {
            const dirContents = await fs.readdir(folder, { withFileTypes: true });
            for (const file of dirContents) {
                const fullPath = path.join(folder, file.name);
                if (file.isDirectory()) {
                    if (!ignoreDirs.has(file.name)) {
                        queue.push(fullPath);
                    }
                } else {
                    const shouldIgnore = [...ignoreFiles].some((pattern) =>
                        matchesIgnorePattern(file.name, pattern),
                    );

                    if (!shouldIgnore) {
                        files.push(fullPath.replace(`${dir}/`, ""));
                    }
                }
            }
        } catch (error) {
            // console.error(error);
        }
    }

    return files;
};

export const extractFullCode = async (
    projectFiles: string[],
    projectDir: string,
): Promise<string> => {
    const fileGroups: Record<string, string[]> = {};

    projectFiles.forEach((file) => {
        const dir = path.dirname(file);
        if (!fileGroups[dir]) fileGroups[dir] = [];
        fileGroups[dir].push(file);
    });

    const snippets = await Promise.all(
        Object.entries(fileGroups).map(async ([dir, files]) => {
            const dirSnippets = await Promise.all(
                files.map(async (file) => {
                    try {
                        const filePath = path.resolve(projectDir, file);
                        const stats = await fs.stat(filePath);
                        const contentStream = fs.createReadStream(filePath, "utf-8");
                        let content = "";
                        for await (const chunk of contentStream) content += chunk;

                        return `### ${file}\n- **Path:** ${file}\n- **Size:** ${(stats.size / 1024).toFixed(2)} KB\n\`\`\`${path.extname(file).slice(1) || "txt"}\n${content}\n\`\`\`\n`;
                    } catch (error) {
                        // console.error(chalk.red(`Failed to read file: ${file}`));
                        return null;
                    }
                }),
            );

            return `## ${dir}\n${dirSnippets.filter(Boolean).join("")}`;
        }),
    );
    return snippets.filter(Boolean).join("") || "No code snippets available";
};

export const checkInternetConnection = async (): Promise<boolean> => {
    try {
        await axios.get("https://www.google.com", { timeout: 5000 });
        return true;
    } catch {
        return false;
    }
};
