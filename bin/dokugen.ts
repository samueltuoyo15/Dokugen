#!/usr/bin/env node
import { program } from "commander"
import chalk from "chalk"
import fs from "fs-extra"
import * as path from "path"
import { select } from "@clack/prompts"
import figlet from "figlet"
import { createSpinner } from "nanospinner"
import { setTimeout as sleep } from "timers/promises"
import axios from "axios"
import { Readable } from "stream"
import { execSync } from "child_process"
import os from "os"
//@ts-ignore
import { detectProjectType } from "./projectDetect.mjs"

const API_TIMEOUT = 300000
let readmeBackup: string | null = null
let currentReadmePath: string = ""

const getUserInfo = (): { username: string, email?: string, osInfo: {platform: string, arch: string, release: string}} => {
  let gitName = ""
  let gitEmail = ""
  try {
    gitName = execSync("git config --get user.name", { encoding: "utf-8" }).trim() ?? ""
    gitEmail = execSync("git config --get user.email", { encoding: "utf-8" }).trim() ?? ""
    const osInfo = {
     platform: os.platform() || "unknown",
     arch: os.arch() || "unknown",
     release: os.release() || "unknown"
    } 
    if (gitName && gitEmail && osInfo) return { username: gitName, email: gitEmail, osInfo}
  } catch {
    console.log(chalk.yellow("⚠️ Git User Info not found. Using Defaults......"))
  }

  return { username: os.userInfo().username || "", email: process.env.USER || "", osInfo: {platform: "Unknown", arch: "Unknown", release: "Unknown"}}
}


const backupReadme = async (readmePath: string): Promise<void> => {
  try {
    if (await fs.pathExists(readmePath)) {
      currentReadmePath = readmePath
      readmeBackup = await fs.readFile(readmePath, "utf-8")
      console.log(chalk.green(`📝 [${new Date().toISOString()}] Current README backed up in memory`))
    }
  } catch (error) {
    console.error(chalk.red("❌ Failed to backup README:"), error)
  }
}

const restoreReadme = async (): Promise<string | null> => { 
  if (readmeBackup && currentReadmePath) {
    try {
      await fs.writeFile(currentReadmePath, readmeBackup)
      console.log(chalk.green("♻️ Original README content restored successfully"))
      return readmeBackup
    } catch (error) {
      console.error(chalk.red("❌ Failed to restore README:"), error)
      return null
    } finally {
      readmeBackup = null
      currentReadmePath = ""
    }
  } else {
    console.log(chalk.yellow("⚠️ No README backup available to restore"))
    return null
  }
}

const getGitRepoUrl = (): string | null => {
  try {
    const repoUrl = execSync("git config --get remote.origin.url", { encoding: "utf-8" }).trim()
    return repoUrl || null
  } catch {
    return null
  }
}

const extractFullCode = async (projectFiles: string[], projectDir: string): Promise<string> => {
  const fileGroups: Record<string, string[]> = {}
  
  projectFiles.forEach(file => {
    const dir = path.dirname(file)
    if (!fileGroups[dir]) fileGroups[dir] = []
    fileGroups[dir].push(file)
  })

  const snippets = await Promise.all(
    Object.entries(fileGroups).map(async ([dir, files]) => {
      const dirSnippets = await Promise.all(
        files.map(async file => {
          try {
            const filePath = path.resolve(projectDir, file)
            const stats = await fs.stat(filePath)
            const contentStream = fs.createReadStream(filePath, "utf-8")
            let content = ""
            for await (const chunk of contentStream) content += chunk

            return `### ${file}\n- **Path:** ${file}\n- **Size:** ${(stats.size / 1024).toFixed(2)} KB\n\`\`\`${path.extname(file).slice(1) || "txt"}\n${content}\n\`\`\`\n`
          } catch (error) {
            console.error(chalk.red(`❌ Failed to read file: ${file}`))
            console.error(error)
            return null
          }
        })
      )
      
      return `## ${dir}\n${dirSnippets.filter(Boolean).join("")}`
    })
  )
  return snippets.filter(Boolean).join("") || "No code snippets available"
}

const matchesIgnorePattern = (filename: string, pattern: string): boolean => {
  if (pattern.startsWith("*.")) {
    const ext = pattern.slice(1)
    return filename.endsWith(ext)
  }
  return filename === pattern
}

const loadGitignorePatterns = async (projectDir: string, ignoreDirs: Set<string>, ignoreFiles: Set<string>) => {
  const gitignorePath = path.join(projectDir, ".gitignore")

  if (!(await fs.pathExists(gitignorePath))) return

  const content = await fs.readFile(gitignorePath, "utf-8")
  const lines = content.split("\n")

  for (const line of lines) {
    const rule = line.trim()
    if (!rule || rule.startsWith("#")) continue 

    if (rule.endsWith("/")) {
      ignoreDirs.add(rule.replace(/\/$/, ""))
    } else if (rule.startsWith("*.")) {
      ignoreFiles.add(rule)
    } else {
      ignoreFiles.add(rule)
    }
  }

  console.log(chalk.gray(`📄 Parsed .gitignore → ${ignoreDirs.size} dirs, ${ignoreFiles.size} files will be ignored`))
}


const scanFiles = async (dir: string): Promise<string[]> => {
const ignoreDirs = new Set(["node_modules", "dependencies", "ajax", "public", "android", "ios", ".expo",".next", ".nuxt", ".svelte-kit", ".vercel", ".serverless", ".cache", "tests", "_tests_", "_test_", "__tests__", "coverage", "test", "spec", "cypress", "e2e", "dist", "build", "out", "bin", "obj", "lib", "target", "release", "debug", "artifacts", "generated", ".git", ".svn", ".hg", ".vscode", ".idea", ".vs", "venv", ".venv", "env", ".env", "virtualenv", "envs", "docs", "javadoc", "logs", "android", "ios", "windows", "linux", "macos", "web", ".dart_tool", ".gradle", ".mvn", ".npm", ".yarn", "tmp", "temp", "uploads", "public", "static", "assets", "images", "media", "migrations", "data", "db", "database", ".github", ".circleci", ".husky", "storage", "vendor", "cmake-build-debug", "packages", "plugins"])
const ignoreFiles = new Set(["*.exe", "*.mp4", "*.mp3", "*.bin", "*.so", "*.a", "*.dll", "*.pyc", "*.class", "*.o", "*.jar", "*.war", "*.ear", "*.apk", "*.ipa", "*.dylib", "*.lock", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Gemfile.lock", "CHANGELOG.md", "style.css", "main.css", "output.css", ".gitignore", ".npmignore", "tsconfig.json", "jest.config.js", "README.md", ".DS_Store", ".env", "Thumbs.db", "tsconfig.*", "*.iml", ".editorconfig", ".prettierrc*", ".eslintrc*", "*.log", "*.min.js", "*.min.css", "*.pdf", "*.jpg", "*.png", "*.gif", "*.svg", "*.ico", "*.woff", "*.woff2", "*.ttf", "*.eot", "*.mp3", "*.mp4", "*.zip", "*.tar", "*.gz", "*.rar", "*.7z", "*.sqlite", "*.db", "*.sublime-workspace", "*.sublime-project", "*.bak", "*.swp", "*.swo", "*.pid", "*.seed", "*.pid.lock"])
await loadGitignorePatterns(dir, ignoreDirs, ignoreFiles)
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
          if (!ignoreDirs.has(file.name)) {
            queue.push(fullPath)
          }
        } else {
          const shouldIgnore = [...ignoreFiles].some(pattern => 
            matchesIgnorePattern(file.name, pattern))
          
          if (!shouldIgnore) {
            files.push(fullPath.replace(`${dir}/`, ""))
          }
        }
      }
    } catch(error) {
      console.error(error)
    }
  }

  return files
}

const askYesNo = async (message: string): Promise<boolean | "cancel"> => {
  try{
  const response = await select({
    message,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
  })

  if (response === null) {
    console.log(chalk.yellow("⚠️ Readme Generation Cancelled"))
    return "cancel"
  }

  return response === "yes"
  } catch(error){
    console.error(chalk.yellow("⚠️ Readme Generation Cancelled"))
    return "cancel"
  }
}

const checkInternetConnection = async (): Promise<boolean> => {
  try {
    await axios.get("https://www.google.com", { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

const generateReadme = async (projectType: string, projectFiles: string[], projectDir: string, existingReadme?: string, templateUrl?: string): Promise<string | null> => {
  try {
    console.log(chalk.blue("🔍 Analyzing project files..."))
    const projectDir = process.cwd()
    const readmePath = path.join(projectDir, "README.md")
     
    let includeSetup = false
    let includeContributionGuideLine = false  
    
    if (!templateUrl) {
      const setupAnswer = await askYesNo("Do you want to include setup instructions in the README?")
      if (setupAnswer === "cancel") return null
      includeSetup = setupAnswer

      const contributionAnswer = await askYesNo("Include contribution guidelines in README?")
      if (contributionAnswer === "cancel") return null
      includeContributionGuideLine = contributionAnswer
    }
   
    const fullCode = await extractFullCode(projectFiles, projectDir)
    const userInfo = getUserInfo()
    const repoUrl = getGitRepoUrl()
  
    const spinner = createSpinner(chalk.blue("🔥 Generating README...")).start()
    const fileStream = fs.createWriteStream(readmePath)

     const getBackendDomain = await axios.get<{ domain: string }>("https://dokugen-readme.vercel.app/api/get-server-url")
     const backendDomain = getBackendDomain.data.domain

    const response = await axios.post(`${backendDomain}/api/generate-readme`, {
      projectType,
      projectFiles,
      fullCode,
      userInfo,
      options: { includeSetup, includeContributionGuideLine },
      existingReadme,
      repoUrl,
      templateUrl
    }, {
      responseType: "stream",
      timeout: API_TIMEOUT 
    })
    
    const responseStream = response.data as Readable 
    return new Promise((resolve, reject) => {
      let buffer = ""

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
        fileStream.end(async () => {
          spinner.success({ text: chalk.green("\n✅ README.md created successfully")})
          readmeBackup = null
          resolve(readmePath)
        })
      })
      
      fileStream.on("error", async (err) => {
        console.log(chalk.red("\n❌ Failed to write README"))
        spinner.error({ text: chalk.red("Failed to generate README") })
        const restoredContent = await restoreReadme()
        fileStream.end()
        reject(restoredContent || err)
      })

      responseStream.on("error", async (err: Error) => {
        console.log(chalk.red("\n❌ Error receiving stream data"))
         spinner.error({ text: chalk.red("Failed to generate README") })
        const restoredContent = await restoreReadme()
        reject(restoredContent || err)
      })
    })
  } catch(error: unknown) {
    console.error("\n Error Generating Readme", (error as any).response?.data || (error as any).message)
    const restoredContent = await restoreReadme()
    return restoredContent || null
  }
}

program.name("dokugen").version("3.9.0").description("Automatically generate high-quality README for your application")
program.command("generate").description("Scan project and generate a README.md").option("--no-overwrite", "Do not overwrite existing README.md, append new features instead").option("--template <url>", "use a custom GitHub repo readme file as a template to generate a concise and strict readme for your project").action(async (options) => {
     await sleep(50)
    console.log('\n\n' + chalk.hex('#000080')(figlet.textSync('DOKUGEN', { font: 'Small Slant', horizontalLayout: 'fitted' })) + '\n\n')
    const projectDir = process.cwd()
    const readmePath = path.join(projectDir, "README.md")
    const readmeExists = await fs.pathExists(readmePath)
    const connectionSpinner = createSpinner("🌐 Checking internet...").start()
    const hasGoodInternetConnection = await checkInternetConnection()
    connectionSpinner.stop()

    if(!hasGoodInternetConnection){
      const username = await getUserInfo()?.username
      return console.log(chalk.red(`Opps... ${username} kindly check your device or pc internet connection and try again.`))
    }
 
   if (readmeExists) {
      await backupReadme(readmePath)
    }
    
    try {
      if (options.template && !options.template.includes("github.com")) {
        console.log(chalk.red("❌ Invalid GitHub URL. Use format: https://github.com/user/repo/blob/main/README.md"))
        process.exit(1)
      }
      
      const projectType = await detectProjectType(projectDir)
      const scanSpinner = createSpinner("🔍 Scanning project files...").start()
      const projectFiles = await scanFiles(projectDir)
      scanSpinner.success({ text: chalk.yellow(`📂 Found: ${projectFiles.length} files in the project`) })

      console.log(chalk.blue(`📂 Detected project type: ${projectType}`))
   
      if (options.template) {
        if (readmeExists && !options.overwrite) {
          const existingContent = await fs.readFile(readmePath, "utf-8")
          await generateReadme(projectType, projectFiles, projectDir, existingContent, options.template)
        } else {
          await generateReadme(projectType, projectFiles, projectDir, undefined, options.template)
        }
        console.log(chalk.green("✅ README.md generated from template!"))
        return
      }

      if (readmeExists) {
        if (!options.overwrite) {
          const existingContent = await fs.readFile(readmePath, "utf-8")
          await generateReadme(projectType, projectFiles, projectDir, existingContent)
        } else {
          const overwrite = await askYesNo("README.md exists. Overwrite?")
          
          if (overwrite === true) {
            await generateReadme(projectType, projectFiles, projectDir)
          } else if (overwrite === false) {
            console.log(chalk.yellow("⚠️ README update skipped (user selected No)"))
            return
          } else if (overwrite === "cancel") {
            console.log(chalk.yellow("⚠️ README generation cancelled"))
            await restoreReadme()
            return
          }
        }
      } else {
        await generateReadme(projectType, projectFiles, projectDir)
      }
 
    } catch(error) {
      console.error(error)
      await restoreReadme()
      process.exit(1)
    }
})

program.command("compose-docker").description("Generate dockerfiles or docker compose for multiple services of your project").action(() => {
    console.log("testing coming soon.....")
  })

program.parse(process.argv)

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n⚠️ Process interrupted. Changes discarded"))
  process.exit(0)
})

process.on("unhandledRejection", () => {
  process.exit(1)
})