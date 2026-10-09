#!/usr/bin/env python3
import os
import sys
# Add parent 'src' directory to sys.path so it runs directly from any path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import argparse
import questionary
from importlib.metadata import version as _get_version
from rich.console import Console
from dokugen import utils
from dokugen.commands.generate import cmd_generate, register_generate_parser, DOKUGEN_BANNER
from dokugen.commands.update import cmd_update, register_update_parser
from dokugen.commands.revert import cmd_revert, register_revert_parser
from dokugen.commands.aic import cmd_aic, register_aic_parser
from dokugen.commands.license import cmd_license, register_license_parser
from dokugen.commands.og import cmd_og, register_og_parser
from dokugen.commands.changelog import cmd_changelog, register_changelog_parser

console = Console()


def main():
    try:
        try:
            __version__ = _get_version("dokugen")
        except Exception:
            __version__ = "unknown"
        project_name = os.path.basename(os.getcwd())
        parser = argparse.ArgumentParser(
            prog="dokugen",
            description=f"Automatically generate high-quality README for {project_name}",
        )
        parser.add_argument("--version", "-v", action="version", version=f"%(prog)s {__version__}")

        subparsers = parser.add_subparsers(dest="command")

        # Register subcommand parsers
        register_generate_parser(subparsers)
        register_update_parser(subparsers)
        register_revert_parser(subparsers)
        register_license_parser(subparsers)
        register_aic_parser(subparsers)
        register_og_parser(subparsers)
        register_changelog_parser(subparsers)
        subparsers.add_parser("login", help="Authenticate with GitHub using device authorization")
        subparsers.add_parser("logout", help="Log out and clear stored Dokugen credentials")
        config_parser = subparsers.add_parser("config", help="View or update Dokugen configuration")
        preference_group = config_parser.add_mutually_exclusive_group()
        preference_group.add_argument("--opt-out-leaderboard", action="store_true")
        preference_group.add_argument("--opt-in-leaderboard", action="store_true")

        if len(sys.argv) == 1:
            utils.check_and_update()
            console.print(DOKUGEN_BANNER, style="#000080")
            console.print(f"[blue]Welcome to Dokugen (v{__version__}) - Automatic README Generator\n[/blue]")

            action = questionary.select(
                "What would you like to do?",
                choices=[
                    questionary.Choice(f"Generate README  - Scan {project_name} and create a new README.md", value="generate"),
                    questionary.Choice(f"Update README    - Update an existing Dokugen-generated README for {project_name}", value="update"),
                    questionary.Choice(f"Revert README    - Restore the previous Dokugen-generated README for {project_name}", value="revert"),
                    questionary.Choice("Generate LICENSE - Protect your work and open the door to collaboration for {project_name}.", value="license"),
                    questionary.Choice(f"Generate CHANGELOG - Analyze commit history and update CHANGELOG.md for {project_name}", value="changelog"),
                    questionary.Choice(f"AI Git Commit    - Generate commit message and commit staged changes for {project_name}", value="aic"),
                    questionary.Choice("Account Settings - Login or manage leaderboard privacy", value="config"),
                    questionary.Choice("View Help        - Show all available commands and options", value="help"),
                    questionary.Choice("Exit", value="exit"),
                ],
            ).ask()

            if action == "exit" or action is None:
                sys.stdout.write('\x1b[2J\x1b[3J\x1b[H')
                sys.stdout.flush()
                console.print("[bold #000080]Dokugen: Goodbye![/bold #000080]")
                return

            class Args:
                template = None
                overwrite = True
                push = False
                force_new = False
                version_tag = None
                limit = "200"
                model = None
                outfile = "CHANGELOG.md"

            if action == "generate":
                cmd_generate(Args())
            elif action == "update":
                cmd_update(Args())
            elif action == "revert":
                cmd_revert(Args())
            elif action == "license":
                cmd_license(Args())
            elif action == "changelog":
                cmd_changelog(Args())
            elif action == "aic":
                cmd_aic(Args())
            elif action == "config":
                config = utils.get_stored_config()
                if not config.get("username"):
                    utils.login_with_github()
                else:
                    console.print(f"[bold]GitHub account:[/bold] @{config['username']}")
                    console.print(f"[bold]Leaderboard:[/bold] {'Hidden' if config.get('opted_out') else 'Visible'}")
            elif action == "og":
                cmd_og(Args())
            elif action == "help":
                parser.print_help()

        else:
            args = parser.parse_args()
            if args.command == "generate":
                cmd_generate(args)
            elif args.command == "update":
                cmd_update(args)
            elif args.command == "revert":
                cmd_revert(args)
            elif args.command == "license":
                cmd_license(args)
            elif args.command in ["changelog", "ai-changelog"]:
                cmd_changelog(args)
            elif args.command in ["aic", "ai-commit"]:
                cmd_aic(args)
            elif args.command == "og":
                cmd_og(args)
            elif args.command == "login":
                utils.login_with_github()
            elif args.command == "logout":
                config = utils.get_stored_config()
                utils.clear_stored_config()
                console.print(f"[green]Logged out from @{config.get('username', 'unknown')}. Local config cleared.[/green]")
            elif args.command == "config":
                if args.opt_out_leaderboard:
                    utils.update_leaderboard_preference(True)
                    console.print("[green]You are hidden from the public leaderboard.[/green]")
                elif args.opt_in_leaderboard:
                    utils.update_leaderboard_preference(False)
                    console.print("[green]You are visible on the public leaderboard.[/green]")
                else:
                    config = utils.get_stored_config()
                    console.print(f"[bold]GitHub account:[/bold] @{config.get('username', 'Not logged in')}")
                    console.print(f"[bold]Leaderboard:[/bold] {'Hidden' if config.get('opted_out') else 'Visible'}")
            else:
                parser.print_help()
    except KeyboardInterrupt:
        sys.stdout.write('\x1b[2J\x1b[3J\x1b[H')
        sys.stdout.flush()
        console.print("[bold #000080]Dokugen: Goodbye![/bold #000080]")
        sys.exit(0)


if __name__ == "__main__":
    main()
