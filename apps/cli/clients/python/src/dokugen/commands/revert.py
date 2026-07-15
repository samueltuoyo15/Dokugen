import os
import sys
import threading
import requests
import questionary
from rich.console import Console
from dokugen import utils

console = Console()


def ask_yes_no(message):
    try:
        answer = questionary.select(
            message,
            choices=["Yes", "No"],
        ).ask()
        if answer is None:
            return "cancel"
        return "yes" if answer == "Yes" else "no"
    except KeyboardInterrupt:
        return "cancel"


def cmd_revert(args):
    utils.check_and_update()
    project_dir = os.getcwd()
    backup_file = utils.get_dokugen_backup_path(project_dir)

    if not os.path.exists(backup_file):
        console.print("[red]No backup found. Run 'dokugen generate' or 'dokugen update' first to create one.[/red]")
        sys.exit(1)

    console.print("[blue]Found a previous README backup.[/blue]")
    project_name = os.path.basename(project_dir)
    ans = ask_yes_no(f"Revert {project_name} README.md to the previous Dokugen-generated version?")
    if ans != "yes":
        console.print("[yellow]Revert cancelled.[/yellow]")
        return

    _, err = utils.revert_readme_from_disk(project_dir)
    if err:
        console.print(f"[red]Failed to revert README: {err}[/red]")
        sys.exit(1)

    console.print("[green]README.md successfully reverted to the previous version![/green]")

    # Fire-and-forget usage tracking
    try:
        backend_domain = utils.get_backend_domain()
        user_info = utils.get_user_info()
        if user_info and user_info.get("username") and user_info.get("email"):
            threading.Thread(
                target=lambda: requests.post(
                    f"{backend_domain}/api/track",
                    json={"userInfo": user_info, "usageType": "revert"},
                    timeout=5
                ),
                daemon=True
            ).start()
    except Exception:
        pass


def register_revert_parser(subparsers):
    project_name = os.path.basename(os.getcwd())
    subparsers.add_parser("revert", help=f"Revert {project_name} README.md to the previous Dokugen-generated backup")
