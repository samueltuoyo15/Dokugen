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
  "Qwik": {
    files: ["vite.config.ts"],
    packageJson: {
      dependencies: ["@builder.io/qwik"]
    }
  },
  "Analog": {
    packageJson: {
      dependencies: ["@analogjs/platform"]
    }
  },
  "SvelteKit": {
    files: ["svelte.config.js"],
    packageJson: {
      dependencies: ["@sveltejs/kit"]
    }
  },
  "Fresh": {
    files: ["fresh.gen.ts", "deno.json"],
    contents: [{
      file: "deno.json",
      keywords: ["fresh"]
    }]
  },
  "Hono": {
    packageJson: {
      dependencies: ["hono"]
    }
  },
  "tRPC": {
    packageJson: {
      dependencies: ["@trpc/server"]
    }
  },
  "Prisma": {
    files: ["prisma/schema.prisma"],
    packageJson: {
      dependencies: ["@prisma/client"]
    }
  },
  "DrizzleORM": {
    packageJson: {
      dependencies: ["drizzle-orm"]
    }
  },
  "TypeORM": {
    packageJson: {
      dependencies: ["typeorm"]
    }
  },
  "Sequelize": {
    packageJson: {
      dependencies: ["sequelize"]
    }
  },
  "PocketBase": {
    files: ["pb_data", "pb_migrations"],
  },
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

  "Wasm": {
    files: ["*.wasm"]
  },
  "Emscripten": {
    files: ["emcc"]
  },

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
  },

  // New Languages
  "Assembly": {
    files: ["*.asm", "*.s"]
  },
  "Visual Basic": {
    files: ["*.vb", "*.vbs"]
  },
  "CUDA": {
    files: ["*.cu", "*.cuh"]
  },
  "Fortran": {
    files: ["*.f90", "*.f95", "*.f03", "*.f"]
  },
  "COBOL": {
    files: ["*.cbl", "*.cob", "*.cpy"]
  },
  "Lisp": {
    files: ["*.lisp", "*.lsp"]
  },
  "Scheme": {
    files: ["*.scm", "*.ss"]
  },
  "Racket": {
    files: ["*.rkt"]
  },
  "Prolog": {
    files: ["*.pl", "*.pro"]
  },
  "Smalltalk": {
    files: ["*.st"]
  },
  "Ada": {
    files: ["*.adb", "*.ads"]
  },
  "Pascal": {
    files: ["*.pas", "*.pp"]
  },
  "Solidity": {
    files: ["*.sol"],
    packageJson: {
      devDependencies: ["hardhat", "truffle"]
    }
  },
  "Vyper": {
    files: ["*.vy"]
  },
  "Hack": {
    files: ["*.hh", ".hhconfig"]
  },
  "Haxe": {
    files: ["*.hx", "build.hxml"]
  },
  "Crystal": {
    files: ["shard.yml", "*.cr"]
  },

  // More JS Frameworks
  "Meteor": {
    files: [".meteor"],
    packageJson: { dependencies: ["meteor-node-stubs"] }
  },
  "Aurelia": {
    packageJson: {
      dependencies: ["aurelia-framework"]
    }
  },
  "Mithril": {
    packageJson: {
      dependencies: ["mithril"]
    }
  },
  "Alpine.js": {
    files: ["index.html"],
    contents: [{
      file: "index.html",
      keywords: ["alpinejs"]
    }]
  },
  "Lit": {
    packageJson: {
      dependencies: ["lit", "lit-element"]
    }
  },
  "Stencil": {
    files: ["stencil.config.ts"],
    packageJson: {
      dependencies: ["@stencil/core"]
    }
  },
  "Stimulus": {
    packageJson: {
      dependencies: ["@hotwired/stimulus"]
    }
  },
  "Turbo": {
    packageJson: {
      dependencies: ["@hotwired/turbo"]
    }
  },
  "Ember.js": {
    files: ["ember-cli-build.js"],
    packageJson: { dependencies: ["ember-cli"] }
  },
  "Backbone.js": {
    packageJson: { dependencies: ["backbone"] }
  },
  "Knockout": {
    packageJson: { dependencies: ["knockout"] }
  },
  "Polymer": {
    files: ["polymer.json"],
    packageJson: { dependencies: ["@polymer/polymer"] }
  },

  // Monorepo Tools
  "Nx": {
    files: ["nx.json"]
  },
  "Lerna": {
    files: ["lerna.json"]
  },
  "Turborepo": {
    files: ["turbo.json"]
  },
  "Rush": {
    files: ["rush.json"]
  },
  "Yarn Workspaces": {
    packageJson: {
      scripts: ["workspaces"]
    }
  },
  "PNPM Workspaces": {
    files: ["pnpm-workspace.yaml"]
  }
}

export const detectProjectType = async (projectDir: string): Promise<string> => {
  const detectedTypes: ProjectType[] = []

  // Check for Go projects via go.mod and source files
  const goModPath = path.join(projectDir, "go.mod")
  const goFiles = await fs.readdir(projectDir).catch(() => [])
  const hasGoFiles = goFiles.some(file => file.endsWith(".go"))

  if (await fs.pathExists(goModPath) || hasGoFiles) {
    const goModContent = await fs.readFile(goModPath, 'utf-8').catch(() => '')
    const mainGoContent = await fs.readFile(path.join(projectDir, 'main.go'), 'utf-8').catch(() => '')

    let goType = "Go"
    let confidence = await fs.pathExists(goModPath) ? 100 : 80

    // Detect Go frameworks from imports and go.mod
    const frameworks = {
      'github.com/gin-gonic/gin': 'Gin',
      'github.com/gorilla/mux': 'Gorilla Mux',
      'github.com/labstack/echo': 'Echo',
      'github.com/gofiber/fiber': 'Fiber',
      'github.com/go-chi/chi': 'Chi',
      'github.com/graphql-go/graphql': 'GraphQL',
      'github.com/grpc/grpc-go': 'gRPC',
      'gorm.io/gorm': 'GORM',
    }

    for (const [pkg, framework] of Object.entries(frameworks)) {
      if (goModContent.includes(pkg) || mainGoContent.includes(pkg)) {
        goType = `Go ${framework}`
        confidence += 10
      }
    }

    detectedTypes.push({
      type: goType,
      category: "backend",
      confidence: Math.min(confidence, 100)
    })
  }

  // Enhanced Node.js detection
  const packageJsonPath = path.join(projectDir, "package.json")
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath)
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    // Only detect Node.js if it's not a React app and has backend characteristics
    const isReactApp = deps["react"] || deps["next"] || deps["gatsby"] || deps["remix"];
    const isBackend = deps["express"] || deps["@nestjs/core"] || deps["fastify"] ||
      deps["koa"] || deps["hono"] || deps["@trpc/server"] ||
      packageJson.type === "module" || await fs.pathExists(path.join(projectDir, "server.js")) ||
      await fs.pathExists(path.join(projectDir, "app.js")) ||
      await fs.pathExists(path.join(projectDir, "index.js")) ||
      await fs.pathExists(path.join(projectDir, "src/server")) ||
      await fs.pathExists(path.join(projectDir, "src/api"));

    if (!isReactApp && isBackend) {
      let nodeType = "Node.js"
      if (deps["typescript"]) {
        nodeType = "TypeScript Node.js"
      }

      // Add frameworks to node type
      if (deps["express"]) {
        nodeType += " Express"
      } else if (deps["@nestjs/core"]) {
        nodeType += " NestJS"
      } else if (deps["fastify"]) {
        nodeType += " Fastify"
      } else if (deps["koa"]) {
        nodeType += " Koa"
      } else if (deps["hono"]) {
        nodeType += " Hono"
      } else if (deps["@trpc/server"]) {
        nodeType += " tRPC"
      }

      detectedTypes.push({
        type: nodeType,
        category: "backend",
        confidence: 95
      })
    }

    if (!isReactApp && isBackend) {
      let nodeType = "Node.js"
      if (deps["typescript"]) {
        nodeType = "TypeScript Node.js"
      }

      // Add frameworks to node type
      if (deps["express"]) {
        nodeType += " Express"
      } else if (deps["@nestjs/core"]) {
        nodeType += " NestJS"
      } else if (deps["fastify"]) {
        nodeType += " Fastify"
      } else if (deps["koa"]) {
        nodeType += " Koa"
      } else if (deps["hono"]) {
        nodeType += " Hono"
      } else if (deps["@trpc/server"]) {
        nodeType += " tRPC"
      }

      // Add ORM detection
      if (deps["@prisma/client"]) {
        nodeType += " + Prisma"
      }
      if (deps["typeorm"]) {
        nodeType += " + TypeORM"
      }
      if (deps["sequelize"]) {
        nodeType += " + Sequelize"
      }
      if (deps["drizzle-orm"]) {
        nodeType += " + DrizzleORM"
      }
      if (deps["mongoose"]) {
        nodeType += " + Mongoose"
      }

      detectedTypes.push({
        type: nodeType,
        category: "backend",
        confidence: 95
      })
    }
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

  // Enhanced Python detection with dependency analysis
  const requirementsPath = path.join(projectDir, "requirements.txt")
  const pipfilePath = path.join(projectDir, "Pipfile")
  const poetryPath = path.join(projectDir, "pyproject.toml")
  const condaPath = path.join(projectDir, "environment.yml")
  const pythonFiles = await fs.readdir(projectDir).catch(() => []).then(files => files.filter(f => f.endsWith(".py")))

  const isPythonProject = pythonFiles.length > 0 ||
    await fs.pathExists(requirementsPath) ||
    await fs.pathExists(pipfilePath) ||
    await fs.pathExists(poetryPath) ||
    await fs.pathExists(condaPath)

  if (isPythonProject) {
    let pythonType = "Python"
    let confidence = 90
    let frameworks: string[] = []

    // Read all possible dependency files
    const requirements = await fs.readFile(requirementsPath, 'utf-8').catch(() => '')
    const pipfile = await fs.readFile(pipfilePath, 'utf-8').catch(() => '')
    const pyproject = await fs.readFile(poetryPath, 'utf-8').catch(() => '')
    const condaEnv = await fs.readFile(condaPath, 'utf-8').catch(() => '')
    const mainPy = await fs.readFile(path.join(projectDir, 'main.py'), 'utf-8').catch(() => '')
    const appPy = await fs.readFile(path.join(projectDir, 'app.py'), 'utf-8').catch(() => '')

    const allDeps = requirements + pipfile + pyproject + condaEnv + mainPy + appPy

    // Framework detection with confidence scoring
    type FrameworkPattern = {
      name: string;
      score: number;
      files?: string[];
      imports?: string[];
    }

    const frameworkPatterns: Record<string, FrameworkPattern> = {
      'django': { name: 'Django', score: 15, files: ['manage.py', 'wsgi.py', 'asgi.py'] },
      'fastapi': { name: 'FastAPI', score: 15, imports: ['from fastapi import'] },
      'flask': { name: 'Flask', score: 15, imports: ['from flask import'] },
      'tornado': { name: 'Tornado', score: 15, imports: ['import tornado'] },
      'pyramid': { name: 'Pyramid', score: 15, imports: ['from pyramid.config import'] },
      'aiohttp': { name: 'AIOHTTP', score: 15, imports: ['import aiohttp'] },
      'sanic': { name: 'Sanic', score: 15, imports: ['from sanic import'] },
      'dash': { name: 'Dash', score: 10, imports: ['import dash'] },
      'streamlit': { name: 'Streamlit', score: 10, imports: ['import streamlit'] }
    }

    // Check framework dependencies and imports
    for (const [key, framework] of Object.entries(frameworkPatterns)) {
      if (allDeps.toLowerCase().includes(key)) {
        frameworks.push(framework.name)
        confidence += framework.score

        // Check for framework-specific files
        if (framework.files) {
          for (const file of framework.files) {
            if (await fs.pathExists(path.join(projectDir, file))) {
              confidence += 5
            }
          }
        }

        // Check for specific imports
        if (framework.imports) {
          for (const importStr of framework.imports) {
            if (allDeps.includes(importStr)) {
              confidence += 5
            }
          }
        }
      }
    }

    // Check for ORMs and other major libraries
    const libraries = {
      'sqlalchemy': 'SQLAlchemy',
      'peewee': 'Peewee',
      'tortoise': 'TortoiseORM',
      'mongoengine': 'MongoEngine',
      'pydantic': 'Pydantic',
      'celery': 'Celery',
      'pytest': 'PyTest',
      'numpy': 'NumPy',
      'pandas': 'Pandas',
      'tensorflow': 'TensorFlow',
      'torch': 'PyTorch'
    }

    for (const [lib, name] of Object.entries(libraries)) {
      if (allDeps.toLowerCase().includes(lib)) {
        frameworks.push(name)
        confidence += 5
      }
    }

    // Build final type string
    if (frameworks.length > 0) {
      pythonType = `Python ${frameworks.join(" + ")}`
    }

    detectedTypes.push({
      type: pythonType,
      category: frameworks.some(f => ['Django', 'FastAPI', 'Flask', 'Tornado', 'Pyramid', 'AIOHTTP', 'Sanic'].includes(f)) ? "backend" : "other",
      confidence: Math.min(confidence, 100)
    })
  }

  // Enhanced Ruby detection with Gemfile analysis
  const gemfilePath = path.join(projectDir, "Gemfile")
  const rubyFiles = await fs.readdir(projectDir).catch(() => []).then(files => files.filter(f => f.endsWith(".rb")))

  if (await fs.pathExists(gemfilePath) || rubyFiles.length > 0) {
    let rubyType = "Ruby"
    let confidence = 90
    let frameworks: string[] = []

    const gemfile = await fs.readFile(gemfilePath, 'utf-8').catch(() => '')
    const gemfileLock = await fs.readFile(path.join(projectDir, 'Gemfile.lock'), 'utf-8').catch(() => '')
    const configRu = await fs.readFile(path.join(projectDir, 'config.ru'), 'utf-8').catch(() => '')

    const allGems = gemfile + gemfileLock + configRu

    // Framework detection with confidence scoring
    type GemPattern = {
      name: string;
      score: number;
      files?: string[];
      requires?: string[];
    }

    const gemPatterns: Record<string, GemPattern> = {
      'rails': {
        name: 'Rails',
        score: 20,
        files: ['config/routes.rb', 'config/application.rb', 'app/controllers/application_controller.rb']
      },
      'sinatra': {
        name: 'Sinatra',
        score: 15,
        requires: ['require "sinatra"', "require 'sinatra'"]
      },
      'hanami': {
        name: 'Hanami',
        score: 15,
        files: ['config/environment.rb', 'apps/web/application.rb']
      },
      'grape': {
        name: 'Grape',
        score: 15,
        requires: ['require "grape"', "require 'grape'"]
      },
      'roda': {
        name: 'Roda',
        score: 15,
        requires: ['require "roda"', "require 'roda'"]
      }
    }

    // Check gem dependencies and files
    for (const [key, pattern] of Object.entries(gemPatterns)) {
      if (allGems.toLowerCase().includes(key)) {
        frameworks.push(pattern.name)
        confidence += pattern.score

        if (pattern.files) {
          for (const file of pattern.files) {
            if (await fs.pathExists(path.join(projectDir, file))) {
              confidence += 5
            }
          }
        }

        if (pattern.requires) {
          for (const req of pattern.requires) {
            if (allGems.includes(req)) {
              confidence += 5
            }
          }
        }
      }
    }

    // Check for popular Ruby gems
    const gems = {
      'devise': 'Devise',
      'activerecord': 'ActiveRecord',
      'sequel': 'Sequel',
      'mongoid': 'Mongoid',
      'sidekiq': 'Sidekiq',
      'rspec': 'RSpec',
      'minitest': 'Minitest',
      'capybara': 'Capybara',
      'webpacker': 'Webpacker',
      'stimulus': 'Stimulus',
      'turbo-rails': 'Turbo'
    }

    for (const [gem, name] of Object.entries(gems)) {
      if (allGems.toLowerCase().includes(gem)) {
        frameworks.push(name)
        confidence += 5
      }
    }

    // Build final type string
    if (frameworks.length > 0) {
      rubyType = `Ruby ${frameworks.join(" + ")}`
    }

    detectedTypes.push({
      type: rubyType,
      category: "backend",
      confidence: Math.min(confidence, 100)
    })
  }

  // Enhanced React detection
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath)
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    if (deps["react"]) {
      let reactType = "React"

      if (deps["@types/react"] || deps["typescript"]) {
        reactType = "TypeScript React"
      }

      if (deps["next"]) {
        reactType += " Next.js"
      } else if (deps["gatsby"]) {
        reactType += " Gatsby"
      } else if (deps["remix"]) {
        reactType += " Remix"
      }

      // Add major UI libraries
      if (deps["@mui/material"]) {
        reactType += " Material-UI"
      } else if (deps["@chakra-ui/react"]) {
        reactType += " Chakra UI"
      } else if (deps["antd"]) {
        reactType += " Ant Design"
      } else if (deps["@tailwindcss/react"]) {
        reactType += " Tailwind"
      }

      detectedTypes.push({
        type: reactType,
        category: "frontend",
        confidence: 95
      })
    }
  }

  // To Sort by confidence and return the most likely type
  // Check for monorepo structure
  const hasClientDir = await fs.pathExists(path.join(projectDir, "client"))
  const hasServerDir = await fs.pathExists(path.join(projectDir, "server"))
  const hasAppsDir = await fs.pathExists(path.join(projectDir, "apps"))
  const hasPackagesDir = await fs.pathExists(path.join(projectDir, "packages"))

  if ((hasClientDir && hasServerDir) || (hasAppsDir && hasPackagesDir)) {
    const clientTypes = []
    const serverTypes = []
    let isMonorepo = false

    if (hasClientDir && hasServerDir) {
      isMonorepo = true
      const clientResult = await detectProjectType(path.join(projectDir, "client"))
      const serverResult = await detectProjectType(path.join(projectDir, "server"))
      clientTypes.push(clientResult)
      serverTypes.push(serverResult)
    }

    if (hasAppsDir) {
      isMonorepo = true
      const appsDir = await fs.readdir(path.join(projectDir, "apps"))
      for (const app of appsDir) {
        const appType = await detectProjectType(path.join(projectDir, "apps", app))
        if (appType.toLowerCase().includes("react") || appType.toLowerCase().includes("vue") ||
          appType.toLowerCase().includes("angular") || appType.toLowerCase().includes("front")) {
          clientTypes.push(appType)
        } else {
          serverTypes.push(appType)
        }
      }
    }

    if (hasPackagesDir) {
      isMonorepo = true
      const packagesDir = await fs.readdir(path.join(projectDir, "packages"))
      for (const pkg of packagesDir) {
        const pkgType = await detectProjectType(path.join(projectDir, "packages", pkg))
        if (pkgType !== "Unknown") {
          if (pkgType.toLowerCase().includes("react") || pkgType.toLowerCase().includes("vue") ||
            pkgType.toLowerCase().includes("angular") || pkgType.toLowerCase().includes("front")) {
            clientTypes.push(pkgType)
          } else {
            serverTypes.push(pkgType)
          }
        }
      }
    }

    if (isMonorepo) {
      const uniqueClientTypes = [...new Set(clientTypes)].filter(t => t !== "Unknown")
      const uniqueServerTypes = [...new Set(serverTypes)].filter(t => t !== "Unknown")

      const clientStr = uniqueClientTypes.length ? `Client: ${uniqueClientTypes.join(" + ")}` : ""
      const serverStr = uniqueServerTypes.length ? `Server: ${uniqueServerTypes.join(" + ")}` : ""

      return `Monorepo [${[clientStr, serverStr].filter(Boolean).join(" | ")}]`
    }
  }

  if (detectedTypes.length > 0) {
    detectedTypes.sort((a, b) => b.confidence - a.confidence)
    return detectedTypes[0].type
  }

  return "Unknown"
}

const getCategory = (type: string): ProjectType["category"] => {
  const frontend = [
    "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "SolidJS", "Astro", "Remix", "Gatsby", "Hugo",
    "Jekyll", "Eleventy", "Docusaurus", "Qwik", "Analog", "SvelteKit", "Fresh", "Meteor", "Aurelia", "Mithril",
    "Alpine.js", "Lit", "Stencil", "Stimulus", "Turbo", "Ember.js", "Backbone.js", "Knockout", "Polymer"
  ]
  const backend = [
    "Express.js", "NestJS", "Fastify", "Koa", "Hono", "tRPC", "Django", "Flask", "FastAPI", "Ruby on Rails",
    "Sinatra", "Laravel", "Symfony", "Phoenix", "ASP.NET", "Spring Boot", "Micronaut", "Quarkus", "Go", "Rust",
    "Prisma", "DrizzleORM", "TypeORM", "Sequelize", "PocketBase", "Assembly", "Visual Basic", "CUDA", "Fortran",
    "COBOL", "Lisp", "Scheme", "Racket", "Prolog", "Smalltalk", "Ada", "Pascal", "Solidity", "Vyper", "Hack",
    "Haxe", "Julia", "Crystal"
  ]
  const mobile = ["React Native", "Flutter", "Ionic", "NativeScript", "Cordova", "Capacitor", "Xamarin"]
  const desktop = ["Electron", "Tauri", "Qt", "GTK", "WxWidgets"]
  const devops = [
    "Docker", "Kubernetes", "Terraform", "Serverless", "Ansible", "Pulumi", "Bazel", "Nx", "Lerna",
    "Turborepo", "Rush", "Yarn Workspaces", "PNPM Workspaces", "Make", "CMake", "Gradle", "Maven"
  ]

  if (frontend.some(t => type.includes(t))) return "frontend"
  if (backend.some(t => type.includes(t))) return "backend"
  if (mobile.some(t => type.includes(t))) return "mobile"
  if (desktop.some(t => type.includes(t))) return "desktop"
  if (devops.some(t => type.includes(t))) return "devops"
  return "other"
}