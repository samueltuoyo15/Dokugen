  import { program } from "commander"
  import chalk from "chalk"
  import fs from "fs-extra"
  import path from "path"
  import inquirer from "inquirer"
  import axios from "axios"
 
 
  interface GenerateReadmeResponse {
  readme: string;
  }

  const extractFullCode = async (projectFiles: string[], projectDir: string): Promise<string> => {
    let snippets: string[] = []
    const importantFiles = projectFiles.filter(file => 
      file.match(/\.(ts|js|json|jsx|tsx|html|go|ejs|mjs|py|rs|c|cs|cpp|h|hpp|java|kt|swift|php|rb)$/)
    )
  
    const readPromises = importantFiles.map(async (file) => {
      const filePath = path.resolve(projectDir, file)
      if(!fs.existsSync(filePath)){
          return 
        }
      try {
        const content = await fs.promises.readFile(filePath, "utf-8")
        snippets.push(`\n### ${file}\n\`\`\`\n${content}\n\`\`\`\n`)
      } catch {}
      return content 
    })
    await Promise.all(readPromises)
    return snippets.length > 0 ? snippets.join("") : "No code snippets available"
  }
  
  const validateProjectLanguage = (projectDir: string) => {
    const files = fs.readdirSync(projectDir)
    const languages: string[] = []
    if (files.includes("go.mod")) languages.push("Golang")
    if (files.includes("requirements.txt") || files.includes("pyproject.toml")) languages.push("Python")
    if (files.includes("Cargo.toml")) languages.push("Rust")
    if (files.includes("package.json")) languages.push("JavaScript/TypeScript")
    if (files.includes("index.html") || files.includes("src/App.tsx") || files.includes("src/App.jsx")) languages.push("Frontend (React)")
    if (files.includes("pom.xml") || files.includes("build.gradle")) languages.push("Java")
    if (files.includes("next.config.ts") || files.includes("next.config.js") || files.includes("app/page.jsx") || files.includes("app/page.tsx")) languages.push("Frontend (Next Js)")
    if (files.includes("src/App.vue")) languages.push("Frontend (Vue Js)")
  
    if(languages.length === 0){
    return("Unknown please make sure u have a (e.g., package.json, go.mod, Cargo.toml, etc.)")
    }
    return languages.join(", ")
  }
  
  const scanFiles = (dir: string, ignoreDir: string[] = ["node_modules", ".git", ".vscode", ".next", "package-lock.json", "dist"]) => {
    const files: string[] = []
  
    const scan = (folder: string) => {
      try{
      fs.readdirSync(folder, { withFileTypes: true }).forEach(file => {
        const fullPath = path.join(folder, file.name)
        if (file.isDirectory()) {
          if (!ignoreDir.includes(file.name)) scan(fullPath)
        } else {
          files.push(fullPath.replace(dir + "/", ""))
        }
      })
    } catch(error){
      console.error(error)
    }
    }
    scan(dir)
    if(files.length === 0) {
     console.log(chalk.yellow("No files found in your project"))
     process.exit(0)
     }
    return files
  }
  
  const askYesNo = async (message: string): Promise<boolean> => {
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "response",
        message,
        choices: ["Yes", "No"],
      },
    ])
    return answer.response === "Yes"
  }
  
  const generateReadme = async (projectType: string, projectFiles: string[], projectDir: string): Promise<string> => {
    try {
      console.log(chalk.blue("Analysing project files getting chunks....."))
      
      const useDocker = await askYesNo("Do you want to include Docker setup in the README?")
      const hasAPI = await askYesNo("Does this project expose an API?")
      const hasDatabase = await askYesNo("Does this project use a database?")
  
      const fullCode = await extractFullCode(projectFiles, projectDir)
      
       console.log(chalk.blue("😌 🔥 Generating README...."))
      const response = await axios.post<GenerateReadmeResponse>("https://your-vercel-project.vercel.app/api/generate-readme", {
        projectType,
        projectFiles,
        fullCode,
        options: {useDocker, hasAPI, hasDatabase},
      })
      
      if (!response.data.readme) {
      console.log(chalk.red("❌ API did not return a README."))
      return "Operation Failed"
    }
      console.log(chalk.blue("Proxy Responded with 200 OK"))
      console.log(chalk.green("✅ README Generated Successfully"))
      return response.data.readme 
    } catch (error: any) {
      if (error?.message.includes("User force closed the prompt")) {
      console.error(chalk.yellow("⚠️  User interrupted the process. README may be incomplete."))
      return "README Generation Interrupted"
    }
    console.error(chalk.red("❌ Error Generating README: "), error)
    return "Failed to Generate README"
    }
  }
  
  program.name("dokugen").version("2.2.0").description("Automatically generate high-quality README for your application")
  
  program.command("generate").description("Scan project and generate a high-quality README.md").action(async () => {
      console.log(chalk.green("🦸 Generating README.md....."))
  
      const projectDir = process.cwd()
      const projectType = validateProjectLanguage(projectDir)
      const projectFiles = scanFiles(projectDir)
      const existingReadme = path.join(projectDir, "README.md")
  
      console.log(chalk.blue(`📂 Detected project type: ${projectType}`))
      console.log(chalk.yellow(`📂 Found: ${projectFiles.length} files in the project`))
       
      try{
      if (fs.existsSync(existingReadme)) {
        const overwrite = await askYesNo(chalk.red("🤯 Looks like a README file already exists. Overwrite?"))
        if (!overwrite) {
          console.log(chalk.yellow("👍 README was not modified."))
          return 
          }
        fs.unlinkSync(existingReadme)
        console.log(chalk.green("🗑️ Existing README has been deleted. Now generating..."))
      }
  
      const readmeContent = await generateReadme(projectType, projectFiles, projectDir)
      fs.writeFileSync(existingReadme, readmeContent)
       } catch(error){
        console.error(chalk.red("Error Writing File", error))
      }
    })
  
  program.parse(process.argv)
  

process.on("SIGINT", async () => {
  console.log(chalk.yellow("\n⚠️  Process interrupted. Any partial changes will be discarded"))
  process.exit(0);
})

process.on("unhandledRejection", (error) => {
  console.error(chalk.red("\n❌ Unhandled Rejection: "), error)
  process.exit(1)
})


