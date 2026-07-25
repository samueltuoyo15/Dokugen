import os
import sys
import json
import time
import requests
import subprocess
from rich.console import Console
from dokugen import utils

console = Console()


def cmd_changelog(args):
    utils.check_and_update()
    if not utils.is_git_repository():
        console.print("[red]Opps... No Git repository found. Please navigate to a project directory that has a Git repository, or initialize one using 'git init'.[/red]")
        sys.exit(1)

    if not utils.check_internet_connection():
        raw_username = utils.get_user_info().get("username", "")
        username = "".join([i for i in raw_username if not i.isdigit()]) if raw_username else ""
        console.print(f"[red]Opps... {username} kindly check your device or pc internet connection and try again.[/red]")
        sys.exit(1)

    try:
        limit = getattr(args, "limit", 50)
        try:
            git_logs = subprocess.check_output(
                ["git", "log", f"-n{limit}", "--pretty=format:%h - %s (%an, %ad)", "--date=short"],
                encoding="utf-8"
            ).strip()
        except Exception as e:
            console.print(f"[red]Failed to retrieve git log history: {e}[/red]")
            sys.exit(1)

        if not git_logs:
            console.print("[yellow]No git commit history found in this repository.[/yellow]")
            sys.exit(0)

        version = getattr(args, "version_tag", None)
        if not version:
            try:
                version = subprocess.check_output(["git", "describe", "--tags", "--abbrev=0"], encoding="utf-8").strip()
            except Exception:
                if os.path.exists("package.json"):
                    try:
                        with open("package.json", "r", encoding="utf-8") as f:
                            pkg = json.load(f)
                            if "version" in pkg:
                                version = f"v{pkg['version']}"
                    except Exception:
                        version = "Unreleased"
                else:
                    version = "Unreleased"

        outfile_name = getattr(args, "outfile", "CHANGELOG.md") or "CHANGELOG.md"
        outfile = os.path.abspath(outfile_name)
        existing_changelog = ""

        if os.path.exists(outfile):
            try:
                with open(outfile, "r", encoding="utf-8") as f:
                    existing_changelog = f.read()
            except Exception:
                pass

        start_time = time.time()
        with utils.create_ticking_spinner("Analyzing commit history and generating CHANGELOG...") as spinner:
            backend_domain = utils.get_backend_domain()
            user_info = utils.get_user_info()

            response = requests.post(
                f"{backend_domain}/api/generate-changelog",
                json={
                    "logs": git_logs,
                    "version": version,
                    "existingChangelog": existing_changelog,
                    "userInfo": user_info,
                },
                timeout=60,
            )

        if response.status_code != 200:
            err_msg = response.json().get("error", "Failed to generate changelog")
            console.print(f"[red]Failed to generate changelog: {err_msg}[/red]")
            sys.exit(1)

        generated_content = response.json().get("changelog", "").strip()
        if not generated_content:
            console.print("[red]No changelog content returned from backend[/red]")
            sys.exit(1)

        with open(outfile, "w", encoding="utf-8") as f:
            f.write(generated_content + "\n")

        elapsed_str = utils.format_elapsed_time(start_time)
        console.print(f"[green]CHANGELOG generated successfully in {elapsed_str}! Written to {os.path.basename(outfile)}[/green]")

    except (requests.exceptions.RequestException, requests.exceptions.ConnectionError):
        raw_username = utils.get_user_info().get("username", "")
        username = "".join([i for i in raw_username if not i.isdigit()]) if raw_username else ""
        console.print(f"[red]Opps... {username} kindly check your device or pc internet connection and try again.[/red]")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]Changelog generation failed: {e}[/red]")
        sys.exit(1)


def register_changelog_parser(subparsers):
    project_name = os.path.basename(os.getcwd())
    changelog_parser = subparsers.add_parser(
        "changelog",
        aliases=["ai-changelog"],
        help=f"AI-powered CHANGELOG generator for {project_name}"
    )
    changelog_parser.add_argument(
        "--version-tag", "-v",
        type=str,
        default=None,
        help="Version header (e.g. v1.0.0)"
    )
    changelog_parser.add_argument(
        "--limit", "-n",
        type=int,
        default=50,
        help="Number of commits to analyze"
    )
    changelog_parser.add_argument(
        "--outfile", "-o",
        type=str,
        default="CHANGELOG.md",
        help="Output file path"
    )
