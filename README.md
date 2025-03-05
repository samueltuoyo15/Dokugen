# Dokugen: Effortless README Generation Tool 🚀

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)

Dokugen is an open-source command-line tool designed to simplify the process of creating high-quality README.md files for your projects. It automatically analyzes your project structure and code to generate a detailed and professional README, saving you time and ensuring consistency.

## ✨ Key Features

-   **Automated README Generation**: Quickly generate comprehensive README files with minimal effort.
-   **Project Analysis**: Intelligent analysis of your project structure to create relevant and informative documentation.
-   **Customizable Templates**: Use pre-built templates or create your own to match your project's style.
-   **Live Updates**: Watch your project for changes and automatically update the README.
-   **CLI Interface**: Easy-to-use command-line interface for seamless integration into your development workflow.
-   **Dashboard**: Interactive dashboard to track usage metrics and manage configurations.

## 📦 Installation

Get started with Dokugen in just a few simple steps:

1.  **Install Dokugen globally using npm:**

```bash
npm install -g dokugen
```

2.  **Verify the installation:**

```bash
dokugen --version
```

## 🔧 Usage

### Generating a README

To generate a README for your project, navigate to your project's root directory and run:

```bash
dokugen generate
```

This command analyzes your project and generates a `README.md` file with relevant information.

### Watching for Live Updates

To automatically update your README as you make changes to your project, use the `live` command:

```bash
dokugen live
```

This command watches your project files and updates the `README.md` whenever changes are detected.

#### Options for the `live` command:

-   `-p, --paths <paths>`: Comma-separated paths to watch (default: `.` ).
-   `-i, --ignore <patterns>`: Comma-separated patterns to ignore (default: `node_modules/**,.git/**,README.md`).
-   `-d, --debounce <ms>`: Debounce time in milliseconds (default: `2000`).
-   `-n, --notifications`: Show desktop notifications on updates (default: `true`).
-   `-g, --generate`: Generate documentation on start (default: `false`).

### Configuration

Dokugen can be configured using a `.dokugenrc.json` file in your project's root directory. Here's an example configuration:

```json
{
  "templates": ["default"],
  "watchPaths": ["."],
  "ignore": ["node_modules/**", ".git/**", "README.md"],
  "debounceTime": 2000,
  "autoCommit": true,
  "notification": true
}
```

## ⚙️ Technologies Used

-   **Node.js**: The runtime environment for the CLI tool.
-   **TypeScript**: Used for developing a scalable and maintainable codebase.
-   **Chokidar**: File system watcher for live updates.
-   **Commander.js**: Library for building command-line interfaces.
-   **Inquirer.js**: Library for interactive command-line prompts.
-   **Axios**: Promise based HTTP client for the browser and node.js
-   **React**: Used for building the dashboard interface.
-   **Next.js**: Used for building the dashboard interface.
-   **Supabase**: Used for user authentication and data storage.
-   **OpenAI**: Used for generating the README.md content.

## 📂 Project Structure

Here's a brief