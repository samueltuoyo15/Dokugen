import fs from "fs-extra"
import path from "path"

type DetectionPattern = {
  files?: string[]
  folders?: string[]
  contents?: {
    file: string
    keywords: string[]
  }[]
  packageJson?: {
    dependencies?: string[]
    devDependencies?: string[]
    scripts?: string[]
  }
}

type ProjectType = {
  type: string
  category: 'frontend' | 'backend' | 'mobile' | 'desktop' | 'devops' | 'other'
  confidence: number
}

const detectionPatterns: Record<string, DetectionPattern> = {
  // JavaScript Frameworks
  "React": {
    files: ["src/App.jsx", "src/App.tsx", "src/index.jsx", "src/index.tsx"],
    folders: ["src/components"],
    packageJson: {
      dependencies: ["react"],
      devDependencies: ["react-scripts"]
    }
  },
  "Next.js": {
    files: ["next.config.js", "next.config.ts", "pages/_app.js", "pages/_app.tsx"],
    packageJson: {
      dependencies: ["next"]
    }
  },
  "Vue.js": {
    files: ["src/App.vue", "src/main.js", "src/main.ts", "vue.config.js"],
    packageJson: {
      dependencies: ["vue"]
    }
  },
  "Nuxt.js": {
    files: ["nuxt.config.js", "nuxt.config.ts"],
    packageJson: {
      dependencies: ["nuxt"]
    }
  },
  "Angular": {
    files: ["angular.json", "src/main.ts", "src/app/app.module.ts"],
    packageJson: {
      dependencies: ["@angular/core"]
    }
  },
  "Svelte": {
    files: ["svelte.config.js", "src/main.svelte", "src/App.svelte"],
    packageJson: {
      dependencies: ["svelte"]
    }
  },
  "SolidJS": {
    packageJson: {
      dependencies: ["solid-js"]
    }
  },
  "Astro": {
    files: ["astro.config.mjs"],
    packageJson: {
      dependencies: ["astro"]
    }
  },
  "Remix": {
    packageJson: {
      dependencies: ["@remix-run/react"]
    }
  },
  
  // Mobile Frameworks
  "React Native": {
    files: ["metro.config.js", "App.js", "App.tsx", "index.js", "index.tsx"],
    packageJson: {
      dependencies: ["react-native"]
    }
  },
  "Flutter": {
    files: ["pubspec.yaml", "lib/main.dart", "android/app/src/main/AndroidManifest.xml"]
  },
  "Ionic": {
    files: ["ionic.config.json"],
    packageJson: {
      dependencies: ["@ionic/core"]
    }
  },
  "NativeScript": {
    packageJson: {
      dependencies: ["nativescript"]
    }
  },
  "Cordova": {
    files: ["config.xml"],
    packageJson: {
      dependencies: ["cordova"]
    }
  },
  "Capacitor": {
    files: ["capacitor.config.json"],
    packageJson: {
      dependencies: ["@capacitor/core"]
    }
  },
  "Xamarin": {
    files: [".sln", ".csproj"]
  },
  
  // Backend Frameworks
  "Express.js": {
    files: ["app.js", "server.js", "index.js", "express.js"],
    packageJson: {
      dependencies: ["express"]
    }
  },
  "NestJS": {
    files: ["src/main.ts"],
    packageJson: {
      dependencies: ["@nestjs/core"]
    }
  },
  "Fastify": {
    packageJson: {
      dependencies: ["fastify"]
    }
  },
  "Koa": {
    packageJson: {
      dependencies: ["koa"]
    }
  },
  "Django": {
    files: ["manage.py", "requirements.txt", "settings.py"],
    folders: ["templates", "static"]
  },
  "Flask": {
    files: ["app.py", "requirements.txt", "wsgi.py"],
    contents: [{
      file: "app.py",
      keywords: ["Flask", "@app.route"]
    }]
  },
  "FastAPI": {
    files: ["main.py", "requirements.txt"],
    contents: [{
      file: "main.py",
      keywords: ["FastAPI"]
    }]
  },
  "Ruby on Rails": {
    files: ["Gemfile", "config.ru", "Rakefile"],
    contents: [{
      file: "Gemfile",
      keywords: ["rails"]
    }]
  },
  "Sinatra": {
    files: ["app.rb", "config.ru"],
    contents: [{
      file: "app.rb",
      keywords: ["Sinatra"]
    }]
  },
  "Laravel": {
    files: ["artisan", "server.php", "composer.json"],
    packageJson: {
      dependencies: ["laravel-mix"]
    }
  },
  "Symfony": {
    files: ["composer.json", "symfony.lock"],
    contents: [{
      file: "composer.json",
      keywords: ["symfony/framework-bundle"]
    }]
  },
  "Phoenix": {
    files: ["mix.exs"],
    contents: [{
      file: "mix.exs",
      keywords: ["phoenix"]
    }]
  },
  "ASP.NET": {
    files: [".csproj", "Program.cs", "Startup.cs"]
  },
  "Spring Boot": {
    files: ["pom.xml", "build.gradle", "src/main/resources/application.properties"]
  },
  "Micronaut": {
    files: ["build.gradle", "src/main/resources/application.yml"]
  },
  "Quarkus": {
    files: ["pom.xml", "src/main/resources/application.properties"]
  },
  
  // Programming Languages
  "JavaScript": {
    files: ["package.json", "index.js"]
  },
  "TypeScript": {
    files: ["tsconfig.json", "tsconfig.node.json"],
    packageJson: {
      devDependencies: ["typescript"]
    }
  },
  "Python": {
    files: ["requirements.txt", "pyproject.toml", "setup.py", "Pipfile"]
  },
  "Java": {
    files: ["pom.xml", "build.gradle", "src/main/java"]
  },
  "Kotlin": {
    files: ["build.gradle.kts", "src/main/kotlin"]
  },
  "Go": {
    files: ["go.mod", "go.sum", "main.go", "*.go"],
    contents: [{
      file: "go.mod",
      keywords: ["module"]
    }]
  },
  "Rust": {
    files: ["Cargo.toml", "Cargo.lock", "src/main.rs"]
  },
  "C": {
    files: ["makefile", "*.c", "*.h"]
  },
  "C++": {
    files: ["makefile", "*.cpp", "*.hpp"]
  },
  "C#": {
    files: [".csproj", "Program.cs", "*.cs"]
  },
  "PHP": {
    files: ["composer.json", "composer.lock", "index.php"]
  },
  "Ruby": {
    files: ["Gemfile", "Gemfile.lock", "config.ru", "*.rb"]
  },
  "Swift": {
    files: ["Package.swift", "*.swift"]
  },
  "Objective-C": {
    files: ["*.m", "*.h"]
  },
  "Dart": {
    files: ["pubspec.yaml", "*.dart"]
  },
  "Elixir": {
    files: ["mix.exs", "mix.lock"]
  },
  "Scala": {
    files: ["build.sbt", "project/build.properties"]
  },
  "Clojure": {
    files: ["project.clj", "deps.edn"]
  },
  "Haskell": {
    files: ["stack.yaml", "*.hs"]
  },
  "Perl": {
    files: ["Makefile.PL", "*.pl"]
  },
  "R": {
    files: ["DESCRIPTION", "*.R"]
  },
  "Julia": {
    files: ["Project.toml", "*.jl"]
  },
  "Lua": {
    files: ["*.lua"]
  },
  "Erlang": {
    files: ["rebar.config", "*.erl"]
  },
  "OCaml": {
    files: ["dune", "*.ml"]
  },
  "F#": {
    files: ["*.fs", "*.fsx"]
  },
  "Groovy": {
    files: ["build.gradle", "*.groovy"]
  },
  "D": {
    files: ["dub.json", "*.d"]
  },
  "Nim": {
    files: ["*.nim"]
  },
  "Zig": {
    files: ["build.zig", "*.zig"]
  },
  "V": {
    files: ["v.mod", "*.v"]
  },
  
  // Build Tools 
  "Docker": {
    files: ["Dockerfile", "docker-compose.yml"]
  },
  "Kubernetes": {
    folders: ["k8s", "kubernetes"],
    files: ["deployment.yaml", "service.yaml"]
  },
  "Terraform": {
    files: ["main.tf", "variables.tf", "terraform.tfvars"]
  },
  "Serverless": {
    files: ["serverless.yml", "serverless.js"]
  },
  "Ansible": {
    folders: ["roles"],
    files: ["playbook.yml"]
  },
  "Pulumi": {
    files: ["Pulumi.yaml", "Pulumi.dev.yaml"]
  },
  "Bazel": {
    files: ["WORKSPACE", "BUILD"]
  },
  "Make": {
    files: ["Makefile", "makefile"]
  },
  "CMake": {
    files: ["CMakeLists.txt"]
  },
  "Gradle": {
    files: ["build.gradle", "settings.gradle"]
  },
  "Maven": {
    files: ["pom.xml"]
  },
  "Webpack": {
    files: ["webpack.config.js", "webpack.config.ts"],
    packageJson: {
      devDependencies: ["webpack"]
    }
  },
  "Vite": {
    files: ["vite.config.js", "vite.config.ts"],
    packageJson: {
      devDependencies: ["vite"]
    }
  },
  "Rollup": {
    files: ["rollup.config.js"],
    packageJson: {
      devDependencies: ["rollup"]
    }
  },
  "Parcel": {
    files: [".parcelrc"],
    packageJson: {
      devDependencies: ["parcel"]
    }
  },
  "ESLint": {
    files: [".eslintrc.js", ".eslintrc.json"],
    packageJson: {
      devDependencies: ["eslint"]
    }
  },
  "Prettier": {
    files: [".prettierrc", ".prettierrc.js"],
    packageJson: {
      devDependencies: ["prettier"]
    }
  },
  "Babel": {
    files: ["babel.config.js", ".babelrc"],
    packageJson: {
      devDependencies: ["@babel/core"]
    }
  },
  
  // Desktop Frameworks
  "Electron": {
    files: ["electron-builder.json", "main.js"],
    packageJson: {
      dependencies: ["electron"]
    }
  },
  "Tauri": {
    files: ["src-tauri/tauri.conf.json"],
    packageJson: {
      dependencies: ["@tauri-apps/cli"]
    }
  },
  "Qt": {
    files: ["*.pro", "*.qml"]
  },
  "GTK": {
    files: ["Makefile.am", "configure.ac"]
  },
  "WxWidgets": {
    files: ["*.wxcp"]
  },
  
  // Testing Frameworks
  "Jest": {
    files: ["jest.config.js"],
    packageJson: {
      devDependencies: ["jest"]
    }
  },
  "Mocha": {
    files: ["mocha.opts"],
    packageJson: {
      devDependencies: ["mocha"]
    }
  },
  "Jasmine": {
    packageJson: {
      devDependencies: ["jasmine"]
    }
  },
  "Cypress": {
    folders: ["cypress"],
    packageJson: {
      devDependencies: ["cypress"]
    }
  },
  "Playwright": {
    folders: ["tests"],
    packageJson: {
      devDependencies: ["@playwright/test"]
    }
  },
  "Puppeteer": {
    packageJson: {
      devDependencies: ["puppeteer"]
    }
  },
  "Selenium": {
    files: ["requirements.txt"],
    contents: [{
      file: "requirements.txt",
      keywords: ["selenium"]
    }]
  },
  "Vitest": {
    packageJson: {
      devDependencies: ["vitest"]
    }
  },
  
  // Static Site Generators
  "Gatsby": {
    files: ["gatsby-config.js"],
    packageJson: {
      dependencies: ["gatsby"]
    }
  },
  "Hugo": {
    files: ["config.toml", "config.yaml"]
  },
  "Jekyll": {
    files: ["_config.yml"]
  },
  "Eleventy": {
    files: [".eleventy.js"],
    packageJson: {
      dependencies: ["@11ty/eleventy"]
    }
  },
  "Docusaurus": {
    files: ["docusaurus.config.js"],
    packageJson: {
      dependencies: ["@docusaurus/core"]
    }
  },
  
  // CMS
  "WordPress": {
    files: ["wp-config.php", "wp-content"]
  },
  "Strapi": {
    files: ["config/functions/bootstrap.js"],
    packageJson: {
      dependencies: ["strapi"]
    }
  },
  "Ghost": {
    files: ["config.production.json"]
  },
  "Directus": {
    packageJson: {
      dependencies: ["directus"]
    }
  },
  "Sanity": {
    files: ["sanity.json"],
    packageJson: {
      dependencies: ["@sanity/cli"]
    }
  },
  
  // Database
  "PostgreSQL": {
    files: ["init.sql", "*.pgsql"]
  },
  "MySQL": {
    files: ["*.sql"]
  },
  "MongoDB": {
    files: ["mongod.conf"]
  },
  "SQLite": {
    files: ["*.sqlite", "*.db"]
  },
  "Redis": {
    files: ["redis.conf"]
  },
  "Firebase": {
    files: ["firebase.json"],
    packageJson: {
      dependencies: ["firebase"]
    }
  },
  "Supabase": {
    files: ["supabase/config.toml"],
    packageJson: {
      dependencies: ["@supabase/supabase-js"]
    }
  },
  
  // GraphQL
  "GraphQL": {
    files: ["schema.graphql"],
    packageJson: {
      dependencies: ["graphql"]
    }
  },
  "Apollo": {
    packageJson: {
      dependencies: ["@apollo/client"]
    }
  },
  "Hasura": {
    files: ["metadata"]
  },
  
  // WebAssembly
  "Wasm": {
    files: ["*.wasm"]
  },
  "Emscripten": {
    files: ["emcc"]
  },
  
  // AI/ML
  "TensorFlow": {
    files: ["requirements.txt"],
    contents: [{
      file: "requirements.txt",
      keywords: ["tensorflow"]
    }]
  },
  "PyTorch": {
    files: ["requirements.txt"],
    contents: [{
      file: "requirements.txt",
      keywords: ["torch"]
    }]
  },
  "Keras": {
    files: ["requirements.txt"],
    contents: [{
      file: "requirements.txt",
      keywords: ["keras"]
    }]
  }
}

export const detectProjectType = async (projectDir: string): Promise<string> => {
  const detectedTypes: ProjectType[] = []
 
  const goModPath = path.join(projectDir, "go.mod")
  const goFiles = await fs.readdir(projectDir).catch(() => [])
  const hasGoFiles = goFiles.some(file => file.endsWith(".go"))
  
  if (await fs.pathExists(goModPath) || hasGoFiles) {
    detectedTypes.push({
      type: "Go",
      category: "backend",
      confidence: 100
    })
  }
  
 
  for (const [type, pattern] of Object.entries(detectionPatterns)) {
    if (type === "Go" && detectedTypes.some(t => t.type === "Go")) continue
    
    let confidence = 0
    
    // To check  for files first
    if (pattern.files) {
      for (const file of pattern.files) {
        // To Handle wildcard patterns
        if (file.includes("*")) {
          const files = await fs.readdir(projectDir).catch(() => [])
          if (files.some(f => new RegExp(file.replace("*", ".*")).test(f))) {
            confidence += 30
            break
          }
        } else if (await fs.pathExists(path.join(projectDir, file))) {
          confidence += 30
          break
        }
      }
    }
    
    // To check for  folders too
    if (pattern.folders) {
      for (const folder of pattern.folders) {
        if (await fs.pathExists(path.join(projectDir, folder))) {
          confidence += 20
          break
        }
      }
    }
    
    // To Check file contents 
    if (pattern.contents) {
      for (const contentCheck of pattern.contents) {
        const filePath = path.join(projectDir, contentCheck.file)
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, "utf-8")
          if (contentCheck.keywords.some(kw => content.includes(kw))) {
            confidence += 25
          }
        }
      }
    }
    
    // To Check package.json dependencies and scripts
    if (pattern.packageJson) {
      const packageJsonPath = path.join(projectDir, "package.json")
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath)
        
      
        if (pattern.packageJson.dependencies) {
          const deps = packageJson.dependencies || {}
          if (pattern.packageJson.dependencies.some(dep => deps[dep])) {
            confidence += 25
          }
        }
        

        if (pattern.packageJson.devDependencies) {
          const devDeps = packageJson.devDependencies || {}
          if (pattern.packageJson.devDependencies.some(dep => devDeps[dep])) {
            confidence += 15
          }
        }
        
    
        if (pattern.packageJson.scripts) {
          const scripts = packageJson.scripts || {}
          if (pattern.packageJson.scripts.some(script => scripts[script])) {
            confidence += 10
          }
        }
      }
    }
    
    if (confidence > 0) {
      detectedTypes.push({
        type,
        category: getCategory(type),
        confidence
      })
    }
  }
  
  // To Sort by confidence and return the most likely type
  if (detectedTypes.length > 0) {
    detectedTypes.sort((a, b) => b.confidence - a.confidence)
    return detectedTypes[0].type
  }
  
  return "Unknown"
}

const getCategory = (type: string): ProjectType["category"] => {
  const frontend = ["React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "SolidJS", "Astro", "Remix", "Gatsby", "Hugo", "Jekyll", "Eleventy", "Docusaurus"]
  const backend = ["Express.js", "NestJS", "Fastify", "Koa", "Django", "Flask", "FastAPI", "Ruby on Rails", "Sinatra", "Laravel", "Symfony", "Phoenix", "ASP.NET", "Spring Boot", "Micronaut", "Quarkus", "Go", "Rust"]
  const mobile = ["React Native", "Flutter", "Ionic", "NativeScript", "Cordova", "Capacitor", "Xamarin"]
  const desktop = ["Electron", "Tauri", "Qt", "GTK", "WxWidgets"]
  const devops = ["Docker", "Kubernetes", "Terraform", "Serverless", "Ansible", "Pulumi", "Bazel"]
  
  if (frontend.includes(type)) return "frontend"
  if (backend.includes(type)) return "backend"
  if (mobile.includes(type)) return "mobile"
  if (desktop.includes(type)) return "desktop"
  if (devops.includes(type)) return "devops"
  return "other"
}