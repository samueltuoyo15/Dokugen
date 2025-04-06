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

const detectProjectType = async (projectDir: string): Promise<string> => {
  const files = await fs.readdir(projectDir)

 const langMap: Record<string, string> = {
    "vite.config.ts": "React/Typescript (Vite + React)",
    "vite.config.js": "React/JavaScript (Vite + React)",
    "next.config.ts": "Next.js (Typescript)",
    "next.config.js": "Next.js (JavaScript)",
    "nuxt.config.ts": "Nuxt.js (Typescript)",
    "nuxt.config.js": "Nuxt.js (JavaScript)",
    "svelte.config.js": "Svelte",
    "angular.json": "Angular",
    "vue.config.js": "Vue.js",
    "src/main.tsx": "React/Typescript",
    "src/main.jsx": "React/JavaScript",
    "src/App.vue": "Vue.js",
    "src/main.svelte": "Svelte",
    "src/main.ts": "Typescript",
    "src/main.js": "JavaScript",
    "go.mod": "Golang",
    "Cargo.toml": "Rust",
    "requirements.txt": "Python",
    "pyproject.toml": "Python",
    "pom.xml": "Java (Maven)",
    "build.gradle": "Java (Gradle)",
    "composer.json": "PHP",
    "Gemfile": "Ruby",
    "package.json": "Node.js", 
    "pubspec.yaml": "Flutter/Dart",
    "android/build.gradle": "Android (Kotlin/Java)",
    "ios/Podfile": "iOS (Swift/Objective-C)",
    "Dockerfile": "Docker",
    "docker-compose.yml": "Docker Compose",
    "terraform.tf": "Terraform",
    "serverless.yml": "Serverless Framework",
    "k8s/deployment.yaml": "Kubernetes",
    "Makefile": "C/C++",
    "CMakeLists.txt": "C++",
    "Program.cs": "C# / .NET",
    "Main.kt": "Kotlin",
    "App.swift": "Swift",
    "metro.config.js": "React Native"
  }

  const folderChecks: Record<string, string> = {
    "src/components": "React/Typescript or React/JavaScript",
    "src/views": "Vue.js",
    "src/routes": "Svelte",
    "src/app": "Angular",
    "src/lib": "Svelte",
    "src/pages": "Next.js or Nuxt.js",
    "public": "Static Site (HTML/CSS/JS)",
    "dist": "Built Project",
  }


  const checkPackageJson = async (): Promise<string | null> => {
    const packageJsonPath = path.join(projectDir, "package.json")
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      }

      if (dependencies["react"]) return "React/JavaScript"
      if (dependencies["vue"]) return "Vue.js"
      if (dependencies["svelte"]) return "Svelte"
      if (dependencies["@angular/core"]) return "Angular"
      if (dependencies["next"]) return "Next.js"
      if (dependencies["nuxt"]) return "Nuxt.js"
      if (dependencies["react-native"]) return "React Native"
    }
    return null
  }

  const detectedFile = Object.keys(langMap).find(file => files.includes(file))
  if (detectedFile) return langMap[detectedFile]

   const detectedFolder = Object.keys(folderChecks).find(folder => 
   fs.pathExists(path.join(projectDir, folder)))
   if (detectedFolder) return folderChecks[detectedFolder]
  

  const packageJsonDetection = await checkPackageJson()
  if (packageJsonDetection) return packageJsonDetection


  return "Unknown"
}

const matchesIgnorePattern = (filename: string, pattern: string): boolean => {
  if (pattern.startsWith("*.")) {
    const ext = pattern.slice(1) 
    return filename.endsWith(ext)
  }
  return filename === pattern
}

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
          if (!ignoreDirs.has(file.name)) queue.push(fullPath)
        } else {
            const shouldIgnore = [...ignoreFiles].some(pattern => 
            matchesIgnorePattern(file.name, pattern))
          
          if (!shouldIgnore) {
            files.push(fullPath.replace(`${dir}/`, ""))
          }
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


const askYesNo = async (message: string): Promise<boolean> => {
  const response = await select({
    message,
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ],
  })

  if (response === null) {
    console.log(chalk.yellow("⚠️ No input received. Defaulting to No..."))
    return false
  }

  return response === "yes"
}


const generateReadme = async (projectType: string, projectFiles: string[], projectDir: string, existingReadme?: string, templateUrl?: string): Promise<string> => {
  try {
    console.log(chalk.blue("🔍 Analyzing project files..."))
    
    const includeSetup = await askYesNo("Do you want to include setup instructions in the README?")
    const includeContributionGuideLine = await askYesNo("Include contribution guidelines in README?")

    const fullCode = await extractFullCode(projectFiles, projectDir)
    const userInfo = getUserInfo()
    const repoUrl = getGitRepoUrl()
    
    console.log(chalk.blue("🔥 Generating README..."))
    
    const readmePath = path.join(projectDir, "README.md")
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
     
      
     responseStream.on("end", () => {
       fileStream.end(() => {
       console.log(chalk.green("\n✅ README.md created successfully"))
      resolve(readmePath)
      })
    })
      
      fileStream.on("error", (err) => {
        console.log(chalk.red("\n❌ Failed to write README"))
        fileStream.end()
        reject(err)
      })

      responseStream.on("error", (err: Error) => {
        console.log(chalk.red("\n❌ Error receiving stream data"))
        reject(err)
      })
    })
  } catch(error){
    console.error("\n Error Generating Readme", error)
    process.exit(1)
  }
}

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
     if (readmeExists) {
        if (options.overwrite === false || options.template) {
          const existingReadme = await fs.readFile(readmePath, "utf-8");
          await generateReadme(projectType, projectFiles, projectDir, existingReadme, options.template);
          console.log(chalk.green("✅ README.md has been successfully updated!!!"));
        } else {
          const overwrite = await askYesNo("README.md already exists. Overwrite?");
          if (overwrite) {
            await generateReadme(projectType, projectFiles, projectDir);
            console.log(chalk.green("✅ README.md has been successfully created"));
          }
        }
      } else {
        await generateReadme(projectType, projectFiles, projectDir);
        console.log(chalk.green("✅ README.md has been successfully created"));
      }
     } catch(error){
       console.error(error)
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