# Dokugen: Your README.md Generator 🦸
### current version 3.0.0 🤗

A CLI tool to automatically generate high-quality README files for your projects. Spend less time on documentation and more time building!

## Description

Dokugen scans your project, analyzes the file structure and codebase, and then generates a comprehensive README.md file based on your project type and key characteristics. It supports various languages and frameworks, including JavaScript/TypeScript, Python, Go, and more. It also asks you key questions like "Does your project use Docker?" to improve the output.

## Installation

To install Dokugen globally and make it accessible from any project directory, run:

```bash
npm install -g dokugen
```

## Verify the installation

```bash
dokugen --version
```

## Usage

Navigate to your project's root directory in the terminal and run the following command:

```bash
npx dokugen generate
```

The tool will guide you through a few questions to customize the README generation process.  If a README.md already exists, you will be prompted to overwrite it.

## Example

Here's an example of running Dokugen in a project directory:

```bash
cd my-awesome-project
npx dokugen generate
```

The tool will then generate a `README.md` file in your project's root.

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

## Contributing

Contributions are welcome! Feel free to submit pull requests with improvements, bug fixes, or new features.

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Submit a pull request.

## Acknowledgements

This project uses the following open-source libraries:

*   [commander](https://github.com/tj/commander.js)
*   [chalk](https://github.com/chalk/chalk)
*   [fs-extra](https://github.com/jprichardson/node-fs-extra)
*   [path](https://nodejs.org/api/path.html)
*   [inquirer](https://github.com/SBoudrias/Inquirer.js)
*   [axios](https://github.com/axios/axios)

## ⚙️ Technologies Used

-   **TypeScript**: Used for developing a scalable and maintainable codebase.
-   **Chokidar**: File system watcher for live updates.
-   **Commander.js**: Library for building command-line interfaces.
-   **Inquirer.js**: Library for interactive command-line prompts.
-   **Next.js**: Used for building SEO and the dashboard interface.
-   **Supabase Postgre Db**: Used for monitoring active users in real time.
-   **OpenAI**: Used for generating the README.md content.


## License

This project is open-source and available under the MIT License. See the `LICENSE` file for more information.
### Contributors: [OritseWeyinmi Samuel Tuoyo](https://github.com/samueltuoyo15), [CharmingDc Adebayo](https://github.com/Charmingdc), [Ogunwele](https://github.com/ogunlewe)
## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
