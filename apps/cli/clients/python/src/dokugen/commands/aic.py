import os
import sys
import time
import requests
import subprocess
import questionary
from rich.console import Console
from dokugen import utils

console = Console()


def cmd_aic(args):
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
        try:
            subprocess.run(["git", "config", "core.autocrlf", "true"], capture_output=True)
            diff = subprocess.check_output(["git", "diff", "--cached", "--ignore-space-at-eol"], encoding="utf-8").strip()
        except Exception:
            diff = ""

        if not diff:
            console.print("[yellow]No staged changes detected. Staging all files...[/yellow]")
            try:
                subprocess.run(["git", "add", "."], check=True)
                diff = subprocess.check_output(["git", "diff", "--cached", "--ignore-space-at-eol"], encoding="utf-8").strip()
            except Exception as e:
                console.print(f"[red]Failed to stage files: {e}[/red]")
                sys.exit(1)

        if not diff:
            console.print("[yellow]No changes to commit![/yellow]")
            sys.exit(0)

        try:
            staged_files = subprocess.check_output(["git", "diff", "--cached", "--name-only"], encoding="utf-8").strip().split("\n")
            staged_files = [f for f in staged_files if f]
            console.print("\n[blue]Files being committed:[/blue]")
            for f in staged_files:
                console.print(f"[cyan]- {f}[/cyan]")
            console.print("")
        except Exception:
            pass

        start_time = time.time()

        with utils.create_ticking_spinner("Analyzing staged changes...") as spinner:
            backend_domain = utils.get_backend_domain()
            user_info = utils.get_user_info()

            response = requests.post(
                f"{backend_domain}/api/generate-commit",
                json={
                    "diff": diff,
                    "userInfo": user_info,
                },
                timeout=30,
            )

        if response.status_code != 200:
            err_msg = response.json().get("error", "Failed to generate commit message")
            console.print(f"[red]Failed to generate commit message: {err_msg}[/red]")
            sys.exit(1)

        commit_message = response.json().get("message", "").strip()
        if not commit_message:
            console.print("[red]No commit message generated from backend[/red]")
            sys.exit(1)

        elapsed_str = utils.format_elapsed_time(start_time)
        console.print(f"[green]Commit message generated successfully in {elapsed_str}[/green]")
        console.print(f'[green]"{commit_message}"\n[/green]')

        final_commit_message = commit_message

        while True:
            action = questionary.select(
                "What would you like to do?",
                choices=[
                    "Accept & Commit",
                    "Edit message",
                    "Regenerate message",
                    "Cancel",
                ],
            ).ask()

            if action is None or action == "Cancel":
                console.print("[yellow]Commit cancelled.[/yellow]")
                sys.exit(0)

            if action == "Accept & Commit":
                break
            elif action == "Edit message":
                edited = questionary.text(
                    "Edit commit message:",
                    default=final_commit_message,
                ).ask()

                if edited is None:
                    continue
                final_commit_message = edited.strip()
                console.print(f'\n[green]Updated commit message:\n"{final_commit_message}"\n[/green]')
            elif action == "Regenerate message":
                with utils.create_ticking_spinner("Regenerating commit message...") as spinner:
                    try:
                        response = requests.post(
                            f"{backend_domain}/api/generate-commit",
                            json={
                                "diff": diff,
                                "userInfo": utils.get_user_info(),
                            },
                            timeout=30,
                        )
                        if response.status_code == 200:
                            final_commit_message = response.json().get("message", "").strip()
                            console.print("[green]New commit message generated successfully[/green]")
                            console.print(f'[green]"{final_commit_message}"\n[/green]')
                        else:
                            console.print(f"[red]Failed to regenerate: {response.text}[/red]")
                    except Exception as err:
                        console.print(f"[red]Failed to regenerate: {err}[/red]")

        res = subprocess.run(["git", "commit", "-m", final_commit_message])
        if res.returncode != 0:
            console.print(f"[red]Git commit failed with exit status {res.returncode}[/red]")
            sys.exit(1)
        console.print("[green]\nCommit successful[/green]")

        if getattr(args, "push", False):
            console.print("[blue]> Running: git push[/blue]")
            subprocess.run(["git", "push"], check=True)
            console.print("[green]Push successful[/green]")

    except (requests.exceptions.RequestException, requests.exceptions.ConnectionError):
        raw_username = utils.get_user_info().get("username", "")
        username = "".join([i for i in raw_username if not i.isdigit()]) if raw_username else ""
        console.print(f"[red]Opps... {username} kindly check your device or pc internet connection and try again.[/red]")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]Commit failed: {e}[/red]")
        sys.exit(1)


def register_aic_parser(subparsers):
    project_name = os.path.basename(os.getcwd())
    aic_parser = subparsers.add_parser("aic", aliases=["ai-commit"], help=f"AI-powered Git commit generator for {project_name}")
    aic_parser.add_argument(
        "--push", "-p",
        action="store_true",
        default=False,
        help="Push after committing"
    )
