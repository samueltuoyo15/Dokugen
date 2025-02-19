#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import axios from "axios";
const extractFullCode = (projectFiles, projectDir) => {
    let snippets = "";
    const importantFiles = projectFiles.filter(file => file.match(/\.(ts|js|go|py|rs|c|cpp|h|hpp|java|kt|swift|php|rb)$/));
    importantFiles.forEach(file => {
        try {
            const content = fs.readFileSync(path.join(projectDir, file), "utf-8");
            snippets += `\n### ${file}\n\`\`\`\n${content}\n\`\`\`\n`;
        }
        catch (error) {
            console.log(chalk.red(`❌ Failed to read ${file} ${error}`));
        }
    });
    return snippets || "No code snippets available";
};
const validateProjectLanguage = (projectDir) => {
    const files = fs.readdirSync(projectDir);
    if (files.includes("go.mod"))
        return "Golang";
    if (files.includes("requirements.txt") || files.includes("pyproject.toml"))
        return "Python";
    if (files.includes("Cargo.toml"))
        return "Rust";
    if (files.includes("package.json"))
        return "JavaScript/TypeScript";
    if (files.includes("index.html") || files.includes("src/App.tsx") || files.includes("src/App.jsx"))
        return "Frontend (React)";
    if (files.includes("pom.xml") || files.includes("build.gradle"))
        return "Java";
    if (files.includes("next.config.ts") || files.includes("next.config.js") || files.includes("app/page.jsx") || files.includes("app/page.tsx"))
        return "Frontend (Next Js)";
    if (files.includes("src/App.vue"))
        return "Frontend (Vue Js)";
    return "Unknown";
};
const scanFiles = (dir, ignoreDir = ["node_modules", ".git", ".vscode", "package-lock.json", "dist"]) => {
    const files = [];
    const scan = (folder) => {
        try {
            fs.readdirSync(folder, { withFileTypes: true }).forEach(file => {
                const fullPath = path.join(folder, file.name);
                if (file.isDirectory()) {
                    if (!ignoreDir.includes(file.name))
                        scan(fullPath);
                }
                else {
                    files.push(fullPath.replace(dir + "/", ""));
                }
            });
        }
        catch (error) {
            console.error(error);
        }
    };
    scan(dir);
    return files;
};
const askYesNo = async (message) => {
    const answer = await inquirer.prompt([
        {
            type: "list",
            name: "response",
            message,
            choices: ["Yes", "No"],
        },
    ]);
    return answer.response === "Yes";
};
const generateReadme = async (projectType, projectFiles, projectDir) => {
    try {
        console.log(chalk.blue("😌 🔥 Generating README...."));
        const useDocker = await askYesNo("Do you want to include Docker setup in the README?");
        const hasAPI = await askYesNo("Does this project expose an API?");
        const hasDatabase = await askYesNo("Does this project use a database?");
        const fullCode = extractFullCode(projectFiles, projectDir);
        console.log(chalk.blue("Analysing project files getting chunks....."));
        const response = await axios.post("https://dokugen-proxy.vercel.app/generate-readme", {
            projectType,
            projectFiles,
            fullCode,
            options: { useDocker, hasAPI, hasDatabase },
        });
        if (response?.data?.readme) {
            console.log(chalk.blue("Proxy Responded with 200 OK"));
            return response.data.readme;
        }
        return "Operation Failed";
    }
    catch (error) {
        console.log(chalk.red("❌ Error Generating README"), error);
        return "Failed to Generate README";
    }
};
program.name("dokugen").version("2.1.0").description("Automatically generate high-quality README for your application");
program.command("generate").description("Scan project and generate a high-quality README.md").action(async () => {
    console.log(chalk.green("🦸 Generating README.md....."));
    const projectDir = process.cwd();
    const projectType = validateProjectLanguage(projectDir);
    const projectFiles = scanFiles(projectDir);
    const existingReadme = path.join(projectDir, "README.md");
    console.log(chalk.blue(`📂 Detected project type: ${projectType}`));
    console.log(chalk.yellow(`📂 Found: ${projectFiles.length} files in the project`));
    try {
        if (fs.existsSync(existingReadme)) {
            const overwrite = await askYesNo(chalk.red("🤯 Looks like a README file already exists. Overwrite?"));
            if (!overwrite)
                return console.log(chalk.yellow("👍 README was not modified."));
            fs.unlinkSync(existingReadme);
            console.log(chalk.green("🗑️ Existing README has been deleted. Now generating..."));
        }
        const readmeContent = await generateReadme(projectType, projectFiles, projectDir);
        fs.writeFileSync(existingReadme, readmeContent);
        console.log(chalk.green("✅ README Generated Successfully"));
    }
    catch (error) {
        console.error(chalk.red("Error Writing File", error));
    }
});
program.parse(process.argv);
process.on("SIGINT", async () => {
    console.log(chalk.yellow("\n⚠️  Process interrupted. Cleaning up..."));
    process.exit(0);
});
process.on("unhandledRejection", (error) => {
    console.error(chalk.red("\n❌ Unhandled Rejection: "), error);
    process.exit(1);
});
