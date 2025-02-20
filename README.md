# Dokugen: Your README Automation Superhero 🦸

## Project Description

Dokugen is a CLI tool designed to automatically generate high-quality README files for your projects, saving you valuable time and effort. It intelligently analyzes your project structure and code to create comprehensive and professional documentation, allowing you to focus on building awesome software.

## Features

*   **Automated README Generation:** Dokugen analyzes your project files and generates a well-structured README.md file.
*   **Project Type Detection:**  It automatically detects the project type (e.g., JavaScript/TypeScript, Python, Go) based on the presence of specific files (e.g., `package.json`, `go.mod`).
*   **Code Snippet Extraction:**  Extracts relevant code snippets from your project files to include in the README.
*   **Interactive Configuration:** Asks key questions about your project (e.g., API usage, database integration, Docker setup) to tailor the README content.
*   **Customizable Output:** Allows you to specify whether to include sections on API endpoints, database setup, and Docker integration.
*   **Overwrite Protection:**  Prompts before overwriting an existing `README.md` file.
*   **Error Handling:** Provides informative error messages and gracefully handles interruptions.

## Installation

To install Dokugen globally, run the following command:

```bash
npm install -g dokugen
```

## Usage

1.  Navigate to the root directory of your project in the terminal.
2.  Run the following command:

    ```bash
    dokugen generate
    ```

3.  Answer the prompts about your project's features (API, database, Docker).
4.  Dokugen will then generate (or overwrite) the `README.md` file in your project directory.

## Contribution Guide

We welcome contributions to Dokugen! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, descriptive messages.
4.  Submit a pull request.

## License

This project is open source, feel free to use and distribute it as needed.

## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![made-with-javascript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com)

