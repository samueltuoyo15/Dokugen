# Dokugen

## Description
Dokugen is an open-source command-line tool designed to automatically generate high-quality README.md files for your projects. It analyzes your project structure and code to create a detailed and professional README, saving you time and ensuring clarity and consistency.

## Features
- **Automated README Generation**: Automatically creates a comprehensive README file by analyzing your project.
- **Customizable Templates**: Supports customizable templates to match your project's style.
- **Live Updates**: Watches for changes in your project and automatically updates the README.
- **Cross-Platform Compatibility**: Works seamlessly on various operating systems.
- **CLI Tool**: Easy-to-use command-line interface for generating and managing README files.
- **Dashboard**: A Next.js dashboard to visualize user metrics and manage the tool.

## Installation
To install Dokugen, make sure you have Node.js and npm installed. Then, run:

```bash
npm install -g dokugen
```

## Usage
To generate a README for your project, navigate to your project's root directory in the terminal and run:

```bash
dokugen generate
```

To enable live updates and automatically regenerate the README when changes are detected:

```bash
dokugen live
```

You can also customize the behavior of Dokugen by creating a `.dokugenrc.json` file in your project's root directory.

## Configuration
Here's an example of a `.dokugenrc.json` configuration file:

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

### Configuration Options
- `templates`: An array of template names to use for generating the README.
- `watchPaths`: An array of paths to watch for changes.
- `ignore`: An array of patterns to ignore when watching for changes.
- `debounceTime`: The debounce time in milliseconds for generating the README.
- `autoCommit`: Whether to automatically commit changes to the README to Git.
- `notification`: Whether to show desktop notifications on updates.

## Technologies Used

| Technology    | Description                                      |
| ------------- | ------------------------------------------------ |
| Node.js       | JavaScript runtime environment                   |
| TypeScript    | Typed superset of JavaScript                     |
| Commander.js  | Library for building command-line interfaces     |
| Chokidar      | Library for watching file system changes        |
| SimpleGit     | Lightweight interface for running git commands  |
| Inquirer.js   | Library for interactive command line prompts     |
| Next.js       | React framework for building web applications   |
| Tailwind CSS  | Utility-first CSS framework                      |
| OpenAI API    | For generating README content                   |
| Supabase      | Backend-as-a-Service for data storage           |

## Project Structure
- `package.json`: Contains project metadata and dependencies.
- `config/default-dokugenrc.json`: Default configuration file for Dokugen.
- `dashboard/`: Contains the source code for the Next.js dashboard.
    - `components.json`: Configuration file for UI components.
    - `eslint.config.mjs`: ESLint configuration file.
    - `next-sitemap.config.js`: Next.js sitemap configuration.
    - `next.config.ts`: Next.js configuration file.
    - `package.json`: Dashboard dependencies and scripts.
    - `postcss.config.mjs`: PostCSS configuration file.
    - `tailwind.config.ts`: Tailwind CSS configuration file.
    - `api/`: API routes for the dashboard.
        - `active-users.ts`: API to fetch active users.
        - `generate-readme.ts`: API to generate README content.
    - `app/`: Main application directory for Next.js.
        - `page.tsx`: Home page.
        - `layout.tsx`: Root layout for the application.
        - `Providers.tsx`: React Query provider.
    - `components/`: Reusable React components.
        - `metricsSection.tsx`: Component for displaying user metrics.
        - `ui/`: UI primitives.
            - `button.tsx`: Button component.
    - `utils/`: Utility functions.
        - `siteMetaData.ts`: Site metadata.
- `scripts/`: Scripts for automating tasks.
    - `postinstall.mjs`: Script to run after installing the package.
    - `postinstall.ts`: Script to set executable permissions.
- `src/`: Main source code for Dokugen.
    - `liveUpdater.ts`: Implementation for live documentation updates.

## Contributing
Contributions are welcome! Here’s how you can contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive commit messages.
4.  Submit a pull request.

### Development Setup
1.  Clone the repository:

    ```bash
    git clone https://github.com/samueltuoyo15/Dokugen.git
    ```
2.  Navigate to the project directory:

    ```bash
    cd Dokugen
    ```