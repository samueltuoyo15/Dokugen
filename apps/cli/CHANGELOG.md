# Changelog

All notable changes to this project will be documented in this file.

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