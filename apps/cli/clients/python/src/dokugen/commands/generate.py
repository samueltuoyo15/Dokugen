import os
import sys
import json
import requests
import questionary
import webbrowser
import subprocess
from rich.console import Console
from dokugen import utils
from dokugen.project_detect import detect_project_type

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


def open_browser(url):
    if os.environ.get("TERMUX_VERSION"):
        try:
            subprocess.run(["termux-open-url", url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return
        except Exception:
            pass
    try:
        webbrowser.open(url)
    except Exception:
        pass


def ask_handle(field_name, saved_value):
    choices = []
    if saved_value:
        choices.append(questionary.Choice(f"Use saved details (@{saved_value})", value="__saved__"))
    choices.append(questionary.Choice(f"Enter new {field_name} username", value="__enter__"))
    choices.append(questionary.Choice("Skip", value="__skip__"))

    choice = questionary.select(
        f"{field_name} username:",
        choices=choices
    ).ask()

    if choice is None or choice == "__skip__":
        return None
    if choice == "__saved__":
        return saved_value

    entered = questionary.text(
        f"Enter your {field_name} username (without @):",
        placeholder="e.g. samueltuoyo" if field_name == "LinkedIn" else "e.g. samueltuoyo15"
    ).ask()

    if entered is None:
        return None
    entered_strip = entered.strip()
    return entered_strip if entered_strip else None


def ask_social_handles():
    try:
        profile = utils.load_profile()
        linkedin_username = ask_handle("LinkedIn", profile.get("linkedinUsername"))
        twitter_username = ask_handle("X (Twitter)", profile.get("twitterUsername"))

        updated = {
            "linkedinUsername": linkedin_username or profile.get("linkedinUsername"),
            "twitterUsername": twitter_username or profile.get("twitterUsername"),
        }

        if updated["linkedinUsername"] or updated["twitterUsername"]:
            utils.save_profile(updated)
            profile_path = os.path.join(utils.DOKUGEN_HOME, "config.json")
            console.print(f"[dim]Socials saved to {profile_path}[/dim]")

        return {
            "linkedinUsername": linkedin_username,
            "twitterUsername": twitter_username,
        }
    except Exception:
        return {}


def prompt_myhappr():
    try:
        console.print("")
        project_name = os.path.basename(os.getcwd())
        raw_username = utils.get_user_info().get("username", "developer")
        import re
        username = re.sub(r'\d+', '', raw_username)

        answer = questionary.select(
            f"Want to monetize {project_name}? like receive donations... right? {username}",
            choices=[
                questionary.Choice("Set up a funding page on myhappr (opens browser)", value="yes"),
                questionary.Choice("Maybe later", value="no")
            ]
        ).ask()

        if answer is None or answer == "no":
            return

        spinner = utils.create_ticking_spinner("Opening myhappr...")
        spinner.__enter__()

        uri = None
        max_retries = 3
        for attempt in range(1, max_retries + 1):
            try:
                res = requests.get("https://api.myhappr.com/api/v1/auth/google-auth", timeout=5)
                if res.status_code == 200:
                    data = res.json()
                    uri = data.get("data", {}).get("uri")
                    if uri:
                        break
            except Exception:
                if attempt == max_retries:
                    break

        if uri:
            spinner.__exit__(None, None, None)
            console.print("[green]Browser opened. Make sure to complete account setup on myhappr.[/green]")
            open_browser(uri)
        else:
            spinner.__exit__(None, None, None)
            console.print("[yellow]Something went wrong connecting to myhappr. Please try again later.[/yellow]")
    except Exception:
        pass


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

            socials = ask_social_handles()
            linkedin_username = socials.get("linkedinUsername")
            twitter_username = socials.get("twitterUsername")

            if linkedin_username:
                linkedin_url = f"https://linkedin.com/in/{linkedin_username}"
            if twitter_username:
                twitter_url = f"https://x.com/{twitter_username}"

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
        console.print("[cyan]\nYou like what you see? Support Dokugen financially: [/cyan]"
                      "[blue underline][link=https://myhappr.com/samueltuoyo]https://myhappr.com/samueltuoyo[/link][/blue underline]"
                      "[dim] (Ctrl+Click or Cmd+Click to follow link)[/dim]")
        utils.readme_backup = None

        # Save cache
        new_cache_files = {}
        for f in project_files:
            file_path = os.path.join(project_dir, f)
            new_cache_files[f] = utils.get_file_hash(file_path)
        utils.save_cache(project_dir, {"version": "1.0", "files": new_cache_files})

        prompt_myhappr()

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
        raw_username = utils.get_user_info().get("username", "Unknown")
        import re
        username = re.sub(r'\d+', '', raw_username)
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
                project_name = os.path.basename(project_dir)
                ans = ask_yes_no(f"README.md exists for {project_name}. Overwrite?")
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


def register_generate_parser(subparsers):
    project_name = os.path.basename(os.getcwd())
    gen_parser = subparsers.add_parser("generate", help=f"Scan {project_name} and generate README.md")
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
