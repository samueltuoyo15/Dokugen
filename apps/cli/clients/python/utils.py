import os
import sys
import time
import subprocess
import gzip
import base64
import requests
from rich.live import Live
from rich.spinner import Spinner
from rich.console import Console
from pathlib import Path
import pathspec
import platform
import datetime

console = Console()
readme_backup = None
current_readme_path = ""

def create_spinner(text):
    return Live(Spinner("dots", text=text), refresh_per_second=10)

def sleep(ms):
    time.sleep(ms / 1000.0)

def check_and_update():
    pass

def get_user_info():
    git_name = ""
    git_email = ""
    try:
        git_name = subprocess.check_output(["git", "config", "--get", "user.name"], encoding="utf-8").strip()
        git_email = subprocess.check_output(["git", "config", "--get", "user.email"], encoding="utf-8").strip()
    except subprocess.CalledProcessError:
        console.print("[yellow]Git User Info not found. Using Defaults......[/yellow]")
    
    os_info = {
        "platform": platform.system() or "unknown",
        "arch": platform.machine() or "unknown",
        "release": platform.release() or "unknown",
    }
    
    if git_name and git_email:
        return {"username": git_name, "email": git_email, "osInfo": os_info}
    
    try:
        username = os.getlogin()
    except:
        username = "Unknown"
        
    return {
        "username": username,
        "email": os.environ.get("USER", ""),
        "osInfo": os_info
    }

def check_internet_connection():
    try:
        requests.get("https://www.google.com", timeout=5)
        return True
    except:
        return False

def compress_data(data):
    compressed = gzip.compress(data.encode('utf-8'))
    return base64.b64encode(compressed).decode('utf-8')

def backup_readme(readme_path):
    global readme_backup, current_readme_path
    if os.path.exists(readme_path):
        current_readme_path = readme_path
        with open(readme_path, 'r', encoding='utf-8', errors='ignore') as f:
            readme_backup = f.read()
        console.print(f"[green][{datetime.datetime.now().isoformat()}] Current README backed up in memory[/green]")

def restore_readme():
    global readme_backup
    if readme_backup and current_readme_path:
        try:
            with open(current_readme_path, 'w', encoding='utf-8') as f:
                f.write(readme_backup)
            console.print("[green]Original README content restored successfully[/green]")
            return readme_backup
        except Exception as e:
            console.print(f"[red]Failed to restore README: {e}[/red]")
            return None
        finally:
            readme_backup = None
    else:
        console.print("[yellow]No README backup available to restore[/yellow]")
        return None

def get_git_repo_url():
    try:
        url = subprocess.check_output(["git", "config", "--get", "remote.origin.url"], encoding="utf-8").strip()
        return url if url else None
    except:
        return None

def matches_ignore_pattern(filename, pattern):
    if pattern.startswith("*."):
        ext = pattern[1:]
        return filename.endswith(ext)
    return filename == pattern

def scan_files(root_dir):
    ignore_dirs = {
        "node_modules", "bower_components", "dist", "build", "out", "target", "bin", "obj", "lib", 
        "release", "debug", "artifacts", "generated", "temp", "tmp", "cache", ".cache", ".temp",
        ".next", ".nuxt", ".svelte-kit", ".vercel", ".serverless", ".expo", ".output",
        "dist-electron", "release-builds", ".parcel-cache",
        "android", "ios", "windows", "linux", "macos", "web",
        ".dart_tool", ".pub-cache", ".pub", "Pods", ".bundle",
        "venv", ".venv", "env", ".env", "virtualenv", "envs", "__pycache__",
        ".pytest_cache", ".mypy_cache", ".tox", "htmlcov", "site-packages",
        "vendor", "var", "storage",
        ".gradle", ".mvn", ".idea",
        "tests", "_tests_", "_test_", "__tests__", "coverage", "test", "spec",
        "cypress", "e2e", "reports",
        ".git", ".svn", ".hg", ".vscode", ".vs", ".history", ".github", ".gitlab",
        "public", "static", "assets", "images", "media", "uploads", "fonts", "icons",
        "migrations", "data", "db", "database", "logs", "log", "dump", "backups",
        "docs", "javadoc", "tools", "scripts", "config", "settings",
        "cmake-build-debug", "packages", "plugins", "examples", "samples"
    }
    
    ignore_files = {
        "*.exe", "*.dll", "*.so", "*.dylib", "*.bin", "*.iso", "*.img", "*.dmg",
        "*.zip", "*.tar", "*.gz", "*.rar", "*.7z", "*.bz2", "*.xz",
        "*.mp4", "*.mkv", "*.avi", "*.mov", "*.wmv", "*.flv", "*.webm",
        "*.mp3", "*.wav", "*.flac", "*.aac", "*.ogg", "*.wma",
        "*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp", "*.ico", "*.svg", "*.webp", "*.tiff",
        "*.pdf", "*.doc", "*.docx", "*.ppt", "*.pptx", "*.xls", "*.xlsx", "*.csv",
        "*.ttf", "*.otf", "*.woff", "*.woff2", "*.eot",
        "*.pyc", "*.pyo", "*.pyd",
        "*.class", "*.jar", "*.war", "*.ear",
        "*.o", "*.obj", "*.a", "*.lib",
        "*.lock", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Gemfile.lock", "composer.lock", "mix.lock", "pubspec.lock", "Cargo.lock",
        "*.log", "*.tmp", "*.temp", "*.swp", "*.swo", "*.bak", "*.old", "*.orig",
        ".DS_Store", "Thumbs.db", "desktop.ini",
        ".env", ".env.local", ".env.development", ".env.test", ".env.production",
        "Dockerfile", "docker-compose.yml", "Makefile", "CMakeLists.txt",
        "LICENSE", "CHANGELOG.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "README.md",
        ".gitignore", ".npmignore", ".dockerignore", ".eslintrc*", ".prettierrc*", "tsconfig.json",
        "*.min.js", "*.min.css", "*.map", "*.d.ts", "*.apk", "*.aab", "*.ipa", "*.hap"
    }

    gitignore_spec = None
    gitignore_path = os.path.join(root_dir, ".gitignore")
    if os.path.exists(gitignore_path):
        try:
            with open(gitignore_path, 'r') as f:
                gitignore_spec = pathspec.PathSpec.from_lines('gitwildmatch', f)
        except:
            pass

    found_files = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
        
        rel_dir = os.path.relpath(dirpath, root_dir)
        if rel_dir == ".": rel_dir = ""

        if gitignore_spec and rel_dir and gitignore_spec.match_file(rel_dir):
            dirnames[:] = [] 
            continue

        for filename in filenames:
            should_ignore = False
            for pattern in ignore_files:
                if matches_ignore_pattern(filename, pattern):
                    should_ignore = True
                    break
            
            if should_ignore:
                continue
            
            rel_file_path = os.path.join(rel_dir, filename)
            
            if gitignore_spec and gitignore_spec.match_file(rel_file_path):
                continue
            
            found_files.append(rel_file_path)
    
    return found_files

def extract_full_code(project_files, project_dir):
    snippets = []
    
    file_groups = {}
    for f in project_files:
        d = os.path.dirname(f)
        if d not in file_groups: file_groups[d] = []
        file_groups[d].append(f)
        
    for d, files in file_groups.items():
        dir_snippets = []
        for file in files:
            file_path = os.path.join(project_dir, file)
            try:
                size_kb = os.path.getsize(file_path) / 1024
                with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
                
                ext = Path(file).suffix[1:] or "txt"
                dir_snippets.append(f"### {file}\n- **Path:** {file}\n- **Size:** {size_kb:.2f} KB\n```{ext}\n{content}\n```\n")
            except Exception as e:
                console.print(f"[red]Failed to read file: {file} - {e}[/red]")
        
        if dir_snippets:
            snippets.append(f"## {d}\n" + "".join(dir_snippets))
            
    return "".join(snippets) or "No code snippets available"
