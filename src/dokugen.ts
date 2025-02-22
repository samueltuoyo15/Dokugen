import { program } from "commander"
import chalk from "chalk"
import fs from "fs-extra"
import * as path from "path"
import inquirer from "inquirer"
import axios from "axios"

interface GenerateReadmeResponse {
  readme: string
}

const extractFullCode = async (projectFiles: string[], projectDir: string): Promise<string> => {
  const snippets = await Promise.all(
    projectFiles
      .filter(file => file.match(/\.(ts|js|json|jsx|tsx|html|go|ejs|mjs|py|rs|c|cs|cpp|h|hpp|java|kt|swift|php|rb)$/))
      .map(async file => {
        try {
          const content = await fs.readFile(path.resolve(projectDir, file), "utf-8")
          const lines = content.split("\n").slice(0, 50).join("\n")
          const fileExtension = path.extname(file).substring(1) || "plain text"
          return `\n### ${file}\n\`\`\`${fileExtension}\n${lines}\n\`\`\`\n`
        } catch {
          return null
        }
      })
  )

  return snippets.filter(Boolean).join("") || "No code snippets available"
}

const validateProjectLanguage = async (projectDir: string): Promise<string> => {
  const files = await fs.readdir(projectDir)
  const languages: string[] = []

  const langMap = {
    "go.mod": "Golang",
    "requirements.txt": "Python",
    "pyproject.toml": "Python",
    "Cargo.toml": "Rust",
    "package.json": "JavaScript/TypeScript",
    "index.html": "Frontend (React)",
    "src/App.tsx": "Frontend (React)",
    "src/App.jsx": "Frontend (React)",
    "pom.xml": "Java",
    "build.gradle": "Java",
    "next.config.ts": "Frontend (Next.js)",
    "next.config.js": "Frontend (Next.js)",
    "app/page.jsx": "Frontend (Next.js)",
    "app/page.tsx": "Frontend (Next.js)",
    "src/App.vue": "Frontend (Vue.js)",
  }

  for (const file of files) {
    if (langMap[file as keyof typeof langMap]) languages.push(langMap[file as keyof typeof langMap])
  }

  return languages.length ? languages.join(", ") : "Unknown"
}

const scanFiles = async (dir: string, ignoreDirs = ["node_modules", "documentation", "out", "coverage", ".turbo", "test", "docs", "uploads", ".git", ".vscode", ".next", "dist"]): Promise<string[]> => {
  const files: string[] = []

  const scan = async (folder: string) => {
    try {
      const dirContents = await fs.readdir(folder, { withFileTypes: true })
      await Promise.all(
        dirContents.map(async file => {
          const fullPath = path.join(folder, file.name)
          if (file.isDirectory() && !ignoreDirs.includes(file.name)) {
            await scan(fullPath)
          } else if (file.isFile()) {
            files.push(fullPath.replace(`${dir}/`, ""))
          }
        })
      )
    } catch {}
  }

  await scan(dir)
  return files.length ? files : []
}

const checkDependency = async (filePath: string, keywords: string[]): Promise<boolean> => {
  try {
    const content = await fs.readFile(filePath, "utf-8")
    return keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))
  } catch {
    return false
  }
}

const detectProjectFeatures = async (projectFiles: string[], projectDir: string) => {
  const hasDocker = projectFiles.some(file => ["Dockerfile", "docker-compose.yml"].includes(file))

  const results = await Promise.all([
    checkDependency(path.join(projectDir, "package.json"), ["express", "fastify", "koa", "hapi"]),
    checkDependency(path.join(projectDir, "go.mod"), ["net/http", "gin-gonic", "fiber"]),
    checkDependency(path.join(projectDir, "Cargo.toml"), ["actix-web", "rocket"]),
    checkDependency(path.join(projectDir, "requirements.txt"), ["flask", "django", "fastapi"]),
    checkDependency(path.join(projectDir, "pyproject.toml"), ["flask", "django", "fastapi"]),
    checkDependency(path.join(projectDir, "pom.xml"), ["spring-boot", "jakarta.ws.rs"]),
    checkDependency(path.join(projectDir, "package.json"), ["mongoose", "sequelize", "typeorm", "pg", "mysql", "sqlite", "redis"]),
  ])

  return {
    hasDocker,
    hasAPI: results.slice(0, 6).some(Boolean),
    hasDatabase: results[6],
  }
}

const askYesNo = async (message: string): Promise<boolean> => {
  const { response } = await inquirer.prompt([{ type: "list", name: "response", message, choices: ["Yes", "No"] }])
  return response === "Yes"
}

const generateReadme = async (projectType: string, projectFiles: string[], projectDir: string): Promise<string> => {
  try {
    console.log(chalk.blue("🔍 Analyzing project files..."))
    const { hasDocker, hasAPI, hasDatabase } = await detectProjectFeatures(projectFiles, projectDir)

    const includeSetup = await askYesNo("Do you want to include setup instructions in the README?")
    const isOpenSource = await askYesNo("Include contribution guidelines in README?")

    const fullCode = await extractFullCode(projectFiles, projectDir)

    console.log(chalk.blue("🔥 Generating README..."))
    const { data } = await axios.post<GenerateReadmeResponse>("https://dokugen-ochre.vercel.app/api/generate-readme", {
      projectType,
      projectFiles,
      fullCode,
      options: { hasDocker, hasAPI, hasDatabase, includeSetup, isOpenSource },
    })

    console.log(chalk.green("✅ README Generated Successfully"))
    return data.readme || "Operation Failed"
  } catch {
    return "Failed"
  }
}

program.name("dokugen").version("2.4.0").description("Automatically generate high-quality README for your application")
program.command("generate").description("Scan project and generate a README.md").action(async () => {
  console.log(chalk.green("🦸 Generating README.md..."))

  const projectDir = process.cwd()
  const readmePath = path.join(projectDir, "README.md")

  if (await fs.pathExists(readmePath)) {
    const overwrite = await askYesNo("README.md already exists. Overwrite?")
    if (!overwrite) {
      console.log(chalk.yellow("⚠️ Skipping README generation"))
      return
    }
  }

  const projectType = await validateProjectLanguage(projectDir)
  const projectFiles = await scanFiles(projectDir)

  console.log(chalk.blue(`📂 Project Type: ${projectType}`))
  console.log(chalk.yellow(`📂 Found: ${projectFiles.length} files`))

  const readmeContent = await generateReadme(projectType, projectFiles, projectDir)
  await fs.writeFile(readmePath, readmeContent)
  console.log(chalk.green("✅ README.md created"))
})

program.parse(process.argv)

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n⚠️ Process interrupted. Changes discarded"))
  process.exit(0)
})

process.on("unhandledRejection", () => {
  process.exit(1)
})