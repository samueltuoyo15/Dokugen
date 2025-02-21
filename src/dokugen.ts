import { program } from "commander"
import chalk from "chalk"
import * as fs from "fs-extra"
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
          return `\n### ${file}\n\`\`\`\n${content}\n\`\`\`\n`
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
    if (langMap[file]) languages.push(langMap[file])
  }

  return languages.length ? languages.join(", ") : "Unknown (Ensure your project has key files like package.json, go.mod, etc.)"
}

const scanFiles = async (dir: string, ignoreDirs = ["node_modules", ".git", ".vscode", ".next", "package-lock.json", "dist"]): Promise<string[]> => {
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

  const dependencyChecks = [
    checkDependency(path.join(projectDir, "package.json"), ["express", "fastify", "koa", "hapi"]),
    checkDependency(path.join(projectDir, "go.mod"), ["net/http", "gin-gonic", "fiber"]),
    checkDependency(path.join(projectDir, "Cargo.toml"), ["actix-web", "rocket"]),
    checkDependency(path.join(projectDir, "requirements.txt"), ["flask", "django", "fastapi"]),
    checkDependency(path.join(projectDir, "pyproject.toml"), ["flask", "django", "fastapi"]),
    checkDependency(path.join(projectDir, "pom.xml"), ["spring-boot", "jakarta.ws.rs"]),
    checkDependency(path.join(projectDir, "package.json"), ["mongoose", "sequelize", "typeorm", "pg", "mysql", "sqlite", "redis"]),
    checkDependency(path.join(projectDir, "go.mod"), ["gorm.io/gorm", "database/sql", "pgx"]),
    checkDependency(path.join(projectDir, "Cargo.toml"), ["diesel", "sqlx", "redis"]),
    checkDependency(path.join(projectDir, "requirements.txt"), ["sqlalchemy", "psycopg2", "pymongo", "redis"]),
    checkDependency(path.join(projectDir, "pyproject.toml"), ["sqlalchemy", "psycopg2", "pymongo", "redis"]),
    checkDependency(path.join(projectDir, "pom.xml"), ["spring-data", "jdbc", "hibernate"]),
  ]

  const results = await Promise.all(dependencyChecks)

  return {
    hasDocker,
    hasAPI: results.slice(0, 6).some(Boolean),
    hasDatabase: results.slice(6).some(Boolean),
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
    const isOpenSource = await askYesNo("Include contribution guidelines in README?")
    const fullCode = await extractFullCode(projectFiles, projectDir)

    console.log(chalk.blue("🔥 Generating README..."))
    const { data } = await axios.post<GenerateReadmeResponse>("https://dokugen-ochre.vercel.app/api/generate-readme", {
      projectType, projectFiles, fullCode, options: { hasDocker, hasAPI, hasDatabase, isOpenSource },
    })

    console.log(chalk.green("✅ README Generated Successfully"))
    return data.readme || "Operation Failed"
  } catch {
    return "Failed to Generate README"
  }
}

program.name("dokugen").version("2.2.0").description("Automatically generate high-quality README for your application")

program.command("generate").description("Scan project and generate a README.md").action(async () => {
  console.log(chalk.green("🦸 Generating README.md..."))

  const projectDir = process.cwd()
  const projectType = await validateProjectLanguage(projectDir)
  const projectFiles = await scanFiles(projectDir)
  const existingReadme = path.join(projectDir, "README.md")

  console.log(chalk.blue(`📂 Project Type: ${projectType}`))
  console.log(chalk.yellow(`📂 Found: ${projectFiles.length} files`))

  if (await fs.pathExists(existingReadme) && !(await askYesNo("🤯 README exists. Overwrite?"))) return

  await fs.remove(existingReadme)
  console.log(chalk.green("🗑️ Deleted existing README. Now generating..."))

  const readmeContent = await generateReadme(projectType, projectFiles, projectDir)
  await fs.writeFile(existingReadme, readmeContent)
})

program.parse(process.argv)

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n⚠️  Process interrupted. Changes discarded"))
  process.exit(0)
})

process.on("unhandledRejection", () => process.exit(1))