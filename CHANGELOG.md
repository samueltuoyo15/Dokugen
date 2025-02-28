# Changelog

All notable changes to this project will be documented in this file.

## [2.9.9] - 2025-02-28
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