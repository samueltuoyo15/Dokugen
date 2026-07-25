import os
import sys
import json
import base64
import requests
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


def register_og_parser(subparsers):
    parser = subparsers.add_parser(
        "og",
        help="Generate a beautiful 1200x630 OG social preview card for your project",
    )
    parser.add_argument(
        "--force-new",
        action="store_true",
        help="Force recreate the .dokugen/card.json configuration file using AI",
    )


def cmd_og(args):
    if not utils.is_git_repository():
        console.print("[red]No Git repository found. Please navigate to a project directory that has a Git repository.[/red]")
        sys.exit(1)

    utils.check_and_update()
    console.print(DOKUGEN_BANNER, style="#000080")

    project_dir = os.getcwd()
    project_name = os.path.basename(project_dir)
    dokugen_dir = os.path.join(project_dir, ".dokugen")
    os.makedirs(dokugen_dir, exist_ok=True)

    config_path = os.path.join(dokugen_dir, "card.json")
    png_path = os.path.join(dokugen_dir, "card.png")
    seo_path = os.path.join(dokugen_dir, "seo-instructions.txt")

    has_config = os.path.exists(config_path)
    force_new = getattr(args, "force_new", False)

    with utils.create_spinner("Checking internet..."):
        has_internet = utils.check_internet_connection()

    if not has_internet:
        console.print("[red]Please check your internet connection and try again.[/red]")
        return

    metadata = None

    if not has_config or force_new:
        with utils.create_ticking_spinner("Analyzing project to generate card profile..."):
            try:
                project_type = detect_project_type(project_dir)
                codebase_summary = f"Project Name: {project_name}\nDetected Tech Stack: {project_type}\n"

                readme_path = os.path.join(project_dir, "README.md")
                if os.path.exists(readme_path):
                    with open(readme_path, "r", encoding="utf-8", errors="ignore") as f:
                        readme_content = f.read()
                    codebase_summary += f"\nExisting README Summary:\n{readme_content[:3000]}"
                else:
                    try:
                        files = os.listdir(project_dir)
                        src_files = [f for f in files if f.endswith((".ts", ".js", ".py", ".go", ".rs", ".cpp", ".h", ".java"))]
                        if src_files:
                            codebase_summary += f"\nCore source files found: {', '.join(src_files)}"
                    except Exception:
                        pass

                css_candidates = [
                    "index.css", "globals.css", "src/index.css", "src/globals.css",
                    "app/globals.css", "tailwind.config.js", "tailwind.config.ts"
                ]
                for css_file in css_candidates:
                    full_css_path = os.path.join(project_dir, css_file)
                    if os.path.exists(full_css_path):
                        with open(full_css_path, "r", encoding="utf-8", errors="ignore") as cf:
                            css_content = cf.read()
                        codebase_summary += f"\nBrand CSS Styling ({css_file}):\n{css_content[:1500]}"
                        break

                backend_url = utils.get_backend_domain()
                res = requests.post(
                    f"{backend_url}/api/og-metadata",
                    json={"summary": codebase_summary},
                    timeout=30,
                )

                if res.status_code != 200:
                    console.print(f"[red]Failed to generate metadata profile via server: {res.text}[/red]")
                    return

                metadata = res.json()
                with open(config_path, "w", encoding="utf-8") as f:
                    json.dump(metadata, f, indent=2)

                console.print("[green]✔ Created configuration: .dokugen/card.json[/green]")

            except Exception as e:
                console.print(f"[red]Failed to generate card profile: {e}[/red]")
                return
    else:
        with open(config_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

    with utils.create_ticking_spinner("Rendering card PNG..."):
        try:
            logo_path = metadata.get("logo", "")
            if logo_path and not logo_path.startswith("http") and not logo_path.startswith("data:"):
                local_logo = os.path.abspath(os.path.join(project_dir, logo_path))
                if os.path.exists(local_logo):
                    with open(local_logo, "rb") as lf:
                        encoded = base64.b64encode(lf.read()).decode("utf-8")
                    mime = "image/svg+xml" if local_logo.endswith(".svg") else "image/png"
                    metadata["logo"] = f"data:{mime};base64,{encoded}"

            backend_url = utils.get_backend_domain()
            res = requests.post(
                f"{backend_url}/api/render-og",
                json=metadata,
                timeout=20,
            )

            if res.status_code != 200:
                console.print(f"[red]Failed to render card image: {res.text}[/red]")
                return

            png_bytes = res.content
            with open(png_path, "wb") as f:
                f.write(png_bytes)

            seo_text = f"""<!-- Open Graph Meta Tags (Copy & Paste into your HTML <head> or Next.js metadata) -->
<meta property="og:title" content="{metadata.get('title', '')}" />
{f'<meta property="og:description" content="{metadata.get("tagline", "")}" />' if metadata.get("tagline") else ''}
<meta property="og:image" content="https://yourdomain.com/.dokugen/card.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{metadata.get('title', '')}" />
{f'<meta name="twitter:description" content="{metadata.get("tagline", "")}" />' if metadata.get("tagline") else ''}
<meta name="twitter:image" content="https://yourdomain.com/.dokugen/card.png" />"""

            with open(seo_path, "w", encoding="utf-8") as sf:
                sf.write(seo_text)

        except Exception as e:
            console.print(f"[red]Failed to render social card PNG: {e}[/red]")
            return

    console.print("\n[green]✔ Created card image: ./.dokugen/card.png[/green]")
    console.print("[green]✔ Created SEO meta tags: ./.dokugen/seo-instructions.txt[/green]")
