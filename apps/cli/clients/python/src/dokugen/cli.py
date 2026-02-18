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


def ask_for_gemini_key():
    has_key = questionary.select(
        "Do you have a Google Gemini API Key?",
        choices=[
            questionary.Choice("Yes", value="yes"),
            questionary.Choice("No (Use Dokugen's shared key)", value="no"),
        ]
    ).ask()

    if has_key is None:
        console.print("[yellow]Operation cancelled[/yellow]")
        sys.exit(0)

    if has_key == "yes":
        key = questionary.text("Enter your Google Gemini API Key:").ask()
        if key is None:
            console.print("[yellow]Operation cancelled[/yellow]")
            sys.exit(0)
        return key
    return None


def generate_readme_remote(project_type, project_files, project_dir, existing_readme=None, template_url=None, gemini_api_key=None):
    try:
        console.print("[blue]Analyzing project files...[/blue]")
        readme_path = os.path.join(project_dir, "README.md")

        include_setup = False
        include_contrib = False

        if not template_url:
            ans_setup = ask_yes_no("Do you want to include setup instructions in the README?")
            if ans_setup == "cancel":
                return None
            include_setup = (ans_setup == "yes")

            ans_contrib = ask_yes_no("Include contribution guidelines in README?")
            if ans_contrib == "cancel":
                return None
            include_contrib = (ans_contrib == "yes")

        full_code = utils.extract_full_code(project_files, project_dir)
        user_info = utils.get_user_info()
        repo_url = utils.get_git_repo_url()

        try:
            r = requests.get("https://dokugen-readme.vercel.app/api/get-server-url", timeout=10)
            backend_domain = r.json().get("domain")
        except Exception:
            backend_domain = "https://dokugen-readme.vercel.app"

        compressed_full_code = utils.compress_data(full_code)
        compressed_existing_readme = utils.compress_data(existing_readme) if existing_readme else None

        payload = {
            "projectType": project_type,
            "projectFiles": project_files,
            "fullCode": compressed_full_code,
            "userInfo": user_info,
            "options": {"includeSetup": include_setup, "includeContributionGuideLine": include_contrib},
            "existingReadme": compressed_existing_readme,
            "repoUrl": repo_url,
            "templateUrl": template_url,
            "compressed": True,
            "geminiApiKey": gemini_api_key
        }

        console.print("[blue]Generating README (this may take a while)...[/blue]")

        with utils.create_spinner("Connecting to Dokugen servers..."):
            response = requests.post(f"{backend_domain}/api/generate-readme", json=payload, stream=True, timeout=API_TIMEOUT)

        if response.status_code != 200:
            console.print(f"[red]Error {response.status_code}: {response.text}[/red]")
            return None

        with open(readme_path, 'w', encoding='utf-8') as f:
            for line in response.iter_lines():
                if line:
                    decoded = line.decode('utf-8')
                    if decoded.startswith("data:"):
                        json_str = decoded.replace("data: ", "").strip()
                        try:
                            data = json.loads(json_str)
                            if "response" in data and isinstance(data["response"], str):
                                chunk = data["response"]
                                f.write(chunk)
                                f.flush()
                        except Exception:
                            pass

        console.print("\n[green]README.md created successfully![/green]")
        return readme_path

    except Exception as e:
        console.print(f"[red]Error Generating Readme: {e}[/red]")
        utils.restore_readme()
        return None


def cmd_generate(args):
    utils.check_and_update()
    console.print(DOKUGEN_BANNER, style="#000080")

    project_dir = os.getcwd()
    readme_path = os.path.join(project_dir, "README.md")
    readme_exists = os.path.exists(readme_path)

    with utils.create_spinner("Checking internet..."):
        if not utils.check_internet_connection():
            username = utils.get_user_info().get("username", "Unknown")
            console.print(f"[red]Opps... {username} kindly check your device or pc internet connection and try again.[/red]")
            return

    if readme_exists:
        utils.backup_readme(readme_path)

    try:
        template_url = args.template
        if template_url and "github.com" not in template_url:
            console.print("[red]Invalid GitHub URL. Use format: https://github.com/user/repo/blob/main/README.md[/red]")
            sys.exit(1)

        project_type = detect_project_type(project_dir)
        with utils.create_spinner("Scanning project files..."):
            project_files = utils.scan_files(project_dir)
        console.print(f"[yellow]Found: {len(project_files)} files in the project[/yellow]")
        console.print(f"[blue]Detected project type: {project_type}[/blue]")

        gemini_key = ask_for_gemini_key()

        if template_url:
            existing_content = None
            if readme_exists and not args.overwrite:
                with open(readme_path, 'r', encoding='utf-8') as f:
                    existing_content = f.read()

            generate_readme_remote(project_type, project_files, project_dir, existing_content, template_url, gemini_key)
            console.print("[green]README.md generated from template![/green]")
            return

        if readme_exists:
            if not args.overwrite:
                with open(readme_path, 'r', encoding='utf-8') as f:
                    existing_content = f.read()
                generate_readme_remote(project_type, project_files, project_dir, existing_content, None, gemini_key)
            else:
                ans = ask_yes_no("README.md exists. Overwrite?")
                if ans == "yes":
                    generate_readme_remote(project_type, project_files, project_dir, None, None, gemini_key)
                elif ans == "no":
                    console.print("[yellow]README update skipped[/yellow]")
                else:
                    console.print("[yellow]Cancelled[/yellow]")
                    utils.restore_readme()
        else:
            generate_readme_remote(project_type, project_files, project_dir, None, None, gemini_key)

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        utils.restore_readme()
        sys.exit(1)


def cmd_update(args):
    utils.check_and_update()
    console.print(DOKUGEN_BANNER, style="#000080")

    project_dir = os.getcwd()
    readme_path = os.path.join(project_dir, "README.md")
    if not os.path.exists(readme_path):
        console.print("[red]No README.md found. Use 'dokugen generate' to create one first.[/red]")
        sys.exit(1)

    if not utils.check_internet_connection():
        console.print("[red]No internet connection[/red]")
        return

    try:
        utils.backup_readme(readme_path)
        gemini_key = ask_for_gemini_key()

        template_url = getattr(args, 'template', None)

        if template_url and "github.com" not in template_url:
            console.print("[red]Invalid GitHub URL. Use format: https://github.com/user/repo/blob/main/README.md[/red]")
            sys.exit(1)

        with open(readme_path, 'r', encoding='utf-8') as f:
            existing_content = f.read()

        has_markers = "<!-- DOKUGEN:" in existing_content or "[![Readme was generated by Dokugen]" in existing_content

        if not has_markers:
            console.print("[yellow]This README doesn't appear to be generated by Dokugen.[/yellow]")
            ans = ask_yes_no("Do you want to regenerate the entire README?")
            if ans == "yes":
                project_type = detect_project_type(project_dir)
                with utils.create_spinner("Scanning project files..."):
                    project_files = utils.scan_files(project_dir)
                console.print(f"[yellow]Found: {len(project_files)} files[/yellow]")

                generate_readme_remote(project_type, project_files, project_dir, None, template_url, gemini_key)
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

        console.print(f"[yellow]Found: {len(project_files)} files[/yellow]")
        console.print(f"[blue]Detected project type: {project_type}[/blue]")
        console.print("[blue]Updating auto-generated sections...[/blue]")

        generate_readme_remote(project_type, project_files, project_dir, existing_content, template_url, gemini_key)
        console.print("[green]README.md updated successfully! Custom sections preserved.[/green]")

    except Exception as e:
        console.print(f"[red]Error updating: {e}[/red]")
        utils.restore_readme()
        sys.exit(1)


def cmd_compose_docker(args):
    console.print("testing coming soon.....")


def main():
    parser = argparse.ArgumentParser(
        prog="dokugen",
        description="Automatically generate high-quality README for your application"
    )
    parser.add_argument("--version", "-v", action="version", version="%(prog)s 3.11.0")

    subparsers = parser.add_subparsers(dest="command")

    gen_parser = subparsers.add_parser("generate", help="Scan project and generate README.md")
    gen_parser.add_argument("--no-overwrite", dest='overwrite', action='store_false', default=True, help="Do not overwrite existing README")
    gen_parser.add_argument("--template", help="Use a custom GitHub repo readme template")

    up_parser = subparsers.add_parser("update", help="Update auto-generated sections of README while preserving custom content")
    up_parser.add_argument("--template", help="Use a custom GitHub repo readme template")

    subparsers.add_parser("compose-docker", help="Generate dockerfiles or docker compose for multiple services")

    if len(sys.argv) == 1:
        console.print(DOKUGEN_BANNER, style="#000080")
        console.print("[blue]Welcome to Dokugen - Automatic README Generator\n[/blue]")

        action = questionary.select(
            "What would you like to do?",
            choices=[
                questionary.Choice("Generate README  - Scan project and create a new README.md", value="generate"),
                questionary.Choice("Update README    - Update an existing Dokugen-generated README", value="update"),
                questionary.Choice("Exit", value="exit")
            ]
        ).ask()

        if action == "exit" or action is None:
            console.print("[yellow]Goodbye![/yellow]")
            return

        class Args:
            template = None
            overwrite = True

        if action == "generate":
            cmd_generate(Args())
        elif action == "update":
            cmd_update(Args())

    else:
        args = parser.parse_args()
        if args.command == "generate":
            cmd_generate(args)
        elif args.command == "update":
            cmd_update(args)
        elif args.command == "compose-docker":
            cmd_compose_docker(args)


if __name__ == "__main__":
    main()
