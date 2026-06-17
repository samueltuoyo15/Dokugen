import * as path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { createHash } from "crypto";

export interface DokugenCache {
  version: string;
  files: Record<string, string>;
}

export const loadCache = async (
  projectDir: string,
): Promise<DokugenCache | null> => {
  const cachePath = path.join(projectDir, ".dokugen-cache.json");
  try {
    if (await fs.pathExists(cachePath)) {
      return await fs.readJson(cachePath);
    }
  } catch {
    // Ignore cache loading errors
  }
  return null;
};

export const saveCache = async (
  projectDir: string,
  cache: DokugenCache,
): Promise<void> => {
  const cachePath = path.join(projectDir, ".dokugen-cache.json");
  try {
    await fs.writeJson(cachePath, cache, { spaces: 2 });
  } catch {
    // Ignore cache saving errors
  }
};

export const getFileHash = async (filePath: string): Promise<string> => {
  try {
    const content = await fs.readFile(filePath);
    return createHash("sha256").update(content).digest("hex");
  } catch {
    return "";
  }
};

export const matchesIgnorePattern = (
  filename: string,
  pattern: string,
): boolean => {
  if (pattern.startsWith("*.")) {
    const ext = pattern.slice(1);
    return filename.endsWith(ext);
  }
  return filename === pattern;
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

            // Use streaming to avoid loading entire file into memory at once
            const contentStream = fs.createReadStream(filePath, "utf-8");
            let content = "";

            for await (const chunk of contentStream) {
              content += chunk;
            }

            // Ensure stream is closed
            contentStream.close();

            const snippet = `### ${file}\n- **Path:** ${file}\n- **Size:** ${(stats.size / 1024).toFixed(2)} KB\n\`\`\`${path.extname(file).slice(1) || "txt"}\n${content}\n\`\`\`\n`;

            // Clear content reference to free memory
            content = "";

            return snippet;
          } catch (error) {
            console.error(chalk.red(`Failed to read file: ${file}`));
            console.error(error);
            return null;
          }
        }),
      );

      const result = `## ${dir}\n${dirSnippets.filter(Boolean).join("")}`;
      return result;
    }),
  );

  return snippets.filter(Boolean).join("") || "No code snippets available";
};

export const scanFiles = async (dir: string): Promise<string[]> => {
  const ignoreDirs = new Set([
    "node_modules",
    ".turbo",
    "bower_components",
    "jspm_packages",
    "web_modules",
    "dist",
    "build",
    "out",
    "target",
    "bin",
    "obj",
    "lib",
    "release",
    "debug",
    "artifacts",
    "generated",
    "temp",
    "tmp",
    "cache",
    ".cache",
    ".temp",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".vercel",
    ".serverless",
    ".expo",
    ".output",
    "dist-electron",
    "release-builds",
    ".parcel-cache",
    "android",
    "ios",
    "windows",
    "linux",
    "macos",
    "web",
    ".dart_tool",
    ".pub-cache",
    ".pub",
    "Pods",
    ".bundle",
    "venv",
    ".venv",
    "env",
    ".env",
    "virtualenv",
    "envs",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".tox",
    "htmlcov",
    "site-packages",
    "vendor",
    "var",
    "storage",
    ".gradle",
    ".mvn",
    ".idea",
    "tests",
    "_tests_",
    "_test_",
    "__tests__",
    "coverage",
    "test",
    "spec",
    "cypress",
    "e2e",
    "reports",
    ".git",
    ".svn",
    ".hg",
    ".vscode",
    ".vs",
    ".history",
    ".github",
    ".gitlab",
    "public",
    "static",
    "assets",
    "images",
    "media",
    "uploads",
    "fonts",
    "icons",
    "migrations",
    "data",
    "db",
    "database",
    "logs",
    "log",
    "dump",
    "backups",
    "docs",
    "javadoc",
    "tools",
    "scripts",
    "config",
    "settings",
    "cmake-build-debug",
    "packages",
    "plugins",
    "examples",
    "samples",
  ]);
  const ignoreFiles = new Set([
    "*.exe",
    "*.dll",
    "*.so",
    "*.dylib",
    "*.bin",
    "*.iso",
    "*.img",
    "*.dmg",
    "*.zip",
    "*.tar",
    "*.gz",
    "*.rar",
    "*.7z",
    "*.bz2",
    "*.xz",
    "*.mp4",
    "*.mkv",
    "*.avi",
    "*.mov",
    "*.wmv",
    "*.flv",
    "*.webm",
    "*.mp3",
    "*.wav",
    "*.flac",
    "*.aac",
    "*.ogg",
    "*.wma",
    "*.jpg",
    "*.jpeg",
    "*.png",
    "*.gif",
    "*.bmp",
    "*.ico",
    "*.svg",
    "*.webp",
    "*.tiff",
    "*.pdf",
    "*.doc",
    "*.docx",
    "*.ppt",
    "*.pptx",
    "*.xls",
    "*.xlsx",
    "*.csv",
    "*.ttf",
    "*.otf",
    "*.woff",
    "*.woff2",
    "*.eot",
    "*.pyc",
    "*.pyo",
    "*.pyd",
    "*.class",
    "*.jar",
    "*.war",
    "*.ear",
    "*.o",
    "*.obj",
    "*.a",
    "*.lib",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    "tsconfig.json",
    "jsconfig.json",
    ".env",
    ".env.local",
    ".env.development",
    ".env.test",
    ".env.production",
    "*.log",
    "npm-debug.log",
    "yarn-debug.log",
    "yarn-error.log",
    "LICENSE",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "dockugen-windows.exe",
    "dokugen-linux",
    "dokugen-macos",
  ]);

  const results: string[] = [];

  const walk = async (currentDir: string) => {
    try {
      const list = await fs.readdir(currentDir);
      for (const file of list) {
        const fullPath = path.resolve(currentDir, file);
        const stat = await fs.stat(fullPath);
        const relativePath = path.relative(dir, fullPath);

        if (stat.isDirectory()) {
          if (!ignoreDirs.has(file)) {
            await walk(fullPath);
          }
        } else {
          let shouldIgnore = false;
          for (const pattern of ignoreFiles) {
            if (matchesIgnorePattern(file, pattern)) {
              shouldIgnore = true;
              break;
            }
          }
          if (!shouldIgnore && stat.size < 150 * 1024) {
            results.push(relativePath);
          }
        }
      }
    } catch (error) {
      console.error(chalk.red(`Failed to scan directory: ${currentDir}`));
    }
  };

  await walk(dir);
  return results;
};
