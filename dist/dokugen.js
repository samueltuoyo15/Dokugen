#!/usr/bin/env node

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const extractFullCode = (projectFiles, projectDir) => {
    let snippets = "";
    const importantFiles = projectFiles.filter(file => file.match(/\.(ts|js|Dockerfile|go|py|rs|c|cpp|h|hpp|java|kt|swift|php|rb)$/));
    importantFiles.forEach(file => {
        try {
            const content = fs_extra_1.default.readFileSync(path_1.default.join(projectDir, file), "utf-8");
            snippets += `\n### ${file}\n\`\`\`\n${content}\n\`\`\`\n`;
        }
        catch (err) {
            console.log(chalk_1.default.red(`❌ Failed to read ${file}`));
        }
    });
    return snippets || "No code snippets available";
};
const validateProjectLanguage = (projectDir) => {
    const files = fs_extra_1.default.readdirSync(projectDir);
    if (files.includes("package.json"))
        return "JavaScript/TypeScript";
    if (files.includes("requirements.txt") || files.includes("pyproject.toml"))
        return "Python";
    if (files.includes("go.mod"))
        return "Golang";
    if (files.includes("Cargo.toml"))
        return "Rust";
    if (files.includes("pom.xml") || files.includes("build.gradle"))
        return "Java";
    if (files.includes("index.html") || files.includes("src/App.tsx") || files.includes("src/App.jsx"))
        return "Frontend (React)";
    if (files.includes("next.config.ts") || files.includes("next.config.js") || files.includes("app/page.jsx") || files.includes("app/page.tsx"))
        return "Frontend (Next Js)";
    if (files.includes("src/App.vue"))
        return "Frontend (Vue Js)";
    return "Unknown";
};
const scanFiles = (dir, ignoreDir = ["node_modules", ".git", ".vscode", "package-lock.json", "dist"]) => {
    const files = [];
    const scan = (folder) => {
        fs_extra_1.default.readdirSync(folder, { withFileTypes: true }).forEach(file => {
            const fullPath = path_1.default.join(folder, file.name);
            if (file.isDirectory()) {
                if (!ignoreDir.includes(file.name))
                    scan(fullPath);
            }
            else {
                files.push(fullPath.replace(dir + "/", ""));
            }
        });
    };
    scan(dir);
    return files;
};
const askYesNo = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const answer = yield inquirer_1.default.prompt([
        {
            type: "list",
            name: "response",
            message,
            choices: ["Yes", "No"],
        },
    ]);
    return answer.response === "Yes";
});
const generateReadme = (projectType, projectFiles, projectDir) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(chalk_1.default.blue("😌 🔥 Generating README...."));
        const useDocker = yield askYesNo("Do you want to include Docker setup in the README?");
        const hasAPI = yield askYesNo("Does this project expose an API?");
        const hasDatabase = yield askYesNo("Does this project use a database?");
        const fullCode = extractFullCode(projectFiles, projectDir);
        console.log(chalk_1.default.blue("Analysing project files getting chunks....."));
        const response = yield axios_1.default.post("https://dokugen-proxy.vercel.app/generate-readme", {
            projectType,
            projectFiles,
            fullCode,
            options: { useDocker, hasAPI, hasDatabase },
        });
        return ((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.readme) || "Operation Failed";
    }
    catch (error) {
        console.log(chalk_1.default.red("❌ Error Generating README"), error);
        return "Failed to Generate README";
    }
});
commander_1.program.name("dokugen").version("1.0.0").description("Automatically generate high-quality README for your application");
commander_1.program.command("generate").description("Scan project and generate a high-quality README.md").action(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk_1.default.green("🦸 Generating README.md....."));
    const projectDir = process.cwd();
    const projectType = validateProjectLanguage(projectDir);
    const projectFiles = scanFiles(projectDir);
    const existingReadme = path_1.default.join(projectDir, "README.md");
    console.log(chalk_1.default.blue(`📂 Detected project type: ${projectType}`));
    console.log(chalk_1.default.yellow(`📂 Found: ${projectFiles.length} files in the project`));
    if (fs_extra_1.default.existsSync(existingReadme)) {
        const overwrite = yield askYesNo(chalk_1.default.red("🤯 Looks like a README file already exists. Overwrite?"));
        if (!overwrite)
            return console.log(chalk_1.default.yellow("👍 README was not modified."));
        fs_extra_1.default.unlinkSync(existingReadme);
        console.log(chalk_1.default.green("🗑️ Existing README has been deleted. Now generating..."));
    }
    const readmeContent = yield generateReadme(projectType, projectFiles, projectDir);
    fs_extra_1.default.writeFileSync(existingReadme, readmeContent);
    console.log(chalk_1.default.green("✅ README Generated Successfully"));
}));
commander_1.program.parse(process.argv);
