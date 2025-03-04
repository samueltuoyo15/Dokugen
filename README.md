# Dokugen: Effortless README Generation 🚀

## Description

Dokugen is an open-source command-line tool designed to simplify the creation of high-quality README.md files for your projects. By intelligently analyzing your project structure and code, Dokugen generates detailed and professional documentation, saving you time and ensuring consistency.

## Features ✨

-   **Automated Analysis:** Dokugen analyzes your project files to understand its structure and purpose.
-   **Customizable Templates:** Choose from a variety of templates to match your project's style and requirements.
-   **Live Updates:** Automatically update your README when changes are detected in your project.
-   **CLI Tool:** Easy-to-use command-line interface for quick and efficient documentation generation.
-   **Dashboard:** A user-friendly dashboard to monitor active users and metrics.

## Installation 🔧

To install Dokugen, you need to have Node.js and npm installed on your system.

1.  **Install Dokugen globally:**

    ```bash
    npm install -g dokugen
    ```

2.  **Verify the installation:**

    ```bash
    dokugen --version
    ```

## Usage 📦

### Generating a README

1.  Navigate to your project directory:

    ```bash
    cd your-project
    ```

2.  Generate a README file:

    ```bash
    dokugen generate
    ```

### Live Documentation Updates

1.  Start live documentation updates:

    ```bash
    dokugen live
    ```

    This command watches your project for changes and automatically updates the README.md file.

### Configuration

You can configure Dokugen using the `.dokugenrc.json` file in your project directory. Here's an example configuration:

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

### CLI Options

| Option          | Description                                                                       | Default Value           |
| --------------- | --------------------------------------------------------------------------------- | ----------------------- |
| `-p, --paths`   | Comma-separated paths to watch                                                    | `.`                     |
| `-i, --ignore`  | Comma-separated patterns to ignore                                                | `node_modules/**,.git/**,README.md` |
| `-d, --debounce`| Debounce time in milliseconds                                                     | `2000`                  |
| `-n, --notifications` | Show desktop notifications on updates                                           | `true`                  |
| `-g, --generate`| Generate documentation on start                                                   | `false`                 |

## Technologies Used

| Technology     | Description                                              |
| -------------- | -------------------------------------------------------- |
| Node.js        | JavaScript runtime environment                           |
| TypeScript     | Typed superset of JavaScript                             |
| Commander.js   | Node.js command-line interface toolkit                  |
| Chokidar       | File system watcher                                      |
| Inquirer.js    | Interactive command-line user interface                 |
| Octokit        | GitHub API client                                        |
| Axios          | Promise based HTTP client                                |
| Chalk          | Terminal string styling                                 |
| Next.js        | React framework for building web applications           |
| Tailwind CSS   | Utility-first CSS framework                              |
| Supabase       | Open source Firebase alternative                         |
| OpenAI         | Artificial intelligence research and deployment company |

## Contributing 🤝

We welcome contributions to Dokugen! Here's how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.

### Development Setup

1.  Clone the repository:

    ```bash
    git clone https://github.com/samueltuoyo15/Dokugen.git
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Build the project:

    ```bash
    npm run build
    ```

## License 📜

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

[![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)