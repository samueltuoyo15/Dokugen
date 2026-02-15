import os
import json
import glob

detection_patterns = {
    "Qwik": {"files": ["vite.config.ts"], "packageJson": {"dependencies": ["@builder.io/qwik"]}},
    "Analog": {"packageJson": {"dependencies": ["@analogjs/platform"]}},
    "SvelteKit": {"files": ["svelte.config.js"], "packageJson": {"dependencies": ["@sveltejs/kit"]}},
    "Fresh": {"files": ["fresh.gen.ts", "deno.json"], "contents": [{"file": "deno.json", "keywords": ["fresh"]}]},
    "Hono": {"packageJson": {"dependencies": ["hono"]}},
    "tRPC": {"packageJson": {"dependencies": ["@trpc/server"]}},
    "Prisma": {"files": ["prisma/schema.prisma"], "packageJson": {"dependencies": ["@prisma/client"]}},
    "DrizzleORM": {"packageJson": {"dependencies": ["drizzle-orm"]}},
    "TypeORM": {"packageJson": {"dependencies": ["typeorm"]}},
    "Sequelize": {"packageJson": {"dependencies": ["sequelize"]}},
    "PocketBase": {"files": ["pb_data", "pb_migrations"]},
    "React": {"files": ["src/App.jsx", "src/App.tsx", "src/index.jsx", "src/index.tsx"], "folders": ["src/components"], "packageJson": {"dependencies": ["react"], "devDependencies": ["react-scripts"]}},
    "Next.js": {"files": ["next.config.js", "next.config.ts", "pages/_app.js", "pages/_app.tsx"], "packageJson": {"dependencies": ["next"]}},
    "Vue.js": {"files": ["src/App.vue", "src/main.js", "src/main.ts", "vue.config.js"], "packageJson": {"dependencies": ["vue"]}},
    "Nuxt.js": {"files": ["nuxt.config.js", "nuxt.config.ts"], "packageJson": {"dependencies": ["nuxt"]}},
    "Angular": {"files": ["angular.json", "src/main.ts", "src/app/app.module.ts"], "packageJson": {"dependencies": ["@angular/core"]}},
    "Svelte": {"files": ["svelte.config.js", "src/main.svelte", "src/App.svelte"], "packageJson": {"dependencies": ["svelte"]}},
    "SolidJS": {"packageJson": {"dependencies": ["solid-js"]}},
    "Astro": {"files": ["astro.config.mjs"], "packageJson": {"dependencies": ["astro"]}},
    "Remix": {"packageJson": {"dependencies": ["@remix-run/react"]}},
    "React Native": {"files": ["metro.config.js", "App.js", "App.tsx", "index.js", "index.tsx"], "packageJson": {"dependencies": ["react-native"]}},
    "Flutter": {"files": ["pubspec.yaml", "lib/main.dart", "android/app/src/main/AndroidManifest.xml"]},
    "Ionic": {"files": ["ionic.config.json"], "packageJson": {"dependencies": ["@ionic/core"]}},
    "NativeScript": {"packageJson": {"dependencies": ["nativescript"]}},
    "Cordova": {"files": ["config.xml"], "packageJson": {"dependencies": ["cordova"]}},
    "Capacitor": {"files": ["capacitor.config.json"], "packageJson": {"dependencies": ["@capacitor/core"]}},
    "Xamarin": {"files": [".sln", ".csproj"]},
    "Express.js": {"files": ["app.js", "server.js", "index.js", "express.js"], "packageJson": {"dependencies": ["express"]}},
    "NestJS": {"files": ["src/main.ts"], "packageJson": {"dependencies": ["@nestjs/core"]}},
    "Fastify": {"packageJson": {"dependencies": ["fastify"]}},
    "Koa": {"packageJson": {"dependencies": ["koa"]}},
    "Django": {"files": ["manage.py", "requirements.txt", "settings.py"], "folders": ["templates", "static"]},
    "Flask": {"files": ["app.py", "requirements.txt", "wsgi.py"], "contents": [{"file": "app.py", "keywords": ["Flask", "@app.route"]}]},
    "FastAPI": {"files": ["main.py", "requirements.txt"], "contents": [{"file": "main.py", "keywords": ["FastAPI"]}]},
    "Ruby on Rails": {"files": ["Gemfile", "config.ru", "Rakefile"], "contents": [{"file": "Gemfile", "keywords": ["rails"]}]},
    "Sinatra": {"files": ["app.rb", "config.ru"], "contents": [{"file": "app.rb", "keywords": ["Sinatra"]}]},
    "Laravel": {"files": ["artisan", "server.php", "composer.json"], "packageJson": {"dependencies": ["laravel-mix"]}},
    "Symfony": {"files": ["composer.json", "symfony.lock"], "contents": [{"file": "composer.json", "keywords": ["symfony/framework-bundle"]}]},
    "Phoenix": {"files": ["mix.exs"], "contents": [{"file": "mix.exs", "keywords": ["phoenix"]}]},
    "ASP.NET": {"files": [".csproj", "Program.cs", "Startup.cs"]},
    "Spring Boot": {"files": ["pom.xml", "build.gradle", "src/main/resources/application.properties"]},
    "Micronaut": {"files": ["build.gradle", "src/main/resources/application.yml"]},
    "Quarkus": {"files": ["pom.xml", "src/main/resources/application.properties"]},
    "JavaScript": {"files": ["package.json", "index.js"]},
    "TypeScript": {"files": ["tsconfig.json", "tsconfig.node.json"], "packageJson": {"devDependencies": ["typescript"]}},
    "Python": {"files": ["requirements.txt", "pyproject.toml", "setup.py", "Pipfile"]},
    "Java": {"files": ["pom.xml", "build.gradle", "src/main/java"]},
    "Kotlin": {"files": ["build.gradle.kts", "src/main/kotlin"]},
    "Go": {"files": ["go.mod", "go.sum", "main.go", "*.go"], "contents": [{"file": "go.mod", "keywords": ["module"]}]},
    "Rust": {"files": ["Cargo.toml", "Cargo.lock", "src/main.rs"]},
    "C": {"files": ["makefile", "*.c", "*.h"]},
    "C++": {"files": ["makefile", "*.cpp", "*.hpp"]},
    "C#": {"files": [".csproj", "Program.cs", "*.cs"]},
    "PHP": {"files": ["composer.json", "composer.lock", "index.php"]},
    "Ruby": {"files": ["Gemfile", "Gemfile.lock", "config.ru", "*.rb"]},
    "Swift": {"files": ["Package.swift", "*.swift"]},
    "Objective-C": {"files": ["*.m", "*.h"]},
    "Dart": {"files": ["pubspec.yaml", "*.dart"]},
    "Elixir": {"files": ["mix.exs", "mix.lock"]},
    "Scala": {"files": ["build.sbt", "project/build.properties"]},
    "Clojure": {"files": ["project.clj", "deps.edn"]},
    "Haskell": {"files": ["stack.yaml", "*.hs"]},
    "Perl": {"files": ["Makefile.PL", "*.pl"]},
    "R": {"files": ["DESCRIPTION", "*.R"]},
    "Julia": {"files": ["Project.toml", "*.jl"]},
    "Lua": {"files": ["*.lua"]},
    "Erlang": {"files": ["rebar.config", "*.erl"]},
    "OCaml": {"files": ["dune", "*.ml"]},
    "F#": {"files": ["*.fs", "*.fsx"]},
    "Groovy": {"files": ["build.gradle", "*.groovy"]},
    "D": {"files": ["dub.json", "*.d"]},
    "Nim": {"files": ["*.nim"]},
    "Zig": {"files": ["build.zig", "*.zig"]},
    "V": {"files": ["v.mod", "*.v"]},
    "Docker": {"files": ["Dockerfile", "docker-compose.yml"]},
    "Kubernetes": {"folders": ["k8s", "kubernetes"], "files": ["deployment.yaml", "service.yaml"]},
    "Terraform": {"files": ["main.tf", "variables.tf", "terraform.tfvars"]},
    "Serverless": {"files": ["serverless.yml", "serverless.js"]},
    "Ansible": {"folders": ["roles"], "files": ["playbook.yml"]},
    "Pulumi": {"files": ["Pulumi.yaml", "Pulumi.dev.yaml"]},
    "Bazel": {"files": ["WORKSPACE", "BUILD"]},
    "Make": {"files": ["Makefile", "makefile"]},
    "CMake": {"files": ["CMakeLists.txt"]},
    "Gradle": {"files": ["build.gradle", "settings.gradle"]},
    "Maven": {"files": ["pom.xml"]},
    "Webpack": {"files": ["webpack.config.js", "webpack.config.ts"], "packageJson": {"devDependencies": ["webpack"]}},
    "Vite": {"files": ["vite.config.js", "vite.config.ts"], "packageJson": {"devDependencies": ["vite"]}},
    "Rollup": {"files": ["rollup.config.js"], "packageJson": {"devDependencies": ["rollup"]}},
    "Parcel": {"files": [".parcelrc"], "packageJson": {"devDependencies": ["parcel"]}},
    "ESLint": {"files": [".eslintrc.js", ".eslintrc.json"], "packageJson": {"devDependencies": ["eslint"]}},
    "Prettier": {"files": [".prettierrc", ".prettierrc.js"], "packageJson": {"devDependencies": ["prettier"]}},
    "Babel": {"files": ["babel.config.js", ".babelrc"], "packageJson": {"devDependencies": ["@babel/core"]}},
    "Electron": {"files": ["electron-builder.json", "main.js"], "packageJson": {"dependencies": ["electron"]}},
    "Tauri": {"files": ["src-tauri/tauri.conf.json"], "packageJson": {"dependencies": ["@tauri-apps/cli"]}},
    "Qt": {"files": ["*.pro", "*.qml"]},
    "GTK": {"files": ["Makefile.am", "configure.ac"]},
    "WxWidgets": {"files": ["*.wxcp"]},
    "Jest": {"files": ["jest.config.js"], "packageJson": {"devDependencies": ["jest"]}},
    "Mocha": {"files": ["mocha.opts"], "packageJson": {"devDependencies": ["mocha"]}},
    "Jasmine": {"packageJson": {"devDependencies": ["jasmine"]}},
    "Cypress": {"folders": ["cypress"], "packageJson": {"devDependencies": ["cypress"]}},
    "Playwright": {"folders": ["tests"], "packageJson": {"devDependencies": ["@playwright/test"]}},
    "Puppeteer": {"packageJson": {"devDependencies": ["puppeteer"]}},
    "Selenium": {"files": ["requirements.txt"], "contents": [{"file": "requirements.txt", "keywords": ["selenium"]}]},
    "Vitest": {"packageJson": {"devDependencies": ["vitest"]}},
    "Gatsby": {"files": ["gatsby-config.js"], "packageJson": {"dependencies": ["gatsby"]}},
    "Hugo": {"files": ["config.toml", "config.yaml"]},
    "Jekyll": {"files": ["_config.yml"]},
    "Eleventy": {"files": [".eleventy.js"], "packageJson": {"dependencies": ["@11ty/eleventy"]}},
    "Docusaurus": {"files": ["docusaurus.config.js"], "packageJson": {"dependencies": ["@docusaurus/core"]}},
    "WordPress": {"files": ["wp-config.php", "wp-content"]},
    "Strapi": {"files": ["config/functions/bootstrap.js"], "packageJson": {"dependencies": ["strapi"]}},
    "Ghost": {"files": ["config.production.json"]},
    "Directus": {"packageJson": {"dependencies": ["directus"]}},
    "Sanity": {"files": ["sanity.json"], "packageJson": {"dependencies": ["@sanity/cli"]}},
    "PostgreSQL": {"files": ["init.sql", "*.pgsql"]},
    "MySQL": {"files": ["*.sql"]},
    "MongoDB": {"files": ["mongod.conf"]},
    "SQLite": {"files": ["*.sqlite", "*.db"]},
    "Redis": {"files": ["redis.conf"]},
    "Firebase": {"files": ["firebase.json"], "packageJson": {"dependencies": ["firebase"]}},
    "Supabase": {"files": ["supabase/config.toml"], "packageJson": {"dependencies": ["@supabase/supabase-js"]}},
    "GraphQL": {"files": ["schema.graphql"], "packageJson": {"dependencies": ["graphql"]}},
    "Apollo": {"packageJson": {"dependencies": ["@apollo/client"]}},
    "Hasura": {"files": ["metadata"]},
    "Wasm": {"files": ["*.wasm"]},
    "Emscripten": {"files": ["emcc"]},
    "TensorFlow": {"files": ["requirements.txt"], "contents": [{"file": "requirements.txt", "keywords": ["tensorflow"]}]},
    "PyTorch": {"files": ["requirements.txt"], "contents": [{"file": "requirements.txt", "keywords": ["torch"]}]},
    "Keras": {"files": ["requirements.txt"], "contents": [{"file": "requirements.txt", "keywords": ["keras"]}]},
}

def detect_project_type(project_dir):
    detected_types = []
    go_mod_path = os.path.join(project_dir, "go.mod")
    try:
        go_files = [f for f in os.listdir(project_dir) if f.endswith(".go")]
    except FileNotFoundError:
        go_files = []
    
    has_go_files = len(go_files) > 0
    has_go_mod = os.path.exists(go_mod_path)

    if has_go_mod or has_go_files:
        go_type = "Go"
        confidence = 100 if has_go_mod else 80
        
        go_mod_content = ""
        if has_go_mod:
            with open(go_mod_path, 'r', encoding='utf-8') as f:
                go_mod_content = f.read()
        
        main_go_content = ""
        main_go_path = os.path.join(project_dir, 'main.go')
        if os.path.exists(main_go_path):
            with open(main_go_path, 'r', encoding='utf-8') as f:
                main_go_content = f.read()
        
        frameworks = {
            'github.com/gin-gonic/gin': 'Gin',
            'github.com/gorilla/mux': 'Gorilla Mux',
            'github.com/labstack/echo': 'Echo',
            'github.com/gofiber/fiber': 'Fiber',
            'github.com/go-chi/chi': 'Chi',
            'github.com/graphql-go/graphql': 'GraphQL',
            'github.com/grpc/grpc-go': 'gRPC',
            'gorm.io/gorm': 'GORM',
        }
        
        for pkg, framework in frameworks.items():
            if pkg in go_mod_content or pkg in main_go_content:
                go_type = f"Go {framework}"
                confidence += 10
        
        detected_types.append({"type": go_type, "category": "backend", "confidence": confidence})

    package_json = {}
    package_json_path = os.path.join(project_dir, "package.json")
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_json = json.load(f)
        except:
            pass
    
    dependencies = package_json.get("dependencies", {})
    dev_dependencies = package_json.get("devDependencies", {})
    scripts = package_json.get("scripts", {})

    for type_name, pattern in detection_patterns.items():
        confidence = 0
        
        if "files" in pattern:
            for file_pattern in pattern["files"]:
                if "*" in file_pattern:
                    if glob.glob(os.path.join(project_dir, file_pattern)):
                        confidence += 20
                else:
                    if os.path.exists(os.path.join(project_dir, file_pattern)):
                        confidence += 20
        
        if "folders" in pattern:
            for folder in pattern["folders"]:
                if os.path.isdir(os.path.join(project_dir, folder)):
                    confidence += 20
        
        if "contents" in pattern:
            for content_check in pattern["contents"]:
                file_path = os.path.join(project_dir, content_check["file"])
                if os.path.exists(file_path):
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            for keyword in content_check["keywords"]:
                                if keyword in content:
                                    confidence += 30
                    except:
                        pass
        
        if "packageJson" in pattern:
            pj = pattern["packageJson"]
            if "dependencies" in pj:
                for dep in pj["dependencies"]:
                    if dep in dependencies:
                        confidence += 40
            if "devDependencies" in pj:
                for dep in pj["devDependencies"]:
                    if dep in dev_dependencies:
                        confidence += 40
            if "scripts" in pj:
                for script in pj["scripts"]:
                    if script in scripts:
                        confidence += 30
        
        if confidence > 0:
            category = "other"
            detected_types.append({"type": type_name, "category": category, "confidence": confidence})

    detected_types.sort(key=lambda x: x["confidence"], reverse=True)
    
    if detected_types:
        return detected_types[0]["type"]
    
    return "Unknown"
