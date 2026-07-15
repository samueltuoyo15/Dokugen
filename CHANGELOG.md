# Changelog

All notable changes to this project will be documented in this file.

### [14.0.3] - 2026-07-15
### Patches
- **Interactive Leaderboard Sorting**: Implemented server-side and client-side sorting/ranking by Total, READMEs, Commits, Licenses, and Reverts on the Project Analytics dashboard.
- **Activity Trends Visualization**: Resolved coordinates overlapping issues by migrating the Line Chart to an interactive Composed Chart featuring stacked bars for categories and a line for Total Usage.
- **CLI License Generation Wording**: Updated the default license hint in both TypeScript and Python CLIs to accurately warn users that projects without a LICENSE file are copyright-protected by default and legally restricted from copy, use, or distribution.

### [14.0.2] - 2026-07-15
### Patches
- **Leaderboard Tracking**: Added usage tracking pings to local `license`, `revert`, and `aic` commands across both TS and Python CLIs for accurate leaderboard stats.
- **Server Hardening**: Enforced strict global request limits and payload size validation during decompression to prevent resource exhaustion.
- **Rate-Limiter Security**: Hardened rate-limiting checks on sensitive routes.
- **API Key Security**: Migrated backend AI request keys from URL parameters to secure headers to prevent proxy log exposure.
- **Internal Diagnostics**: Removed sensitive internal process memory details from the public health endpoint.
- **Resource Management**: Fixed socket leaks in the server keep-alive cron job.
- **Cache Hardening**: Updated prompt caches to store SHA256 hashes of API keys instead of plaintext credentials.
- **Logging Privacy**: Masked user metadata in database tracking logs and sanitized raw API responses from error logs.
- **TS CLI Command Execution**: Switched local CLI commands from string shell execution to parameter arrays to eliminate shell injection vectors.
- **Privacy Fallbacks**: Switched fallback parameters in Git configuration checks to use blank fallbacks instead of leaking environment details.
- **Python CLI Resource Leaks**: Restructured spinner management to use context managers, preventing daemon threads from leaking on errors.
- **Python Network Improvements**: Fixed double update checks on interactive menus and ensured all response connections are cleanly closed.
- **Python CLI Maintenance**: Dynamic package version resolution using metadata.

### [14.0.1] - 2026-07-13
### Added
- **Premium Colored Diagrams**: System Design Diagrams(Flowcharts) now look gorgeous on GitHub with theme-matched colors (instead of boring black-and-white). It auto-colors your tech stack—so Redis is red, Postgres is blue, MongoDB is green, and so on!
- **Mixed Layout Directions**: Diagrams aren't locked to left-to-right (`LR`) anymore. The AI will switch it up (like top-down `TD` or bottom-up `BT`) depending on what fits the diagram best.
- **Dynamic Project Menu & App Info**: The interactive command menu and CLI descriptions now show the actual name of your project folder instead of generic filler text.
- **Clear terminal on Exit/Ctrl+C**: When you quit or hit `Ctrl+C`, it clears the screen completely and displays a clean, bold `Dokugen: Goodbye!` sign-off.
- **Robust Screen Clearing**: Replaced old clear code with robust ANSI escapes so it resets the terminal cleanly on PowerShell, Linux, macOS, and Android/Termux without issues.
- **Remember Social Details**: Added a local config profile (`~/.dokugen/config.json`) to save and reuse your LinkedIn/X handles, so you don't have to retype them every single run.
- **Standalone `license` Command**: Added a brand new subcommand `dokugen license` to generate LICENSE files locally with auto Git author/year detection and simple English overviews.
- **myhappr page promotion**: Shows a quick prompt at the end of generations to set up a developer monetization page if you are in Africa, on myhappr with silent retries.

### Patches
- **Runaway Diagrams & Clutter**: Fixed the issue where flowcharts became too large and messy by attempting to render all client interactions and architectural details in a single giant diagram. The generator now splits actor tables and system summaries out of the flowchart flow, keeping the diagram legible and professional.
- **Redirection of Badge URLs**: Pointed badge URL to `https://dokugen-readme.vercel.app` so they redirect to the website directly instead of the npm package, becuase we dont only support Typescript/Javascript projects.
- **Runaway Spinner & 503 Lockup**: Fixed the annoying bug where the CLI spinner would spin forever if the backend timed out or threw a 503 error.
- **Strict Omit Rules for Social Handles**: Fixed the AI occasionally generating placeholder links if you left your LinkedIn/X handles blank. It now deletes them entirely so your Author section stays clean.
- **Markdown 4-Space Paragraph Indentation Ban**: Blocked the AI from indenting standard paragraphs with 4 spaces, which previously broke hyperlink rendering by triggering preformatted code-block mode.
- **No More Duplicate Description Text**: Fixed a bug where updating a README caused the AI to double up on the description text when merging update blocks.
- **Full Codebase Context on Updates**: Stopped cutting off the codebase context to 1000 characters during updates, so the AI can resolve real endpoints/routes (like `/h/:id` instead of `/webhook/:id`) accurately.
- **Python CLI Modularity Clean-up**: Broke down the massive 900+ lines `cli.py` in the Python client into neat command modules (`dokugen/commands/`) to match the TypeScript client structure.
- **Termux open browser fix**: Fixed browser redirects failing on Android/Termux by checking environment variables and falling back to `termux-open-url`.
- **Groq Integration**: Discontinued Groq Integration.

## [14.0.0] - 2026-06-17
### Added
- **Global Version Alignment**: Promoted all package and CLI versions to 14.0.0 to prepare for public release.

### Fixed
- **Zero-Latency Backend Connection**: Skipped localhost probe unless `DOKUGEN_LOCAL=1` is set, eliminating connection-refused latency for published users.

## [3.13.0] - 2026-06-16
### Added
- **AI-Powered Commit Subcommand (`aic`)**: Added `aic` (alias `ai-commit`) command to TS and Python CLIs that stages files, requests Conventional Commit message generation from the backend server (using Gemini model), commits, and optionally pushes.
- **Incremental Scanning**: Implemented cache checks using `.dokugen-cache.json` to upload and scan *only* the modified files for faster readme updates.
- **Groq Integration**: Migrated the README generation backend from Google Gemini to the Groq LPU engine running `llama-3.3-70b-versatile` to address rate limit issues.
- **Improved Size Capacity**: Increased CLI scan file cap to 150KB.
- **Rate Limit Bypass**: Automatically bypasses server rate limiting if a user provides their own `geminiApiKey` or `groqApiKey`.
- **Command Injection Prevention**: Secured Git execution inside TS CLI by using `spawnSync` instead of shell interpolation.
- **Donation link**: Prints developer support link `https://myhappr.com/samueltuoyo` after README generations.
- **Enhanced Interactive Menu**: Typing just `dokugen` now starts a full interactive prompt displaying all options (Generate README, Update README, AI Git Commit, and View Help) alongside the current version banner, making the tool self-documenting and easy to navigate.
- **Zero-Config Experience**: Removed all API key prompting logic from both TS and Python CLIs. The CLI no longer asks the user for a Groq or Google Gemini API Key and communicates with the backend transparently using the server's shared API keys.


## [3.11.0] - 2026-02-11
### Added
- **Standalone Binaries**: Introduced support for compiling Dokugen into standalone executables using Bun, allowing users to run the tool without installing Node.js.

### Fixed
- **Auto-Update Reliability**: Added `--ignore-scripts` to the auto-update command to prevent permission issues and script failures during updates.

## [3.10.0] - 2026-02-10
### Added
- **Auto-Update System**: Dokugen now automatically checks for updates and installs the latest version when you run any command.
- **Smart README Update Command**: New `dokugen update` command that intelligently updates only auto-generated sections while preserving your custom content.
- **Compression for Scalability**: Implemented gzip compression for large codebases, reducing payload sizes by 70-90% for faster uploads.
- **Real-Time File Streaming**: README files now update in real-time as content is generated, so you can watch the magic happen.

### Changed
- Removed all unnecessary comments and emojis from codebase for cleaner production code.
- Improved backend to handle compressed payloads for better performance.

### Fixed
- File streaming now properly flushes to disk for real-time visibility.

## [3.9.0] - 2025-12-24
### Added
- **Updated Contribution Guidelines**: Explicitly defined contribution areas and workflows for CLI, Server, Docs, and VSCode Extension.
- **Server Documentation**: Added detailed environment variable configuration for the server.

### Changed
- **Documentation**: Refined README installation instructions for clarity.

## [3.8.0] - 2025-07-03
### Fixed
- Feature to generate docker compose coming soon!!!
- migrated from full server to serverless platform
- ui updates and more

## [3.7.0] - 2025-05-13
### Fixed
- Forgot to run build

## [3.6.0] - 2025-05-13
### Fixed
- Readme Docs

## [3.5.0] - 2025-05-13
### Fixed
- Unnecessary Process Cancellation which prevents generating the readme or even viewing the interactive question section
- added more irrelevant files extension to exclude 
- improved detect project logic

## [3.4.0] - 2025-05-04
### Added
- added docs to README.md file

## [3.3.0] - 2025-04-18
### Added
- migrated from serveless function to native server and increase request payload limit 
- Improved the model 100000x faster aand smarter
- Fixed Questions Section to ask isers what they want to include without crashing 
- fix ui to replicate vite cli interface and also cleaned up some mistakes 
- added internet connection detection 
- added flag to generate readme using templates
- option to backup existing readme on user exit
## [3.1.0] - 2025-03-24
### Added
- **--no-overwrite flag**: appdded a flag to the cli tool that updates your readme instead of generating new/different readme.
- auto fetch git repo url from current project
- added feature to fetch osInfo
- Improved the model 100000x faster aand smarter

### Changed
- **Refactored Codebase**: Improved code structure for better readability and maintainability.

### Fixed
- **Renaming All Js files to mjs in the dist folder**: Fixed bugs related to to converting .js files to .mjs.
- **options to include contribution guidelines**
## [3.0.0] - 2025-02-29
### Added
- **Streaming Support**: Integrated real-time streaming for README generation using OpenAI's API.
- **Active User Tracking**: Added functionality to track active users and their usage count via Supabase.
- **Improved Error Handling**: Enhanced error handling for API requests and file operations.
- **Dynamic README Generation**: Added support for generating READMEs based on project type, files, and user preferences.
- **Modern vs. Professional READMEs**: Added logic to generate READMEs with different tones (modern or professional) based on project type.

### Changed
- **Refactored Codebase**: Improved code structure for better readability and maintainability.
- **Optimized File Scanning**: Enhanced file scanning logic to ignore unnecessary files and directories.
- **Updated CLI Logging**: Improved CLI visuals and logging with Chalk for better user experience.

### Fixed
- **Streaming Issues**: Fixed bugs related to incomplete or malformed SSE (Server-Sent Events) data.
- **Supabase Integration**: Resolved issues with Supabase user tracking and usage count updates.
- **Cross-Platform Compatibility**: Fixed path handling issues on Windows and macOS.

## [2.5.0] - 2025-02-22
### Added
- Finally launched a stable version of Dokugen.

## [2.2.0] - 2025-02-19
### Added
- Fixed server downtime issues.

## [2.1.0] - 2025-02-19
### Added
- Support for Windows OS.
- Fixed Windows permissions issues.

## [1.9.0] - 2025-02-19
### Currently working on
- Support for Windows and macOS.

## [1.8.0] - 2025-02-18
### Added
- Implemented CLI command `dokugen generate`.
- Added support for detecting project types (Go, Python, JS, Rust, etc.).
- Integrated prompts to ask users about project features (API, Docker, Database).
- Enabled automatic scanning of project files.
- Improved logging with Chalk for better CLI visuals.

### Changed
- Optimized file scanning to ignore unnecessary files.
- Improved README generation with better code snippets extraction.

### Fixed
- Handled errors when scanning large projects.
- Fixed issues with file path handling on Windows.

## [1.7.0] - 2025-02-10
### Added
- Initial implementation of the Dokugen CLI.
- Basic README generation with file scanning.
