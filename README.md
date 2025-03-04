# Dokugen: Effortless README Generation for Your Projects 🚀

## Description

Dokugen is an open-source command-line tool designed to automatically generate high-quality, professional README.md files for your projects. It intelligently analyzes your project structure and code to create a detailed and engaging README, saving you time while ensuring clarity and consistency. Whether you're showcasing a personal project or contributing to open source, Dokugen makes documentation a breeze.

## Key Features 🌟

-   **Automated Analysis**: Analyzes your project's file structure and code to understand its purpose and functionality.
-   **Customizable Templates**: Offers a range of templates to suit different project types and styles.
-   **Live Updates**: Automatically detects changes in your project and updates the README accordingly.
-   **Easy Installation**: Get started quickly with a simple installation process.
-   **Cross-Platform Compatibility**: Works seamlessly on macOS, Windows, and Linux.
-   **Git Integration**: Offers to commit the updated README to version control.

## Installation 🔧

To install Dokugen, make sure you have Node.js and npm (Node Package Manager) installed on your system. Then, run the following command:

```bash
npm install -g dokugen
```

## Usage 📦

To generate a README for your project, navigate to your project's root directory in the terminal and run:

```bash
dokugen generate
```

To watch your project for changes and automatically update the README, use the `live` command:

```bash
dokugen live
```

You can also customize the behavior of the `live` command with the following options:

-   `-p, --paths <paths>`: Comma-separated paths to watch (default: `.`)
-   `-i, --ignore <patterns>`: Comma-separated patterns to ignore (default: `node_modules/**,.git/**,README.md`)
-   `-d, --debounce <ms>`: Debounce time in milliseconds (default: 2000)
-   `-n, --notifications`: Show desktop notifications on updates (default: false)
-   `-g, --generate`: Generate documentation on start (default: false)

For example:

```bash
dokugen live -p src,lib -i dist,docs -d 3000 -n
```

## Project Structure

The project includes the following key files and directories:

| File/Directory          | Description                                                              |
| :---------------------- | :----------------------------------------------------------------------- |
| `package.json`          | Contains metadata about the project and its dependencies.              |
| `dashboard/`            | Contains the Next.js dashboard code.                                   |
| `src/liveUpdater.ts`    | Implements the live documentation update functionality.                 |
| `scripts/postinstall.ts`| Sets executable permissions for the Dokugen CLI after installation.     |
| `api/active-users.ts`   | API endpoint to fetch active user metrics.                             |
| `api/generate-readme.ts`| API endpoint to generate the README content using OpenAI.              |
| `dashboard/app/`        | Contains the Next.js application components and layout.               |
| `dashboard/components/` | Contains React components used in the dashboard.                       |
| `dashboard/utils/`      | Utility functions and site metadata for the dashboard.                |

## Technologies Used

-   Node.js
-   TypeScript
-   Commander.js
-   Chokidar
-   Axios
-   Next.js
-   Tailwind CSS
-   OpenAI API
-   Supabase

## Contributing 🤝

Contributions are welcome! Here's how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Implement your changes.
4.  Submit a pull request with a clear description of your changes.

## License

This project is licensed under the [ISC License](LICENSE).

[![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
