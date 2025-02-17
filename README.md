# Dokugen: Your Automated README Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/your-username/dokugen/graphs/commit-activity)

Dokugen is a command-line tool designed to automatically generate high-quality README files for your projects.  Spend less time writing documentation and more time building!

## Features

-   **Automatic Project Analysis:** Detects project type (JavaScript/TypeScript, Python, Golang, Rust, Java, Frontend React/Next/Vue) and identifies project files.
-   **Interactive Configuration:** Asks key questions about your project, such as whether it uses Docker, exposes an API, or utilizes a database.
-   **Comprehensive README Generation:** Creates a well-structured README.md file with installation steps, usage guide, Docker setup (if applicable), contribution guidelines, and license information.
-   **Overwrite Protection:**  Prompts before overwriting existing README files.
-   **Code Snippet Inclusion:** Extracts relevant code snippets from your project files to provide practical examples in the README.

## Installation

To install Dokugen, you'll need Node.js and npm (Node Package Manager) installed on your system.

```bash
npm install -g dokugen
```

## Usage

Navigate to your project directory in the terminal.

```bash
cd your-project
```

Run the `dokugen generate` command to start the README generation process.

```bash
dokugen generate
```

The tool will guide you through a series of questions about your project.  Answer them to customize your README.

## Docker Setup

If you chose to include Docker setup during the generation process, your README will contain instructions similar to these:

1.  **Build the Docker image:**

    ```bash
    docker build -t your-project-name .
    ```

2.  **Run the Docker container:**

    ```bash
    docker run -p 3000:3000 your-project-name
    ```

    (Adjust port numbers as necessary.)

## Contribution Guidelines

We welcome contributions to Dokugen! To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive messages.
4.  Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
