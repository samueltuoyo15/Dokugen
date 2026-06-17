#!/usr/bin/env python3
import os
import sys
import json
import argparse
import requests
import questionary
from rich.console import Console
from dokugen.project_detect import detect_project_type
from dokugen import utils

console = Console()

DOKUGEN_BANNER = """
   ___   ____  __ ____  _____________  __
  / _ \\ / __ \\/ //_/ / / / ____/ ____/ / /
 / / / / / / / ,< / / / / / __/ __/ / /_ 
/ /_/ / /_/ / /| / /_/ / /_/ / /___/ / / 
\\____/\\____/_/ |_\\____/\\____/_____/_/ /  
                                   /_/   
"""

API_TIMEOUT = 300


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


def generate_readme_remote(project_type, project_files, project_dir, existing_readme=None, template_url=None):
    try:
        console.print("[blue]Analyzing project files...[/blue]")
        readme_path = os.path.join(project_dir, "README.md")

        include_setup = False
        include_contrib = False
        include_api_docs = False
        include_diagrams = False
        linkedin_url = ""
        twitter_url = ""

        if not template_url:
            ans_setup = ask_yes_no("Do you want to include setup instructions in the README?")
            if ans_setup == "cancel":
                return None
            include_setup = (ans_setup == "yes")

            ans_contrib = ask_yes_no("Include contribution guidelines in README?")
            if ans_contrib == "cancel":
                return None
            include_contrib = (ans_contrib == "yes")

            ans_api = ask_yes_no("Include API documentation in README?")
            if ans_api == "cancel":
                return None
            include_api_docs = (ans_api == "yes")

            ans_diagrams = ask_yes_no("Include system design diagrams in README?")
            if ans_diagrams == "cancel":
                return None
            include_diagrams = (ans_diagrams == "yes")

            try:
                linkedin_url = questionary.text(
                    "LinkedIn profile URL (leave blank to skip):",
                ).ask() or ""
                twitter_url = questionary.text(
                    "X (Twitter) profile URL (leave blank to skip):",
                ).ask() or ""
            except KeyboardInterrupt:
                return None

        is_incremental = False
        modified_files = []
        cache = utils.load_cache(project_dir)

        if existing_readme and cache:
            console.print("[blue]Checking for codebase changes since last generation...[/blue]")
            for f in project_files:
                file_path = os.path.join(project_dir, f)
                current_hash = utils.get_file_hash(file_path)
                cached_hash = cache.get("files", {}).get(f)
                if current_hash != cached_hash:
                    modified_files.append(f)

            # Check if any files were deleted
            cache_file_paths = cache.get("files", {}).keys()
            deleted_files = [f for f in cache_file_paths if f not in project_files]

            if not modified_files and not deleted_files:
                console.print("[green]No changes detected in codebase. README is already up to date![/green]")
                return readme_path

            is_incremental = True
            console.print(f"[yellow]Incremental update: {len(modified_files)} file(s) changed, {len(deleted_files)} file(s) deleted.[/yellow]")

        full_code = utils.extract_full_code(modified_files if is_incremental else project_files, project_dir)
        user_info = utils.get_user_info()
        repo_url = utils.get_git_repo_url()

        backend_domain = utils.get_backend_domain()

        compressed_full_code = utils.compress_data(full_code)
        compressed_existing_readme = utils.compress_data(existing_readme) if existing_readme else None

        payload = {
            "projectType": project_type,
            "projectFiles": project_files,
            "fullCode": compressed_full_code,
            "userInfo": user_info,
            "options": {
                "includeSetup": include_setup, 
                "includeContributionGuideLine": include_contrib,
                "includeApiDocs": include_api_docs,
                "includeDiagrams": include_diagrams,
                "linkedinUrl": linkedin_url,
                "twitterUrl": twitter_url,
                "isIncremental": is_incremental,
                "modifiedFiles": modified_files if is_incremental else None,
            },
            "existingReadme": compressed_existing_readme,
            "repoUrl": repo_url,
            "templateUrl": template_url,
            "compressed": True,
        }

        import time
        start_time = time.time()
        spinner = utils.create_ticking_spinner("Generating README...")
        spinner.__enter__()

        try:
            response = requests.post(
                f"{backend_domain}/api/generate-readme",
                json=payload,
                stream=True,
                timeout=API_TIMEOUT,
            )

            if response.status_code != 200:
                spinner.__exit__(None, None, None)
                console.print(f"[red]Error {response.status_code}: {response.text}[/red]")
                utils.restore_readme()
                return None

            # Write response with proper resource management
            with open(readme_path, "w", encoding="utf-8") as f:
                for line in response.iter_lines():
                    if line:
                        decoded = line.decode("utf-8")
                        if decoded.startswith("data:"):
                            json_str = decoded.replace("data: ", "").strip()
                            try:
                                data = json.loads(json_str)
                                if "response" in data and isinstance(data["response"], str):
                                    f.write(data["response"])
                                    f.flush()
                            except Exception:
                                pass
        finally:
            spinner.__exit__(None, None, None)
            try:
                response.close()
            except Exception:
                pass

        elapsed_str = utils.format_elapsed_time(start_time)
        console.print(f"\n[green]README.md created successfully in {elapsed_str}[/green]")
        console.print("[cyan]\nLove Dokugen? Consider supporting the project: [/cyan]"
                      "[blue underline][link=https://myhappr.com/samueltuoyo]https://myhappr.com/samueltuoyo[/link][/blue underline]"
                      "[dim] (Cmd+Click / Ctrl+Click to follow link)[/dim]")
        utils.readme_backup = None

        # Save cache
        new_cache_files = {}
        for f in project_files:
            file_path = os.path.join(project_dir, f)
            new_cache_files[f] = utils.get_file_hash(file_path)
        utils.save_cache(project_dir, {"version": "1.0", "files": new_cache_files})

        return readme_path

    except (Exception, KeyboardInterrupt) as e:
        if isinstance(e, KeyboardInterrupt):
            console.print("[yellow]\nProcess interrupted. Restoring backup...[/yellow]")
        else:
            console.print(f"[red]\n Error Generating Readme: {e}[/red]")
        utils.restore_readme()
        return None


def cmd_generate(args):
    if not utils.is_git_repository():
        console.print("[red]Opps... No Git repository found. Please navigate to a project directory that has a Git repository, or initialize one using 'git init'.[/red]")
        sys.exit(1)

    utils.check_and_update()
    console.print(DOKUGEN_BANNER, style="#000080")

    project_dir = os.getcwd()
    readme_path = os.path.join(project_dir, "README.md")
    readme_exists = os.path.exists(readme_path)

    with utils.create_spinner("Checking internet..."):
        has_connection = utils.check_internet_connection()

    if not has_connection:
        username = utils.get_user_info().get("username", "Unknown")
        console.print(f"[red]Opps... {username} kindly check your device or pc internet connection and try again.[/red]")
        return

    if readme_exists:
        utils.backup_readme(readme_path)

    try:
        template_url = getattr(args, "template", None)
        if template_url and "github.com" not in template_url:
            console.print("[red]Invalid GitHub URL. Use format: https://github.com/user/repo/blob/main/README.md[/red]")
            sys.exit(1)

        project_type = detect_project_type(project_dir)

        with utils.create_spinner("Scanning project files...") as spinner:
            project_files = utils.scan_files(project_dir)

        console.print(f"[yellow]Found: {len(project_files)} files in the project[/yellow]")
        console.print(f"[blue]Detected project type: {project_type}[/blue]")

        if template_url:
            existing_content = None
            if readme_exists and not getattr(args, "overwrite", True):
                with open(readme_path, "r", encoding="utf-8") as f:
                    existing_content = f.read()
            generate_readme_remote(project_type, project_files, project_dir, existing_content, template_url)
            console.print("[green]README.md generated from template![/green]")
            return

        if readme_exists:
            if not getattr(args, "overwrite", True):
                with open(readme_path, "r", encoding="utf-8") as f:
                    existing_content = f.read()
                generate_readme_remote(project_type, project_files, project_dir, existing_content, None)
            else:
                ans = ask_yes_no("README.md exists. Overwrite?")
                if ans == "yes":
                    generate_readme_remote(project_type, project_files, project_dir, None, None)
                elif ans == "no":
                    console.print("[yellow]README update skipped (user selected No)[/yellow]")
                    return
                elif ans == "cancel":
                    console.print("[yellow]README generation cancelled[/yellow]")
                    utils.restore_readme()
                    return
        else:
            generate_readme_remote(project_type, project_files, project_dir, None, None)

    except (Exception, KeyboardInterrupt) as e:
        if isinstance(e, KeyboardInterrupt):
            console.print("[yellow]\nProcess interrupted. Restoring backup...[/yellow]")
        else:
            console.print(f"[red]Error: {e}[/red]")
        utils.restore_readme()
        sys.exit(1)


def cmd_update(args):
    if not utils.is_git_repository():
        console.print("[red]Opps... No Git repository found. Please navigate to a project directory that has a Git repository, or initialize one using 'git init'.[/red]")
        sys.exit(1)

    utils.check_and_update()
    console.print(DOKUGEN_BANNER, style="#000080")

    project_dir = os.getcwd()
    readme_path = os.path.join(project_dir, "README.md")

    if not os.path.exists(readme_path):
        console.print("[red]No README.md found. Use 'dokugen generate' to create one first.[/red]")
        sys.exit(1)

    with utils.create_spinner("Checking internet..."):
        has_connection = utils.check_internet_connection()

    if not has_connection:
        username = utils.get_user_info().get("username", "Unknown")
        console.print(f"[red]Opps... {username} kindly check your device or pc internet connection and try again.[/red]")
        return

    try:
        utils.backup_readme(readme_path)

        template_url = getattr(args, "template", None)

        if template_url and "github.com" not in template_url:
            console.print("[red]Invalid GitHub URL. Use format: https://github.com/user/repo/blob/main/README.md[/red]")
            sys.exit(1)

        with open(readme_path, "r", encoding="utf-8") as f:
            existing_content = f.read()

        has_markers = "<!-- DOKUGEN:" in existing_content or "[![Readme was generated by Dokugen]" in existing_content

        if not has_markers:
            console.print("[yellow]This README doesn't appear to be generated by Dokugen.[/yellow]")
            ans = ask_yes_no("Do you want to regenerate the entire README?")

            if ans == "yes":
                project_type = detect_project_type(project_dir)
                with utils.create_spinner("Scanning project files..."):
                    project_files = utils.scan_files(project_dir)
                console.print(f"[yellow]Found: {len(project_files)} files in the project[/yellow]")

                generate_readme_remote(project_type, project_files, project_dir, None, template_url)
                console.print("[green]README.md regenerated successfully![/green]")
                return
            else:
                console.print("[yellow]Update cancelled.[/yellow]")
                utils.restore_readme()
                return

        console.print("[blue]Analyzing README structure...[/blue]")
        project_type = detect_project_type(project_dir)

        with utils.create_spinner("Scanning project files..."):
            project_files = utils.scan_files(project_dir)

        console.print(f"[yellow]Found: {len(project_files)} files in the project[/yellow]")
        console.print(f"[blue]Detected project type: {project_type}[/blue]")
        console.print("[blue]Updating auto-generated sections...[/blue]")

        generate_readme_remote(project_type, project_files, project_dir, existing_content, template_url)
        console.print("[green]README.md updated successfully! Custom sections preserved.[/green]")

    except (Exception, KeyboardInterrupt) as e:
        if isinstance(e, KeyboardInterrupt):
            console.print("[yellow]\nProcess interrupted. Restoring backup...[/yellow]")
        else:
            console.print(f"[red]Error updating README: {e}[/red]")
        utils.restore_readme()
        sys.exit(1)


def cmd_revert(args):
    utils.check_and_update()
    project_dir = os.getcwd()
    backup_file = os.path.join(project_dir, ".dokugen-backup.md")

    if not os.path.exists(backup_file):
        console.print("[red]No backup found. Run 'dokugen generate' or 'dokugen update' first to create one.[/red]")
        sys.exit(1)

    console.print("[blue]Found a previous README backup.[/blue]")
    ans = ask_yes_no("Revert README.md to the previous Dokugen-generated version?")
    if ans != "yes":
        console.print("[yellow]Revert cancelled.[/yellow]")
        return

    _, err = utils.revert_readme_from_disk(project_dir)
    if err:
        console.print(f"[red]Failed to revert README: {err}[/red]")
        sys.exit(1)

    console.print("[green]README.md successfully reverted to the previous version![/green]")


def cmd_aic(args):
    utils.check_and_update()
    if not utils.is_git_repository():
        console.print("[red]Opps... No Git repository found. Please navigate to a project directory that has a Git repository, or initialize one using 'git init'.[/red]")
        sys.exit(1)

    try:
        import subprocess
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

        import time
        start_time = time.time()
        spinner = utils.create_ticking_spinner("Analyzing staged changes...")
        spinner.__enter__()

        try:
            backend_domain = utils.get_backend_domain()

            response = requests.post(
                f"{backend_domain}/api/generate-commit",
                json={
                    "diff": diff,
                },
                timeout=30
            )

            if response.status_code != 200:
                spinner.__exit__(None, None, None)
                console.print(f"[red]Error {response.status_code}: {response.text}[/red]")
                sys.exit(1)

            commit_message = response.json().get("message")
            if not commit_message:
                raise Exception("No commit message generated from backend")
        finally:
            spinner.__exit__(None, None, None)

        elapsed_str = utils.format_elapsed_time(start_time)
        console.print(f"[green]Commit message generated successfully in {elapsed_str}:\n[/green]")
        console.print(f"[green]\"{commit_message}\"\n[/green]")

        final_commit_message = commit_message

        while True:
            action = questionary.select(
                "What would you like to do?",
                choices=[
                    questionary.Choice("Accept & Commit", value="commit"),
                    questionary.Choice("Edit message", value="edit"),
                    questionary.Choice("Regenerate message", value="regenerate"),
                    questionary.Choice("Cancel", value="cancel"),
                ]
            ).ask()

            if action == "cancel" or action is None:
                console.print("[yellow]Commit cancelled.[/yellow]")
                sys.exit(0)

            if action == "commit":
                break
            elif action == "edit":
                edited = questionary.text(
                    "Edit commit message:",
                    default=final_commit_message
                ).ask()
                if edited is None:
                    continue
                final_commit_message = edited.strip()
                console.print(f"\n[green]Updated commit message:\n\"{final_commit_message}\"\n[/green]")
            elif action == "regenerate":
                regen_spinner = utils.create_ticking_spinner("Regenerating commit message...")
                regen_spinner.__enter__()
                try:
                    response = requests.post(
                        f"{backend_domain}/api/generate-commit",
                        json={"diff": diff},
                        timeout=30
                    )
                    if response.status_code != 200:
                        raise Exception(response.text)
                    final_commit_message = response.json().get("message")
                    if not final_commit_message:
                        raise Exception("No commit message generated from backend")
                    regen_spinner.__exit__(None, None, None)
                    console.print(f"[green]New commit message generated successfully:\n\"{final_commit_message}\"\n[/green]")
                except Exception as e:
                    regen_spinner.__exit__(None, None, None)
                    console.print(f"[red]Failed to regenerate commit message: {e}[/red]")

        console.print(f"[blue]> Running: git commit -m \"{final_commit_message}\"[/blue]")
        subprocess.run(["git", "commit", "-m", final_commit_message], check=True)
        console.print("\n[green]Commit successful[/green]")

        if getattr(args, "push", False):
            console.print("[blue]> Running: git push[/blue]")
            subprocess.run(["git", "push"], check=True)
            console.print("[green]Push successful[/green]")

    except Exception as e:
        console.print(f"[red]Commit failed: {e}[/red]")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        prog="dokugen",
        description="Automatically generate high-quality README for your application",
    )
    parser.add_argument("--version", "-v", action="version", version="%(prog)s 14.0.0")

    subparsers = parser.add_subparsers(dest="command")

    gen_parser = subparsers.add_parser("generate", help="Scan project and generate README.md")
    gen_parser.add_argument(
        "--no-overwrite",
        dest="overwrite",
        action="store_false",
        default=True,
        help="Do not overwrite existing README.md, append new features instead",
    )
    gen_parser.add_argument(
        "--template",
        help="use a custom GitHub repo readme file as a template to generate a concise and strict readme for your project",
    )

    up_parser = subparsers.add_parser("update", help="Update auto-generated sections of README while preserving custom content")
    up_parser.add_argument(
        "--template",
        help="use a custom GitHub repo readme file as a template",
    )


    aic_parser = subparsers.add_parser("aic", aliases=["ai-commit"], help="AI-powered Git commit generator")
    aic_parser.add_argument(
        "--push", "-p",
        action="store_true",
        default=False,
        help="Push after committing"
    )

    subparsers.add_parser("revert", help="Revert README.md to the previous Dokugen-generated backup")

    if len(sys.argv) == 1:
        utils.check_and_update()
        console.print(DOKUGEN_BANNER, style="#000080")
        console.print("[blue]Welcome to Dokugen (v14.0.0) - Automatic README Generator\n[/blue]")

        action = questionary.select(
            "What would you like to do?",
            choices=[
                questionary.Choice("Generate README  - Scan project and create a new README.md", value="generate"),
                questionary.Choice("Update README    - Update an existing Dokugen-generated README", value="update"),
                questionary.Choice("Revert README    - Restore the previous Dokugen-generated README", value="revert"),
                questionary.Choice("AI Git Commit    - Generate commit message and commit staged changes", value="aic"),
                questionary.Choice("View Help        - Show all available commands and options", value="help"),
                questionary.Choice("Exit", value="exit"),
            ],
        ).ask()

        if action == "exit" or action is None:
            console.print("[yellow]Goodbye![/yellow]")
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
        elif args.command in ["aic", "ai-commit"]:
            cmd_aic(args)
        else:
            parser.print_help()


if __name__ == "__main__":
    main()
