import base64
import datetime
import gzip
import hashlib
import fnmatch
import json
import os
import platform
import subprocess
import sys
import time
import threading
import webbrowser
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
GITHUB_CLIENT_ID = "Ov23lijkkVQnSyY7s17q"
CONFIG_DIR = os.path.join(os.path.expanduser("~"), ".dokugen")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")

# Sentinel: prevents double check_and_update when interactive menu + subcommand both call it
_update_checked = False


def get_stored_config():
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as config_file:
            data = json.load(config_file)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def save_stored_config(updates):
    try:
        os.makedirs(CONFIG_DIR, mode=0o700, exist_ok=True)
        config = get_stored_config()
        config.update(updates)
        descriptor = os.open(CONFIG_FILE, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(descriptor, "w", encoding="utf-8") as config_file:
            json.dump(config, config_file, indent=2)
        os.chmod(CONFIG_FILE, 0o600)
        return True
    except Exception as error:
        console.print(f"[red]Failed to save Dokugen config: {error}[/red]")
        return False


def clear_stored_config():
    try:
        if os.path.exists(CONFIG_FILE):
            os.remove(CONFIG_FILE)
    except Exception as error:
        console.print(f"[red]Failed to clear Dokugen config: {error}[/red]")


def login_with_github():
    try:
        device_response = requests.post(
            "https://github.com/login/device/code",
            json={"client_id": GITHUB_CLIENT_ID, "scope": "read:user user:email"},
            headers={"Accept": "application/json"},
            timeout=15,
        )
        device_response.raise_for_status()
        device = device_response.json()
        console.print(f"\n1. Open: [cyan underline]{device['verification_uri']}[/cyan underline]")
        console.print(f"2. Enter code: [bold yellow]{device['user_code']}[/bold yellow]\n")
        webbrowser.open(device["verification_uri"])

        interval = int(device.get("interval", 5))
        expires_at = time.time() + int(device.get("expires_in", 900))
        while time.time() < expires_at:
            time.sleep(interval)
            token_response = requests.post(
                "https://github.com/login/oauth/access_token",
                json={
                    "client_id": GITHUB_CLIENT_ID,
                    "device_code": device["device_code"],
                    "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
                },
                headers={"Accept": "application/json"},
                timeout=15,
            )
            data = token_response.json()
            if data.get("error") == "authorization_pending":
                continue
            if data.get("error") == "slow_down":
                interval = int(data.get("interval", interval)) + 5
                continue
            if data.get("error"):
                console.print(f"[red]Authentication failed: {data.get('error_description', data['error'])}[/red]")
                return None

            access_token = data.get("access_token")
            if not access_token:
                continue
            headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
            profile_response = requests.get("https://api.github.com/user", headers=headers, timeout=15)
            profile_response.raise_for_status()
            profile = profile_response.json()
            email = profile.get("email") or ""
            if not email:
                emails_response = requests.get("https://api.github.com/user/emails", headers=headers, timeout=15)
                emails_response.raise_for_status()
                primary = next((item for item in emails_response.json() if item.get("primary") and item.get("verified")), None)
                email = primary.get("email", "") if primary else ""

            existing = get_stored_config()
            config = {
                "username": profile["login"],
                "email": email,
                "opted_out": bool(existing.get("opted_out", False)),
                "access_token": access_token,
            }
            if not save_stored_config(config):
                return None
            console.print(f"[green]Successfully authenticated as @{profile['login']}![/green]")
            return config
    except Exception as error:
        console.print(f"[red]GitHub login failed: {error}[/red]")
    return None


def ensure_authenticated():
    config = get_stored_config()
    if config.get("username") and config.get("access_token"):
        return config
    console.print("[cyan]GitHub authentication required. Please log in to continue.[/cyan]")
    config = login_with_github()
    if not config:
        console.print("[red]Authentication required. Run 'dokugen login' to sign in.[/red]")
        raise SystemExit(1)
    return config


def get_auth_headers():
    token = get_stored_config().get("access_token")
    if not token:
        raise RuntimeError("GitHub authentication required. Run 'dokugen login'.")
    return {"Authorization": f"Bearer {token}"}


def update_leaderboard_preference(opted_out):
    ensure_authenticated()
    response = requests.post(
        f"{get_backend_domain()}/api/auth/preferences",
        json={"opted_out": bool(opted_out)},
        headers=get_auth_headers(),
        timeout=10,
    )
    response.raise_for_status()
    if not save_stored_config({"opted_out": bool(opted_out)}):
        raise RuntimeError("Server preference updated, but local config could not be saved")


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
    global _update_checked
    if _update_checked:
        return
    _update_checked = True
    try:
        current_version = get_installed_version()
        if not current_version:
            return

        with requests.get(PYPI_URL, timeout=3) as response:
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
    stored = get_stored_config()
    git_name = ""
    git_email = ""
    try:
        git_name = subprocess.check_output(
            ["git", "config", "--get", "user.name"], encoding="utf-8"
        ).strip()
    except Exception:
        pass

    try:
        git_email = subprocess.check_output(
            ["git", "config", "--get", "user.email"], encoding="utf-8"
        ).strip()
    except Exception:
        pass

    username = stored.get("username") or git_name
    if not username and git_email and "@users.noreply.github.com" in git_email:
        parts = git_email.split("@")[0]
        if "+" in parts:
            username = parts.split("+", 1)[1]
        else:
            username = parts

    if not username:
        try:
            username = os.getlogin()
        except Exception:
            username = "Unknown"

    os_info = {
        "platform": platform.system() or "unknown",
        "arch": platform.machine() or "unknown",
        "release": platform.release() or "unknown",
    }

    return {
        "username": username,
        "email": stored.get("email") or git_email,
        "osInfo": os_info,
        "opted_out": bool(stored.get("opted_out", False)),
    }


def check_internet_connection():
    try:
        with requests.get("https://www.google.com", timeout=5, stream=True) as r:
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
    return get_stored_config()

def save_profile(profile):
    return save_stored_config(profile)

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
    if readme_backup is not None and current_readme_path:
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


def discard_readme_backup():
    """Clear the in-memory backup after a successful write."""
    global readme_backup, current_readme_path
    readme_backup = None
    current_readme_path = ""


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
    return fnmatch.fnmatch(filename.lower(), pattern.lower())


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
        ".env*",
        "*.pem",
        "*.key",
        "*.p12",
        "*.pfx",
        "id_rsa",
        "id_ed25519",
        "credentials.json",
        "service-account*.json",
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
        dirnames[:] = [
            d for d in dirnames
            if d not in ignore_dirs and not os.path.islink(os.path.join(dirpath, d))
        ]

        rel_dir = os.path.relpath(dirpath, root_dir)
        if rel_dir == ".":
            rel_dir = ""

        if gitignore_spec and rel_dir and gitignore_spec.match_file(rel_dir):
            dirnames[:] = []
            continue

        for filename in filenames:
            full_path = os.path.join(dirpath, filename)
            if os.path.islink(full_path):
                continue
            should_ignore = False
            for pattern in ignore_files:
                if matches_ignore_pattern(filename, pattern):
                    should_ignore = True
                    break

            if should_ignore:
                continue

            rel_file_path = os.path.join(rel_dir, filename)
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
    env_domain = os.environ.get("DOKUGEN_LOCAL_BACKEND_DOMAIN") or os.environ.get("BACKEND_DOMAIN")
    if env_domain:
        return env_domain

    for port in ["3000", "3002", "3001"]:
        try:
            with requests.get(f"http://localhost:{port}/api/health", timeout=0.5) as r:
                if r.status_code == 200 and r.json().get("status") == "Ok":
                    return f"http://localhost:{port}"
        except Exception:
            pass

    try:
        with requests.get(
            "https://dokugen.samueltuoyo.com/api/get-server-url", timeout=5
        ) as r:
            if r.status_code == 200:
                return r.json().get("domain")
    except Exception:
        pass

    return "https://api-dokugen.samueltuoyo.com"
