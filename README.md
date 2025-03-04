# Dokugen: Effortless README Generation Tool 🚀

## Description

Dokugen is an open-source command-line tool designed to streamline the creation of high-quality README.md files for your projects. By intelligently analyzing your project structure and code, Dokugen generates a comprehensive and professional README, saving you time and ensuring clarity and consistency. Whether you're working on a small personal project or a large enterprise application, Dokugen has you covered.

## Features

-   **Automated README Generation**: Automatically analyzes your project and generates a detailed README.md file.
-   **Customizable Templates**: Supports customizable templates to match your project's style and requirements.
-   **Live Updates**: Watches your project for changes and automatically updates the README.
-   **CLI Tool**: Easy-to-use command-line interface for generating and managing README files.
-   **Cross-Platform**: Works seamlessly on macOS, Windows, and Linux.
-   **Integration**: Integrates smoothly with Git for version control.
-   **Dashboard**: Provides a user-friendly dashboard to view active users and project metrics.

## Installation

To install Dokugen, you'll need Node.js and npm (Node Package Manager) installed on your system. Follow these steps:

1.  Install Dokugen globally using npm:

    ```bash
    npm install -g dokugen
    ```

2.  Verify the installation by checking the Dokugen version:

    ```bash
    dokugen --version
    ```

## Usage

### Generating a README

To generate a README for your project, navigate to your project's root directory in the command line and run:

```bash
dokugen generate
```

This command analyzes your project and generates a `README.md` file in the root directory.

### Watching for Changes

To automatically update the README when your project changes, use the `live` command:

```bash
dokugen live
```

This command watches your project files and updates the README whenever a change is detected.

#### Options for `live` command:

-   `-p, --paths <paths>`: Comma-separated paths to watch (default: `.` - current directory)
-   `-i, --ignore <patterns>`: Comma-separated patterns to ignore (default: `node_modules/**,.git/**,README.md`)
-   `-d, --debounce <ms>`: Debounce time in milliseconds (default: `2000`)
-   `-n, --notifications`: Show desktop notifications on updates (default: `true`)
-   `-g, --generate`: Generate documentation on start (default: `false`)

### Configuration

Dokugen can be configured using a `.dokugenrc.json` file in your project's root directory. Here’s an example configuration:

```json
{
  "templates": ["default"],
  "watchPaths": ["."],
  "ignore": ["node_modules/**", ".git/**", "README.md"],
  "debounceTime": 2000,
  "autoCommit": true,
  "notification": false
}
```

#### Configuration Options:

-   `templates`: Array of template names to use.
-   `watchPaths`: Array of paths to watch for changes.
-   `ignore`: Array of patterns to ignore.
-   `debounceTime`: Time in milliseconds to debounce updates.
-   `autoCommit`: Automatically commit changes to Git.
-   `notification`: Show desktop notifications.

## Technologies Used

-   Node.js
-   TypeScript
-   Chokidar
-   Commander.js
-   Inquirer.js
-   Axios
-   Octokit REST

## Contributing

Contributions are welcome! Here’s how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive commit messages.
4.  Push your changes to your fork.
5.  Submit a pull request to the main repository.

### Setting up the Development Environment

1.  Clone the repository:

    ```bash
    git clone https://github.com/samueltuoyo15/Dokugen.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd Dokugen
    ```

3.  Install the dependencies:

    ```bash
    npm install
    ```

4.  Build the project:

    ```bash
    npm run build
    ```

### Project Structure

The project includes the following files:

-   `package.json`: Project dependencies and scripts.
-   `config/default-dokugenrc.json`: Default configuration file.
-   `dashboard/`: Contains the Next.js dashboard application.
-   `scripts/`: Contains scripts for post-install tasks.
-   `src/liveUpdater.ts`: Manages live documentation updates.
-   `dashboard/api/`: API routes for the dashboard.
-   `dashboard/app/`: Next.js application components and pages.
-   `dashboard/components/`: React components for the dashboard.
-   `dashboard/utils/siteMetaData.ts`: Site metadata for the dashboard.

## Dashboard

The Dokugen dashboard provides a user-friendly interface to view active users and project metrics. The dashboard is built with Next.js and includes the following components:

-   `active-users.ts`: API route to fetch active users.
-   `generate-readme.ts`: API route to generate README files.
-   `MetricsSection.tsx`: React component to display user metrics.

To set up and run the dashboard:

1.  Navigate to the `dashboard` directory:

    ```bash
    cd dashboard
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:

    ```bash
    npm run dev
    ```

The dashboard will be