# Dokugen: Effortlessly Generate Professional READMEs 🚀

Tired of writing READMEs? Let Dokugen handle it for you! This open-source CLI tool analyzes your project and generates a high-quality, modern README.md file in seconds. ✨

## Project Overview

This project consists of a Node.js CLI tool and a Next.js dashboard for generating and managing README files. Here's a breakdown of the key files:

- `package.json`: Defines the project dependencies, scripts, and metadata for the CLI tool.
- `dashboard/`: Contains the source code for the Next.js dashboard.
  - `components.json`: Configuration file for Shadcn UI components.
  - `eslint.config.mjs`: ESLint configuration for the dashboard.
  - `next-env.d.ts`: TypeScript declaration file for Next.js environment variables.
  - `next-sitemap.config.js`: Configuration file for generating the sitemap.
  - `next.config.ts`: Next.js configuration file.
  - `package.json`: Defines the project dependencies and scripts for the dashboard.
  - `postcss.config.mjs`: PostCSS configuration file for Tailwind CSS.
  - `tailwind.config.ts`: Tailwind CSS configuration file.
  - `api/`: API routes for the dashboard.
    - `active-users.ts`: API route to fetch active users data from Supabase.
    - `generate-readme.ts`: API route to generate README content using OpenAI.
  - `app/`: Contains the core components and pages of the Next.js application.
    - `Providers.tsx`: React Query provider for managing data fetching and caching.
    - `favicon.ico`: Favicon for the dashboard.
    - `globals.css`: Global CSS styles for the dashboard.
    - `layout.tsx`: Root layout component for the Next.js application.
    - `page.tsx`: Home page component for the dashboard.
  - `components/`: Reusable React components.
    - `metricsSection.tsx`: Component to display user metrics.
    - `ui/`: UI components built with Shadcn UI.
      - `button.tsx`: Button component.
  - `utils/`: Utility functions and data.
    - `siteMetaData.ts`: Contains metadata for the website.
- `scripts/postinstall.ts`: Script to set executable permissions for the CLI tool after installation.

## Full Code Context

```json
{
  "name": "dokugen",
  "version": "3.1.0",
  "private": false,
  "main": "dist/bin/dokugen.mjs",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "postbuild": "node --no-warnings lib/rename.ts"
  },
  "bin": {
    "dokugen": "dist/bin/dokugen.mjs"
  },
  "keywords": [
    "open source",
    "readme generator",
    "cli tool",
    "OritseWeyinmi samuel Tuoyo"
  ],
  "author": "OritseWeyinmi Samuel Tuoyo",
  "license": "ISC",
  "description": "Open source readme generator command line tool.",
  "repository": {
    "type": "git",
    "url": "https://github.com/samueltuoyo15/Dokugen.git"
  },
  "bugs": {
    "url": "https://github.com/samueltuoyo15/Dokugen/issues"
  },
  "dependencies": {
    "axios": "^1.8.1",
    "chalk": "^5.4.1",
    "commander": "^13.1.0",
    "esbuild": "^0.25.1",
    "fs": "^0.0.1-security",
    "fs-extra": "^11.3.0",
    "inquirer": "^12.4.2"
  },
  "devDependencies": {
    "@types/axios": "^0.9.36",
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^22.13.4",
    "ts-node": "^10.9.2",
    "typescript": "^5.7.3"
  }
}
```

## Installation

Get started with Dokugen in just a few simple steps:

- **Clone the Repository**:
  ```bash
  git clone https://github.com/samueltuoyo15/Dokugen
  ```
- **Navigate to the Project Directory**:
  ```bash
  cd Dokugen
  ```
- **Install Dependencies**:
  ```bash
  npm install
  ```
- **Build the Project**:
  ```bash
  npm run build
  ```
- **Link the CLI Globally**:
  ```bash
  npm link
  ```

## Usage

Run Dokugen in your project directory to generate a README:

```bash
dokugen
```

Follow the prompts to customize your README with project details, features, and more!

## Features

- 🚀 **Automated README Generation:** Generate professional READMEs in seconds.
- 🎨 **Customizable Templates:** Tailor your README to match your project's style.
- 📝 **Comprehensive Documentation:** Clearly document your project with ease.
- 🤝 **Contribution Guidelines:** Encourage community contributions with clear guidelines.
- 🛡️ **License Information:** Easily add a license to your project.
- ✨ **Modern Formatting:** Includes emojis, badges, and modern formatting to make your projects stand out.
- 💻 **Cross-Platform & Multipurpose:** Works on any OS and programming language. Fast, seamless, and easy to integrate.
- 🛠️ **Easy to Install:** Get started in minutes with a simple installation process and intuitive CLI.

## Technologies Used

| Technology   | Description                                                 |
| :----------- | :---------------------------------------------------------- |
| Node.js      | JavaScript runtime environment                                |
| TypeScript   | Typed superset of JavaScript                                |
| Commander.js | CLI framework for Node.js                                   |
| OpenAI API | Used to generate the Readme content. |
| Next.js      | React framework for building web applications. |
| Shadcn UI      | Re-usable components for React apps. |
| Vercel     | Hosting platform. |
| Supabase      | Open source Firebase alternative. |

## Contributing

We welcome contributions to Dokugen! 🎉

To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and write tests.
4. Submit a pull request.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Author Info

- **OritseWeyinmi Samuel Tuoyo**
  - [GitHub](https://github.com/samueltuoyo15)
  - [Twitter](https://twitter.com/TuoyoS26091)
  - [LinkedIn](https://www.linkedin.com/in/samuel-tuoyo-8568b62b6)
  - [Facebook](https://www.facebook.com/share/18XqXawpGj/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)
