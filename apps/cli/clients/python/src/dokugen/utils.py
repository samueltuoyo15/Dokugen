import base64
import datetime
import gzip
import hashlib
import json
import os
import platform
import subprocess
import sys
import time
import threading
from pathlib import Path

import pathspec
import requests
from rich.console import Console
from rich.live import Live
from rich.spinner import Spinner

console = Console()
readme_backup = None
current_readme_path = ""

PACKAGE_NAME = "dokugen"
PYPI_URL = f"https://pypi.org/pypi/{PACKAGE_NAME}/json"


def create_spinner(text):
    return Live(Spinner("dots", text=text), refresh_per_second=10)


class TickingSpinner:
    def __init__(self, base_text):
        self.base_text = base_text
        self.start_time = None
        self.running = False
        self.spinner = Spinner("dots", text=base_text)
        self.live = Live(self.spinner, refresh_per_second=10)
        self.thread = None

    def __enter__(self):
        self.start_time = time.time()
        self.running = True
        self.live.__enter__()
        self.thread = threading.Thread(target=self._tick, daemon=True)
        self.thread.start()
        return self

    def _tick(self):
        while self.running:
            elapsed = time.time() - self.start_time
            self.spinner.text = f"{self.base_text} ({elapsed:.1f}s)"
            self.live.update(self.spinner)
            time.sleep(0.1)

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.running = False
        if self.thread:
            self.thread.join(timeout=1.0)
        self.live.__exit__(exc_type, exc_val, exc_tb)


def create_ticking_spinner(text):
    return TickingSpinner(text)


def format_elapsed_time(start_time):
    elapsed_ms = int((time.time() - start_time) * 1000)
    if elapsed_ms < 1000:
        return f"{elapsed_ms}ms"
    else:
        seconds = int(elapsed_ms / 1000) % 60
        minutes = int(elapsed_ms / (1000 * 60)) % 60
        hours = int(elapsed_ms / (1000 * 60 * 60))

        parts = []
        if hours > 0:
            parts.append(f"{hours}h")
        if minutes > 0:
            parts.append(f"{minutes}m")
        if seconds > 0 or not parts:
            parts.append(f"{seconds}s")
        return " ".join(parts)


def sleep(ms):
    time.sleep(ms / 1000.0)


def get_installed_version():
    """Get the currently installed version of dokugen."""
    try:
        from importlib.metadata import version as get_version

        return get_version(PACKAGE_NAME)
    except Exception:
        return None


def is_newer_version(latest, current):
    if not latest or not current:
        return False
    try:
        latest_parts = [int(x) for x in latest.split(".")]
        current_parts = [int(x) for x in current.split(".")]
        for l, c in zip(latest_parts, current_parts):
            if l > c:
                return True
            if l < c:
                return False
        return len(latest_parts) > len(current_parts)
    except Exception:
        return False


def check_and_update():
    try:
        current_version = get_installed_version()
        if not current_version:
            return

        response = requests.get(PYPI_URL, timeout=3)
        if response.status_code != 200:
            return

        latest_version = response.json()["info"]["version"]

        if is_newer_version(latest_version, current_version):
            console.print(
                f"\n[cyan]New version available: {latest_version} (current: {current_version})[/cyan]"
            )

            with create_spinner(f"Updating {PACKAGE_NAME}..."):
                try:
                    subprocess.run(
                        [
                            sys.executable,
                            "-m",
                            "uv",
                            "pip",
                            "install",
                            "--upgrade",
                            f"{PACKAGE_NAME}=={latest_version}",
                        ],
                        capture_output=True,
                        timeout=60,
                        check=True,
                    )
                except (subprocess.CalledProcessError, FileNotFoundError):
                    try:
                        subprocess.run(
                            [
                                sys.executable,
                                "-m",
                                "pip",
                                "install",
                                "--upgrade",
                                f"{PACKAGE_NAME}=={latest_version}",
                            ],
                            capture_output=True,
                            timeout=60,
                            check=True,
                        )
                    except Exception:
                        console.print(
                            f"[yellow]Auto-update failed. Please run: pip install --upgrade {PACKAGE_NAME}[/yellow]"
                        )
                        return

            console.print(f"[green]Successfully updated to v{latest_version}![/green]")
            console.print(
                "[yellow]Please re-run your command to use the new version.\n[/yellow]"
            )
            sys.exit(0)
    except Exception:
        return


def get_user_info():
    git_name = ""
    git_email = ""
    try:
        git_name = subprocess.check_output(
            ["git", "config", "--get", "user.name"], encoding="utf-8"
        ).strip()
        git_email = subprocess.check_output(
            ["git", "config", "--get", "user.email"], encoding="utf-8"
        ).strip()
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
    except Exception:
        username = "Unknown"

    return {
        "username": username,
        "email": os.environ.get("USER", ""),
        "osInfo": os_info,
    }


def check_internet_connection():
    try:
        requests.get("https://www.google.com", timeout=5)
        return True
    except Exception:
        return False


def compress_data(data):
    compressed = gzip.compress(data.encode("utf-8"))
    return base64.b64encode(compressed).decode("utf-8")


DOKUGEN_HOME = os.path.expanduser("~/.dokugen")

def get_project_key(project_dir):
    abs_path = os.path.abspath(project_dir)
    return hashlib.md5(abs_path.encode("utf-8")).hexdigest()[:16]

def get_dokugen_cache_path(project_dir):
    return os.path.join(DOKUGEN_HOME, "cache", f"{get_project_key(project_dir)}.json")

def get_dokugen_backup_path(project_dir):
    return os.path.join(DOKUGEN_HOME, "backup", f"{get_project_key(project_dir)}.md")

def load_profile():
    profile_path = os.path.join(DOKUGEN_HOME, "config.json")
    try:
        if os.path.exists(profile_path):
            with open(profile_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def save_profile(profile):
    profile_path = os.path.join(DOKUGEN_HOME, "config.json")
    try:
        os.makedirs(os.path.dirname(profile_path), exist_ok=True)
        with open(profile_path, "w", encoding="utf-8") as f:
            json.dump(profile, f, indent=2)
    except Exception:
        pass

def backup_readme(readme_path):
    global readme_backup, current_readme_path
    if os.path.exists(readme_path):
        current_readme_path = readme_path
        with open(readme_path, "r", encoding="utf-8", errors="ignore") as f:
            readme_backup = f.read()
        backup_file = get_dokugen_backup_path(os.path.dirname(readme_path))
        try:
            os.makedirs(os.path.dirname(backup_file), exist_ok=True)
            with open(backup_file, "w", encoding="utf-8") as bf:
                bf.write(readme_backup)
        except Exception:
            pass
        console.print(
            f"[green][{datetime.datetime.now().isoformat()}] Current README backed up in memory[/green]"
        )


def restore_readme():
    """Restore the backed up README and clear global state."""
    global readme_backup, current_readme_path
    if readme_backup and current_readme_path:
        try:
            with open(current_readme_path, "w", encoding="utf-8") as f:
                f.write(readme_backup)
            console.print(
                "[green]Original README content restored successfully[/green]"
            )
            backup_content = readme_backup
            readme_backup = None
            current_readme_path = ""
            return backup_content
        except Exception as e:
            console.print(f"[red]Failed to restore README: {e}[/red]")
            readme_backup = None
            current_readme_path = ""
            return None
    else:
        console.print("[yellow]No README backup available to restore[/yellow]")
        return None


def revert_readme_from_disk(project_dir=None):
    if project_dir is None:
        project_dir = os.getcwd()
    readme_path = os.path.join(project_dir, "README.md")
    backup_file = get_dokugen_backup_path(project_dir)
    if not os.path.exists(backup_file):
        return None, "No backup found. Run 'dokugen generate' or 'dokugen update' first to create a backup."
    try:
        with open(backup_file, "r", encoding="utf-8") as bf:
            backup_content = bf.read()
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(backup_content)
        return backup_content, None
    except Exception as e:
        return None, str(e)


def get_git_repo_url():
    try:
        url = subprocess.check_output(
            ["git", "config", "--get", "remote.origin.url"], encoding="utf-8"
        ).strip()
        return url if url else None
    except Exception:
        return None


def is_git_repository():
    try:
        subprocess.run(
            ["git", "rev-parse", "--is-inside-work-tree"],
            capture_output=True,
            check=True,
        )
        return True
    except Exception:
        return False


def get_file_hash(file_path):
    try:
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception:
        return ""


def load_cache(project_dir):
    cache_path = get_dokugen_cache_path(project_dir)
    try:
        if os.path.exists(cache_path):
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return None


def save_cache(project_dir, cache):
    cache_path = get_dokugen_cache_path(project_dir)
    try:
        os.makedirs(os.path.dirname(cache_path), exist_ok=True)
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
    except Exception:
        pass


def matches_ignore_pattern(filename, pattern):
    if pattern.startswith("*."):
        ext = pattern[1:]
        return filename.endswith(ext)
    return filename == pattern


def scan_files(root_dir):
    ignore_dirs = {
        "node_modules",
        "bower_components",
        "jspm_packages",
        "web_modules",
        "dist",
        "build",
        "out",
        "target",
        "bin",
        "obj",
        "lib",
        "release",
        "debug",
        "artifacts",
        "generated",
        "temp",
        "tmp",
        "cache",
        ".cache",
        ".temp",
        ".next",
        ".nuxt",
        ".svelte-kit",
        ".vercel",
        ".serverless",
        ".expo",
        ".output",
        "dist-electron",
        "release-builds",
        ".parcel-cache",
        "android",
        "ios",
        "windows",
        "linux",
        "macos",
        "web",
        ".dart_tool",
        ".pub-cache",
        ".pub",
        "Pods",
        ".bundle",
        "venv",
        ".venv",
        "env",
        ".env",
        "virtualenv",
        "envs",
        "__pycache__",
        ".pytest_cache",
        ".mypy_cache",
        ".tox",
        "htmlcov",
        "site-packages",
        "vendor",
        "var",
        "storage",
        ".gradle",
        ".mvn",
        ".idea",
        "tests",
        "_tests_",
        "_test_",
        "__tests__",
        "coverage",
        "test",
        "spec",
        "cypress",
        "e2e",
        "reports",
        ".git",
        ".svn",
        ".hg",
        ".vscode",
        ".turbo",
        ".vs",
        ".history",
        ".github",
        ".gitlab",
        "public",
        "static",
        "assets",
        "images",
        "media",
        "uploads",
        "fonts",
        "icons",
        "migrations",
        "data",
        "db",
        "database",
        "logs",
        "log",
        "dump",
        "backups",
        "docs",
        "javadoc",
        "tools",
        "scripts",
        "config",
        "settings",
        "cmake-build-debug",
        "packages",
        "plugins",
        "examples",
        "samples",
    }

    ignore_files = {
        "*.exe",
        "*.dll",
        "*.so",
        "*.dylib",
        "*.bin",
        "*.iso",
        "*.img",
        "*.dmg",
        "*.zip",
        "*.tar",
        "*.gz",
        "*.rar",
        "*.7z",
        "*.bz2",
        "*.xz",
        "*.mp4",
        "*.mkv",
        "*.avi",
        "*.mov",
        "*.wmv",
        "*.flv",
        "*.webm",
        "*.mp3",
        "*.wav",
        "*.flac",
        "*.aac",
        "*.ogg",
        "*.wma",
        "*.jpg",
        "*.jpeg",
        "*.png",
        "*.gif",
        "*.bmp",
        "*.ico",
        "*.svg",
        "*.webp",
        "*.tiff",
        "*.pdf",
        "*.doc",
        "*.docx",
        "*.ppt",
        "*.pptx",
        "*.xls",
        "*.xlsx",
        "*.csv",
        "*.ttf",
        "*.otf",
        "*.woff",
        "*.woff2",
        "*.eot",
        "*.pyc",
        "*.pyo",
        "*.pyd",
        "*.class",
        "*.jar",
        "*.war",
        "*.ear",
        "*.o",
        "*.obj",
        "*.a",
        "*.lib",
        "*.lock",
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "Gemfile.lock",
        "composer.lock",
        "mix.lock",
        "pubspec.lock",
        "Cargo.lock",
        "*.log",
        "*.tmp",
        "*.temp",
        "*.swp",
        "*.swo",
        "*.bak",
        "*.old",
        "*.orig",
        ".DS_Store",
        "Thumbs.db",
        "desktop.ini",
        ".env",
        ".env.local",
        ".env.development",
        ".env.test",
        ".env.production",
        "Dockerfile",
        "docker-compose.yml",
        "Makefile",
        "CMakeLists.txt",
        "LICENSE",
        "CHANGELOG.md",
        "CONTRIBUTING.md",
        "CODE_OF_CONDUCT.md",
        ".gitignore",
        ".npmignore",
        ".dockerignore",
        ".eslintrc*",
        ".prettierrc*",
        "tsconfig.json",
        "*.min.js",
        "*.min.css",
        "*.map",
        "*.d.ts",
        "*.apk",
        "*.aab",
        "*.ipa",
        "*.hap",
    }

    gitignore_spec = None
    gitignore_path = os.path.join(root_dir, ".gitignore")
    if os.path.exists(gitignore_path):
        try:
            with open(gitignore_path, "r") as f:
                gitignore_spec = pathspec.PathSpec.from_lines("gitwildmatch", f)
        except Exception:
            pass

    found_files = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]

        rel_dir = os.path.relpath(dirpath, root_dir)
        if rel_dir == ".":
            rel_dir = ""

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
            full_path = os.path.join(dirpath, filename)

            try:
                if os.path.getsize(full_path) >= 150 * 1024:
                    continue
            except Exception:
                continue

            if gitignore_spec and gitignore_spec.match_file(rel_file_path):
                continue

            found_files.append(rel_file_path)

    return found_files


def extract_full_code(project_files, project_dir):
    """Extract code from project files with memory-efficient processing."""
    snippets = []

    file_groups = {}
    for f in project_files:
        d = os.path.dirname(f)
        if d not in file_groups:
            file_groups[d] = []
        file_groups[d].append(f)

    for d, files in file_groups.items():
        dir_snippets = []
        for file in files:
            file_path = os.path.join(project_dir, file)
            try:
                size_kb = os.path.getsize(file_path) / 1024
                # Use context manager to ensure file is closed
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()

                ext = Path(file).suffix[1:] or "txt"
                snippet = f"### {file}\n- **Path:** {file}\n- **Size:** {size_kb:.2f} KB\n```{ext}\n{content}\n```\n"
                dir_snippets.append(snippet)

                # Clear content reference to free memory
                del content

            except Exception as e:
                console.print(f"[red]Failed to read file: {file} - {e}[/red]")

        if dir_snippets:
            snippets.append(f"## {d}\n" + "".join(dir_snippets))
            # Clear dir_snippets to free memory
            del dir_snippets

    result = "".join(snippets) or "No code snippets available"
    # Clear snippets list to free memory
    del snippets
    return result


def get_backend_domain():
    try:
        r = requests.get("http://localhost:3000/api/health", timeout=0.5)
        if r.status_code == 200 and r.json().get("status") == "Ok":
            return "http://localhost:3000"
    except Exception:
        pass

    try:
        r = requests.get(
            "https://dokugen-readme.vercel.app/api/get-server-url", timeout=5
        )
        if r.status_code == 200:
            return r.json().get("domain")
    except Exception:
        pass

    return "https://dokugen-readme.vercel.app"
