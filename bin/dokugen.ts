#!/usr/bin/env node
import { program } from "commander"
import chalk from "chalk"
import fs from "fs-extra"
import * as path from "path"
import inquirer from "inquirer"
import axios from "axios"
import { Readable } from "stream"
import { execSync } from "child_process"
import os from "os"

const getUserInfo = (): { username: string, email?: string } => {
  try {
    const gitName = execSync("git config --get user.name", { encoding: "utf-8" }).trim()
    const gitEmail = execSync("git config --get user.email", { encoding: "utf-8" }).trim()
    if (gitName && gitEmail) return { username: gitName, email: gitEmail }
  } catch {}

  return { username: os.userInfo().username || "Unknown", email: process.env.USER || "Unknown" }
}

const extractFullCode = async (projectFiles: string[], projectDir: string): Promise<string> => {
  const snippets = await Promise.all(
    projectFiles
      .filter(file => file.match(/\.(ts|js|json|jsx|tsx|html|go|ejs|mjs|py|rs|c|cs|cpp|h|hpp|java|kt|swift|php|rb|dart|scala|lua|sh|bat|asm|vb|cshtml|razor|m)$/))
      .map(async file => {
        try {
          const contentStream = fs.createReadStream(path.resolve(projectDir, file), "utf-8")
          let content = ""
          for await (const chunk of contentStream) content += chunk
          return `## ${file}\n\`\`\`${path.extname(file).slice(1) || "txt"}\n${content}\n\`\`\`\n`
        } catch(error){
          console.error(error)
          return null
        }
      })
  )

  return snippets.filter(Boolean).join("") || "No code snippets available"
}

const detectProjectType = async (projectDir: string): Promise<string> => {
  const files = await fs.readdir(projectDir)
  const isFullStackNext = files.includes("pages") || files.some(f => f.startsWith("app/") || f.startsWith("api/"))

  const langMap: Record<string, string> = {
    "go.mod": "Golang",
    "requirements.txt": "Python",
    "pyproject.toml": "Python",
    "Cargo.toml": "Rust",
    "package.json": isFullStackNext ? "Next.js (Full Stack)" : "JavaScript/TypeScript",
    "src/App.tsx": "Frontend (React)",
    "src/App.jsx": "Frontend (React)",
    "pom.xml": "Java",
    "build.gradle": "Java",
    "next.config.ts": "Next.js",
    "next.config.js": "Next.js",
    "src/App.vue": "Vue.js",
    "pubspec.yaml": "Flutter/Dart",
    "Makefile": "C/C++",
    "Dockerfile": "Docker",
    "Program.cs": "C# / .NET",
    "Main.kt": "Kotlin",
    "App.swift": "Swift",
    "CMakeLists.txt": "C++"
  }

  const detected = Object.keys(langMap).find(file => files.includes(file))
  return detected ? langMap[detected] : "Unknown"
}

const scanFiles = async (dir: string): Promise<string[]> => {
  const ignoreDirs = new Set(["node_modules", "dist", ".git", ".next", "coverage", "out", "test", "uploads", "docs", "build", ".vscode", ".idea", "logs", "public", "storage", "bin", "obj", "lib", "venv", "cmake-build-debug"])
  const ignoreFiles = new Set(["CHANGELOG.md", "style.css", "main.css", "output.css", ".gitignore", ".npmignore", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "tsconfig.json", "jest.config.js", "README.md", "*.lock", ".DS_Store", ".env", "Thumbs.db", "tsconfig.*", "*.iml", ".editorconfig", ".prettierrc*", ".eslintrc*"])

  const files: string[] = []
  const queue: string[] = [dir]

  while (queue.length) {
    const folder = queue.shift()
    if (!folder) continue

    try {
      const dirContents = await fs.readdir(folder, { withFileTypes: true })
      for (const file of dirContents) {
        const fullPath = path.join(folder, file.name)
        if (file.isDirectory()) {
          if (!ignoreDirs.has(file.name)) queue.push(fullPath)
        } else if (![...ignoreFiles].some(ext => file.name.endsWith(ext))) {
          files.push(fullPath.replace(`${dir}/`, ""))
        }
      }
    } catch(error){
      console.error(error)
    }
  }

  return files
}

const checkDependency = async (filePath: string, keywords: string[]): Promise<boolean> => {
  try {
    const content = await fs.readFile(filePath, "utf-8")
    return keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))
  } catch (error: any){
    if(error.code === "ENOENT") return false 
    console.error(error)
    return false
  }
}

const detectProjectFeatures = async (projectFiles: string[], projectDir: string) => {
  const hasDocker = projectFiles.some(file => ["Dockerfile", "docker-compose.yml"].includes(file))

  const results = await Promise.all([
    checkDependency(path.join(projectDir, "package.json"), ["express", "fastify", "koa"]),
    checkDependency(path.join(projectDir, "go.mod"), ["net/http", "gin-gonic", "fiber"]),
    checkDependency(path.join(projectDir, "Cargo.toml"), ["actix-web", "rocket"]),
    checkDependency(path.join(projectDir, "requirements.txt"), ["flask", "django", "fastapi"]),
    checkDependency(path.join(projectDir, "pyproject.toml"), ["flask", "django", "fastapi"]),
    checkDependency(path.join(projectDir, "pom.xml"), ["spring-boot", "jakarta.ws.rs"]),
    checkDependency(path.join(projectDir, "package.json"), ["mongoose", "sequelize", "typeorm", "pg", "mysql", "sqlite"])
  ])

  return {
    hasDocker,
    hasAPI: results.slice(0, 6).some(Boolean),
    hasDatabase: results[6]
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
    const userInfo = getUserInfo()
    
    console.log(chalk.blue("🔥 Generating README..."))
    
    const readmePath = path.join(projectDir, "README.md")
    const fileStream = fs.createWriteStream(readmePath)
    const response = await axios.post("https://dokugen-readme.vercel.app/api/generate-readme", {
      projectType,
      projectFiles,
      fullCode,
      userInfo,
      options: { hasDocker, hasAPI, hasDatabase, includeSetup, isOpenSource }
    }, {responseType: "stream"})
    
    const responseStream = response.data as Readable 
    return new Promise((resolve, reject) => {
      let buffer = "";

      responseStream.on("data", (chunk: Buffer) => {
        buffer += chunk.toString()

       const lines = buffer.split("\n")
        buffer = lines.pop() || ""
        lines.forEach((line) => {
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.replace("data: ", "").trim())
              if (json.response && typeof json.response === "string") {
                fileStream.write(json.response)
              }
            } catch (error) {
              console.error("Skipping invalid event data:", line)
            }
          }
        })
      })
     
      
     responseStream.on("end", () => {
       fileStream.end(() => {
       console.log(chalk.green("\n✅ README.md created successfully"))
      resolve(readmePath)
      })
    })
      
      fileStream.on("error", (err) => {
        console.log(chalk.red("\n❌ Failed to write README"))
        reject(err)
      })

      responseStream.on("error", (err: Error) => {
        console.log(chalk.red("\n❌ Error receiving stream data"))
        reject(err)
      })
    })
  } catch {
    console.error("\n Error Generating Readme")
    process.exit(1)
  }
}

program.name("dokugen").version("2.9.7").description("Automatically generate high-quality README for your application")

program.command("generate").description("Scan project and generate a README.md").action(async () => {
    const projectDir = process.cwd()
    const readmePath = path.join(projectDir, "README.md")

    if (await fs.pathExists(readmePath)) {
      const overwrite = await askYesNo("README.md already exists. Overwrite?")
      if (!overwrite) return
    }

    const projectType = await detectProjectType(projectDir)
    const projectFiles = await scanFiles(projectDir)
    const readmeContent = await generateReadme(projectType, projectFiles, projectDir)
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


