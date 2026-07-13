#!/usr/bin/env python3
import os
import sys
# Add parent 'src' directory to sys.path so it runs directly from any path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import argparse
import questionary
from rich.console import Console
from dokugen import utils
from dokugen.commands.generate import cmd_generate, register_generate_parser, DOKUGEN_BANNER
from dokugen.commands.update import cmd_update, register_update_parser
from dokugen.commands.revert import cmd_revert, register_revert_parser
from dokugen.commands.aic import cmd_aic, register_aic_parser
from dokugen.commands.license import cmd_license, register_license_parser

console = Console()


def main():
    try:
        project_name = os.path.basename(os.getcwd())
        parser = argparse.ArgumentParser(
            prog="dokugen",
            description=f"Automatically generate high-quality README for {project_name}",
        )
        parser.add_argument("--version", "-v", action="version", version="%(prog)s 14.0.1")

        subparsers = parser.add_subparsers(dest="command")

        # Register subcommand parsers
        register_generate_parser(subparsers)
        register_update_parser(subparsers)
        register_revert_parser(subparsers)
        register_license_parser(subparsers)
        register_aic_parser(subparsers)

        if len(sys.argv) == 1:
            utils.check_and_update()
            console.print(DOKUGEN_BANNER, style="#000080")
            console.print("[blue]Welcome to Dokugen (v14.0.1) - Automatic README Generator\n[/blue]")

            action = questionary.select(
                "What would you like to do?",
                choices=[
                    questionary.Choice(f"Generate README  - Scan {project_name} and create a new README.md", value="generate"),
                    questionary.Choice(f"Update README    - Update an existing Dokugen-generated README for {project_name}", value="update"),
                    questionary.Choice(f"Revert README    - Restore the previous Dokugen-generated README for {project_name}", value="revert"),
                    questionary.Choice(f"Generate LICENSE - Generate a LICENSE file, {project_name} shouldn't be pushed to GitHub unlicensed", value="license"),
                    questionary.Choice(f"AI Git Commit    - Generate commit message and commit staged changes for {project_name}", value="aic"),
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

            if action == "generate":
                cmd_generate(Args())
            elif action == "update":
                cmd_update(Args())
            elif action == "revert":
                cmd_revert(Args())
            elif action == "license":
                cmd_license(Args())
            elif action == "aic":
                cmd_aic(Args())
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
            elif args.command in ["aic", "ai-commit"]:
                cmd_aic(args)
            else:
                parser.print_help()
    except KeyboardInterrupt:
        sys.stdout.write('\x1b[2J\x1b[3J\x1b[H')
        sys.stdout.flush()
        console.print("[bold #000080]Dokugen: Goodbye![/bold #000080]")
        sys.exit(0)


if __name__ == "__main__":
    main()
