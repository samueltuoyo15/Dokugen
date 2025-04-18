#!/usr/bin/env node
import { program } from "commander"
import chalk from "chalk"
import fs from "fs-extra"
import * as path from "path"
import { select } from "@clack/prompts"
import axios from "axios"
import { Readable } from "stream"
import { execSync } from "child_process"
import os from "os"
//@ts-ignore
import { detectProjectType } from "./projectDetect.mjs"


let readmeBackup: string | null = null
let currentReadmePath: string = "" 

// function to get user info
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


// function to backup overwrited readme in memory 

const backupReadme = async (readmePath: string): Promise<void> => {
  if (await fs.pathExists(readmePath)) {
    readmeBackup = await fs.readFile(readmePath, 'utf-8')
  }
}

const restoreReadme = async (): Promise<void> => { 
  if (readmeBackup && currentReadmePath) {
    await fs.writeFile(currentReadmePath, readmeBackup)
    readmeBackup = null
    currentReadmePath = ""
  }
}

// function to fetch git repo
const getGitRepoUrl = (): string | null => {
  try {
    const repoUrl = execSync("git config --get remote.origin.url", { encoding: "utf-8" }).trim()
    return repoUrl || null
  } catch {
    return null
  }
}

// function to extract full codebase and format it like a json 
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

// function to scan detect files and exclude files which are irrelevant 
const scanFiles = async (dir: string): Promise<string[]> => {
  const ignoreDirs = new Set(["node_modules", "tests", "_tests_", "_test_", "dist", ".git", ".next", "coverage", "out", "test", "uploads", "docs", "build", ".vscode", ".idea", "logs", "public", "storage", "bin", "obj", "lib", "venv", "cmake-build-debug"])
  const ignoreFiles = new Set(["*.exe", "*.bin", "*.so", "*.a", "*.class", "*.o", "*.dll", "*.pyc", "CHANGELOG.md", "style.css", "main.css", "output.css", ".gitignore", ".npmignore", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "tsconfig.json", "jest.config.js", "README.md", "*.lock", ".DS_Store", ".env", "Thumbs.db", "tsconfig.*", "*.iml", ".editorconfig", ".prettierrc*", ".eslintrc*"])

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



// function to ask yes lr no if user want to include some certain things in their readme file
const askYesNo = async (message: string): Promise<boolean | 'cancel'> => {
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

// fubnction to check internet connection 
const checkInternetConnection = async (): Promise<boolean> => {
  try {
    await axios.get('https://www.google.com', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

//function to call my server to generate readme eith the expected payload am passing 
const generateReadme = async (projectType: string, projectFiles: string[], projectDir: string, existingReadme?: string, templateUrl?: string): Promise<string | null> => {
  try {
    const projectDir = process.cwd()
    const hasGoodInternetConnection = await checkInternetConnection()
    if(!hasGoodInternetConnection){
      const username = await getUserInfo()?.username
      console.log(chalk.red(`Opps... ${username} Check your device or pc internet connection and try again.`))
      return null
    }
    console.log(chalk.blue("🔍 Analyzing project files..."))
    
    let includeSetup = false
    let includeContributionGuideLine = false  
    
    if (!templateUrl) {
      const setupAnswer = await askYesNo("Do you want to include setup instructions in the README?")
      if (setupAnswer === 'cancel') return null
      includeSetup = setupAnswer

      const contributionAnswer = await askYesNo("Include contribution guidelines in README?")
      if (contributionAnswer === 'cancel') return null
      includeContributionGuideLine = contributionAnswer
    }

    
    const fullCode = await extractFullCode(projectFiles, projectDir)
    const userInfo = getUserInfo()
    const repoUrl = getGitRepoUrl()
    
    console.log(chalk.blue("🔥 Generating README..."))
    
    const readmePath = path.join(projectDir, "README.md")
    if(existingReadme === undefined){
      await backupReadme(readmePath)
    }
    const fileStream = fs.createWriteStream(readmePath)
    const response = await axios.post("https://dokugen-readme.onrender.com/api/generate-readme", {
      projectType,
      projectFiles,
      fullCode,
      userInfo,
      options: { includeSetup, includeContributionGuideLine },
      existingReadme,
      repoUrl,
      templateUrl
    }, {responseType: "stream"})
    
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
     
     const projectDir = process.cwd()
     const readmePath = path.join(projectDir, "README.md")
 
     responseStream.on("end", () => {
     fileStream.end(() => {
       console.log(chalk.green("\n✅ README.md created successfully"))
       readmeBackup = null
      resolve(readmePath)
      })
    })
      
      fileStream.on("error", async (err) => {
        console.log(chalk.red("\n❌ Failed to write README"))
        await restoreReadme()
        fileStream.end()
        reject(err)
      })

      responseStream.on("error", async (err: Error) => {
        console.log(chalk.red("\n❌ Error receiving stream data"))
        await restoreReadme()
        reject(err)
      })
    })
  } catch(error){
    console.error("\n Error Generating Readme", error)
    await restoreReadme()
    return null
  }
}

// Commander options version, name, flags e.t.c
program.name("dokugen").version("3.1.0").description("Automatically generate high-quality README for your application")
program.command("generate").description("Scan project and generate a README.md").option("--no-overwrite", "Do not overwrite existing README.md, append new features instead").option("--template <url>", "use a custom GitHub repo readme file as a template to generate a concise and strict readme for your project").action(async (options) => {
     try{
     const projectDir = process.cwd()
     const readmePath = path.join(projectDir, "README.md")
     const readmeExists = await fs.pathExists(readmePath)
     
     if (options.template && !options.template.includes('github.com')) {
          console.log(chalk.red("❌ Invalid GitHub URL. Use format: https://github.com/user/repo/blob/main/README.md"))
          process.exit(1)
       }
      const projectType = await detectProjectType(projectDir)
      const projectFiles = await scanFiles(projectDir)
      console.log(chalk.blue(`📂 Detected project type: ${projectType}`))
      console.log(chalk.yellow(`📂 Found: ${projectFiles.length} files in the project`))
   
     
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
          } else if (overwrite === 'cancel') {
            console.log(chalk.yellow("⚠️ README generation cancelled"))
            return
          }
        }
      } else {
        await generateReadme(projectType, projectFiles, projectDir)
      }

      console.log(chalk.green("✅ README.md created!"))
 
     } catch(error){
       console.error(error)
       process.exit(1)
     }
   })


program.parse(process.argv)

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n⚠️ Process interrupted. Changes discarded"))
  process.exit(0)
})

process.on("unhandledRejection", () => {
  process.exit(1)
})







