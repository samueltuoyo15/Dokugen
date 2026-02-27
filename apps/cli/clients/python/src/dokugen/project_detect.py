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
    "Assembly": {"files": ["*.asm", "*.s"]},
    "Visual Basic": {"files": ["*.vb", "*.vbs"]},
    "CUDA": {"files": ["*.cu", "*.cuh"]},
    "Fortran": {"files": ["*.f90", "*.f95", "*.f03", "*.f"]},
    "COBOL": {"files": ["*.cbl", "*.cob", "*.cpy"]},
    "Lisp": {"files": ["*.lisp", "*.lsp"]},
    "Scheme": {"files": ["*.scm", "*.ss"]},
    "Racket": {"files": ["*.rkt"]},
    "Prolog": {"files": ["*.pl", "*.pro"]},
    "Smalltalk": {"files": ["*.st"]},
    "Ada": {"files": ["*.adb", "*.ads"]},
    "Pascal": {"files": ["*.pas", "*.pp"]},
    "Solidity": {"files": ["*.sol"], "packageJson": {"devDependencies": ["hardhat", "truffle"]}},
    "Vyper": {"files": ["*.vy"]},
    "Hack": {"files": ["*.hh", ".hhconfig"]},
    "Haxe": {"files": ["*.hx", "build.hxml"]},
    "Crystal": {"files": ["shard.yml", "*.cr"]},
    "Meteor": {"files": [".meteor"], "packageJson": {"dependencies": ["meteor-node-stubs"]}},
    "Aurelia": {"packageJson": {"dependencies": ["aurelia-framework"]}},
    "Mithril": {"packageJson": {"dependencies": ["mithril"]}},
    "Alpine.js": {"files": ["index.html"], "contents": [{"file": "index.html", "keywords": ["alpinejs"]}]},
    "Lit": {"packageJson": {"dependencies": ["lit", "lit-element"]}},
    "Stencil": {"files": ["stencil.config.ts"], "packageJson": {"dependencies": ["@stencil/core"]}},
    "Stimulus": {"packageJson": {"dependencies": ["@hotwired/stimulus"]}},
    "Turbo": {"packageJson": {"dependencies": ["@hotwired/turbo"]}},
    "Ember.js": {"files": ["ember-cli-build.js"], "packageJson": {"dependencies": ["ember-cli"]}},
    "Backbone.js": {"packageJson": {"dependencies": ["backbone"]}},
    "Knockout": {"packageJson": {"dependencies": ["knockout"]}},
    "Polymer": {"files": ["polymer.json"], "packageJson": {"dependencies": ["@polymer/polymer"]}},
    "Nx": {"files": ["nx.json"]},
    "Lerna": {"files": ["lerna.json"]},
    "Turborepo": {"files": ["turbo.json"]},
    "Rush": {"files": ["rush.json"]},
    "Yarn Workspaces": {"packageJson": {"scripts": ["workspaces"]}},
    "PNPM Workspaces": {"files": ["pnpm-workspace.yaml"]},
}


def _read_file_safe(path):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""


def _path_exists(p):
    return os.path.exists(p)


def _is_dir(p):
    return os.path.isdir(p)


def _list_dir_safe(p):
    try:
        return os.listdir(p)
    except Exception:
        return []


def get_category(type_name):
    frontend = [
        "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "SolidJS", "Astro", "Remix", "Gatsby", "Hugo",
        "Jekyll", "Eleventy", "Docusaurus", "Qwik", "Analog", "SvelteKit", "Fresh", "Meteor", "Aurelia", "Mithril",
        "Alpine.js", "Lit", "Stencil", "Stimulus", "Turbo", "Ember.js", "Backbone.js", "Knockout", "Polymer"
    ]
    backend = [
        "Express.js", "NestJS", "Fastify", "Koa", "Hono", "tRPC", "Django", "Flask", "FastAPI", "Ruby on Rails",
        "Sinatra", "Laravel", "Symfony", "Phoenix", "ASP.NET", "Spring Boot", "Micronaut", "Quarkus", "Go", "Rust",
        "Prisma", "DrizzleORM", "TypeORM", "Sequelize", "PocketBase", "Assembly", "Visual Basic", "CUDA", "Fortran",
        "COBOL", "Lisp", "Scheme", "Racket", "Prolog", "Smalltalk", "Ada", "Pascal", "Solidity", "Vyper", "Hack",
        "Haxe", "Julia", "Crystal"
    ]
    mobile = ["React Native", "Flutter", "Ionic", "NativeScript", "Cordova", "Capacitor", "Xamarin"]
    desktop = ["Electron", "Tauri", "Qt", "GTK", "WxWidgets"]
    devops = [
        "Docker", "Kubernetes", "Terraform", "Serverless", "Ansible", "Pulumi", "Bazel", "Nx", "Lerna",
        "Turborepo", "Rush", "Yarn Workspaces", "PNPM Workspaces", "Make", "CMake", "Gradle", "Maven"
    ]
    if any(t in type_name for t in frontend):
        return "frontend"
    if any(t in type_name for t in backend):
        return "backend"
    if any(t in type_name for t in mobile):
        return "mobile"
    if any(t in type_name for t in desktop):
        return "desktop"
    if any(t in type_name for t in devops):
        return "devops"
    return "other"


def detect_project_type(project_dir):
    detected_types = []

    go_mod_path = os.path.join(project_dir, "go.mod")
    try:
        go_files = [f for f in os.listdir(project_dir) if f.endswith(".go")]
    except Exception:
        go_files = []

    has_go_files = len(go_files) > 0
    has_go_mod = _path_exists(go_mod_path)

    if has_go_mod or has_go_files:
        go_type = "Go"
        confidence = 100 if has_go_mod else 80

        go_mod_content = _read_file_safe(go_mod_path) if has_go_mod else ""
        main_go_content = _read_file_safe(os.path.join(project_dir, "main.go"))

        frameworks = {
            "github.com/gin-gonic/gin": "Gin",
            "github.com/gorilla/mux": "Gorilla Mux",
            "github.com/labstack/echo": "Echo",
            "github.com/gofiber/fiber": "Fiber",
            "github.com/go-chi/chi": "Chi",
            "github.com/graphql-go/graphql": "GraphQL",
            "github.com/grpc/grpc-go": "gRPC",
            "gorm.io/gorm": "GORM",
        }

        for pkg, framework in frameworks.items():
            if pkg in go_mod_content or pkg in main_go_content:
                go_type = f"Go {framework}"
                confidence += 10

        detected_types.append({"type": go_type, "category": "backend", "confidence": min(confidence, 100)})

    package_json = {}
    package_json_path = os.path.join(project_dir, "package.json")
    if _path_exists(package_json_path):
        try:
            with open(package_json_path, "r", encoding="utf-8") as f:
                package_json = json.load(f)
        except Exception:
            pass

    dependencies = package_json.get("dependencies", {})
    dev_dependencies = package_json.get("devDependencies", {})
    all_deps = {**dependencies, **dev_dependencies}

    if package_json:
        is_react_app = any(k in all_deps for k in ["react", "next", "gatsby", "remix"])
        is_backend = (
            "express" in all_deps
            or "@nestjs/core" in all_deps
            or "fastify" in all_deps
            or "koa" in all_deps
            or "hono" in all_deps
            or "@trpc/server" in all_deps
            or package_json.get("type") == "module"
            or _path_exists(os.path.join(project_dir, "server.js"))
            or _path_exists(os.path.join(project_dir, "app.js"))
            or _path_exists(os.path.join(project_dir, "index.js"))
            or _is_dir(os.path.join(project_dir, "src", "server"))
            or _is_dir(os.path.join(project_dir, "src", "api"))
        )

        if not is_react_app and is_backend:
            node_type = "TypeScript Node.js" if "typescript" in all_deps else "Node.js"

            if "express" in all_deps:
                node_type += " Express"
            elif "@nestjs/core" in all_deps:
                node_type += " NestJS"
            elif "fastify" in all_deps:
                node_type += " Fastify"
            elif "koa" in all_deps:
                node_type += " Koa"
            elif "hono" in all_deps:
                node_type += " Hono"
            elif "@trpc/server" in all_deps:
                node_type += " tRPC"

            if "@prisma/client" in all_deps:
                node_type += " + Prisma"
            if "typeorm" in all_deps:
                node_type += " + TypeORM"
            if "sequelize" in all_deps:
                node_type += " + Sequelize"
            if "drizzle-orm" in all_deps:
                node_type += " + DrizzleORM"
            if "mongoose" in all_deps:
                node_type += " + Mongoose"

            detected_types.append({"type": node_type, "category": "backend", "confidence": 95})

    for type_name, pattern in detection_patterns.items():
        if type_name == "Go" and any(t["type"] == "Go" for t in detected_types):
            continue

        confidence = 0

        if "files" in pattern:
            for file_pattern in pattern["files"]:
                if "*" in file_pattern:
                    if glob.glob(os.path.join(project_dir, file_pattern)):
                        confidence += 30
                        break
                elif _path_exists(os.path.join(project_dir, file_pattern)):
                    confidence += 30
                    break

        if "folders" in pattern:
            for folder in pattern["folders"]:
                if _is_dir(os.path.join(project_dir, folder)):
                    confidence += 20
                    break

        if "contents" in pattern:
            for content_check in pattern["contents"]:
                file_path = os.path.join(project_dir, content_check["file"])
                if _path_exists(file_path):
                    content = _read_file_safe(file_path)
                    if any(kw in content for kw in content_check["keywords"]):
                        confidence += 25

        if "packageJson" in pattern and package_json:
            pj = pattern["packageJson"]
            if "dependencies" in pj:
                if any(dep in dependencies for dep in pj["dependencies"]):
                    confidence += 25
            if "devDependencies" in pj:
                if any(dep in dev_dependencies for dep in pj["devDependencies"]):
                    confidence += 15
            if "scripts" in pj:
                scripts = package_json.get("scripts", {})
                if any(s in scripts for s in pj["scripts"]):
                    confidence += 10

        if confidence > 0:
            detected_types.append({"type": type_name, "category": get_category(type_name), "confidence": confidence})

    requirements_path = os.path.join(project_dir, "requirements.txt")
    pipfile_path = os.path.join(project_dir, "Pipfile")
    poetry_path = os.path.join(project_dir, "pyproject.toml")
    conda_path = os.path.join(project_dir, "environment.yml")
    try:
        python_files = [f for f in os.listdir(project_dir) if f.endswith(".py")]
    except Exception:
        python_files = []

    is_python_project = (
        len(python_files) > 0
        or _path_exists(requirements_path)
        or _path_exists(pipfile_path)
        or _path_exists(poetry_path)
        or _path_exists(conda_path)
    )

    if is_python_project:
        python_type = "Python"
        py_confidence = 90
        py_frameworks = []

        all_py_deps = (
            _read_file_safe(requirements_path)
            + _read_file_safe(pipfile_path)
            + _read_file_safe(poetry_path)
            + _read_file_safe(conda_path)
            + _read_file_safe(os.path.join(project_dir, "main.py"))
            + _read_file_safe(os.path.join(project_dir, "app.py"))
        )

        framework_patterns = {
            "django": {"name": "Django", "score": 15, "files": ["manage.py", "wsgi.py", "asgi.py"]},
            "fastapi": {"name": "FastAPI", "score": 15, "imports": ["from fastapi import"]},
            "flask": {"name": "Flask", "score": 15, "imports": ["from flask import"]},
            "tornado": {"name": "Tornado", "score": 15, "imports": ["import tornado"]},
            "pyramid": {"name": "Pyramid", "score": 15, "imports": ["from pyramid.config import"]},
            "aiohttp": {"name": "AIOHTTP", "score": 15, "imports": ["import aiohttp"]},
            "sanic": {"name": "Sanic", "score": 15, "imports": ["from sanic import"]},
            "dash": {"name": "Dash", "score": 10, "imports": ["import dash"]},
            "streamlit": {"name": "Streamlit", "score": 10, "imports": ["import streamlit"]},
        }

        for key, framework in framework_patterns.items():
            if key in all_py_deps.lower():
                py_frameworks.append(framework["name"])
                py_confidence += framework["score"]

                for f in framework.get("files", []):
                    if _path_exists(os.path.join(project_dir, f)):
                        py_confidence += 5

                for imp in framework.get("imports", []):
                    if imp in all_py_deps:
                        py_confidence += 5

        libraries = {
            "sqlalchemy": "SQLAlchemy",
            "peewee": "Peewee",
            "tortoise": "TortoiseORM",
            "mongoengine": "MongoEngine",
            "pydantic": "Pydantic",
            "celery": "Celery",
            "pytest": "PyTest",
            "numpy": "NumPy",
            "pandas": "Pandas",
            "tensorflow": "TensorFlow",
            "torch": "PyTorch",
        }

        for lib, name in libraries.items():
            if lib in all_py_deps.lower():
                py_frameworks.append(name)
                py_confidence += 5

        if py_frameworks:
            python_type = f"Python {' + '.join(py_frameworks)}"

        web_frameworks = {"Django", "FastAPI", "Flask", "Tornado", "Pyramid", "AIOHTTP", "Sanic"}
        category = "backend" if any(f in web_frameworks for f in py_frameworks) else "other"

        detected_types.append({"type": python_type, "category": category, "confidence": min(py_confidence, 100)})

    gemfile_path = os.path.join(project_dir, "Gemfile")
    try:
        ruby_files = [f for f in os.listdir(project_dir) if f.endswith(".rb")]
    except Exception:
        ruby_files = []

    if _path_exists(gemfile_path) or len(ruby_files) > 0:
        ruby_type = "Ruby"
        rb_confidence = 90
        rb_frameworks = []

        all_gems = (
            _read_file_safe(gemfile_path)
            + _read_file_safe(os.path.join(project_dir, "Gemfile.lock"))
            + _read_file_safe(os.path.join(project_dir, "config.ru"))
        )

        gem_patterns = {
            "rails": {
                "name": "Rails",
                "score": 20,
                "files": ["config/routes.rb", "config/application.rb", "app/controllers/application_controller.rb"],
            },
            "sinatra": {
                "name": "Sinatra",
                "score": 15,
                "requires": ['require "sinatra"', "require 'sinatra'"],
            },
            "hanami": {
                "name": "Hanami",
                "score": 15,
                "files": ["config/environment.rb", "apps/web/application.rb"],
            },
            "grape": {
                "name": "Grape",
                "score": 15,
                "requires": ['require "grape"', "require 'grape'"],
            },
            "roda": {
                "name": "Roda",
                "score": 15,
                "requires": ['require "roda"', "require 'roda'"],
            },
        }

        for key, gem_pattern in gem_patterns.items():
            if key in all_gems.lower():
                rb_frameworks.append(gem_pattern["name"])
                rb_confidence += gem_pattern["score"]

                for f in gem_pattern.get("files", []):
                    if _path_exists(os.path.join(project_dir, f)):
                        rb_confidence += 5

                for req in gem_pattern.get("requires", []):
                    if req in all_gems:
                        rb_confidence += 5

        gems = {
            "devise": "Devise",
            "activerecord": "ActiveRecord",
            "sequel": "Sequel",
            "mongoid": "Mongoid",
            "sidekiq": "Sidekiq",
            "rspec": "RSpec",
            "minitest": "Minitest",
            "capybara": "Capybara",
            "webpacker": "Webpacker",
            "stimulus": "Stimulus",
            "turbo-rails": "Turbo",
        }

        for gem, name in gems.items():
            if gem in all_gems.lower():
                rb_frameworks.append(name)
                rb_confidence += 5

        if rb_frameworks:
            ruby_type = f"Ruby {' + '.join(rb_frameworks)}"

        detected_types.append({"type": ruby_type, "category": "backend", "confidence": min(rb_confidence, 100)})

    if package_json and "react" in all_deps:
        react_type = "TypeScript React" if ("@types/react" in all_deps or "typescript" in all_deps) else "React"

        if "next" in all_deps:
            react_type += " Next.js"
        elif "gatsby" in all_deps:
            react_type += " Gatsby"
        elif "remix" in all_deps:
            react_type += " Remix"

        if "@mui/material" in all_deps:
            react_type += " Material-UI"
        elif "@chakra-ui/react" in all_deps:
            react_type += " Chakra UI"
        elif "antd" in all_deps:
            react_type += " Ant Design"
        elif "@tailwindcss/react" in all_deps:
            react_type += " Tailwind"

        detected_types.append({"type": react_type, "category": "frontend", "confidence": 95})

    has_client_dir = _is_dir(os.path.join(project_dir, "client"))
    has_server_dir = _is_dir(os.path.join(project_dir, "server"))
    has_apps_dir = _is_dir(os.path.join(project_dir, "apps"))
    has_packages_dir = _is_dir(os.path.join(project_dir, "packages"))

    if (has_client_dir and has_server_dir) or (has_apps_dir and has_packages_dir):
        client_types = []
        server_types = []
        is_monorepo = False

        if has_client_dir and has_server_dir:
            is_monorepo = True
            client_result = detect_project_type(os.path.join(project_dir, "client"))
            server_result = detect_project_type(os.path.join(project_dir, "server"))
            client_types.append(client_result)
            server_types.append(server_result)

        if has_apps_dir:
            is_monorepo = True
            for app in _list_dir_safe(os.path.join(project_dir, "apps")):
                app_type = detect_project_type(os.path.join(project_dir, "apps", app))
                app_lower = app_type.lower()
                if any(k in app_lower for k in ["react", "vue", "angular", "front"]):
                    client_types.append(app_type)
                else:
                    server_types.append(app_type)

        if has_packages_dir:
            is_monorepo = True
            for pkg in _list_dir_safe(os.path.join(project_dir, "packages")):
                pkg_type = detect_project_type(os.path.join(project_dir, "packages", pkg))
                if pkg_type != "Unknown":
                    pkg_lower = pkg_type.lower()
                    if any(k in pkg_lower for k in ["react", "vue", "angular", "front"]):
                        client_types.append(pkg_type)
                    else:
                        server_types.append(pkg_type)

        if is_monorepo:
            unique_client = list(dict.fromkeys(t for t in client_types if t != "Unknown"))
            unique_server = list(dict.fromkeys(t for t in server_types if t != "Unknown"))

            client_str = f"Client: {' + '.join(unique_client)}" if unique_client else ""
            server_str = f"Server: {' + '.join(unique_server)}" if unique_server else ""

            parts = [p for p in [client_str, server_str] if p]
            return f"Monorepo [{' | '.join(parts)}]"

    if detected_types:
        detected_types.sort(key=lambda x: x["confidence"], reverse=True)
        return detected_types[0]["type"]

    return "Unknown"
