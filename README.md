# Dokugen: Your README.md Generator 🦸‍♀️

### Current Version: 3.0.0 🤗

A CLI tool to automatically generate high-quality README files for your projects. Spend less time on documentation and more time building!

## Description

Dokugen scans your project, analyzes the file structure and codebase, and then generates a comprehensive `README.md` file based on your project type and key characteristics. It supports various languages and frameworks, including JavaScript/TypeScript, Python, Go, and more. It also asks you key questions like "Does your project use Docker?" to improve the output.

## Installation

To install Dokugen globally and make it accessible from any project directory, run:

```bash
npm install -g dokugen
```

### Verify Installation

Ensure Dokugen is installed by checking its version:

```bash
dokugen --version
```

## Usage

Navigate to your project's root directory in the terminal and run:

```bash
npx dokugen generate
```

The tool will guide you through a few questions to customize the README generation process. If a `README.md` already exists, you will be prompted to overwrite it.

### Example

```bash
cd my-awesome-project
npx dokugen generate
```

The tool will then generate a `README.md` file in your project's root directory.

## Development

If you want to contribute or test changes locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/samueltuoyo15/Dokugen.git
   cd Dokugen
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Test the CLI locally:

   ```bash
   node ./dist/bin/dokugen.mjs generate
   ```

## Contributing

Contributions are welcome! Follow these steps to contribute:

1. **Fork the repository**: Click the "Fork" button on GitHub.
2. **Create a new branch**: Use a meaningful branch name.

   ```bash
   git checkout -b feature-your-feature-name
   ```

3. **Make your changes**: Ensure your code follows best practices.
4. **Test your changes**: Run:

   ```bash
   npm run build
   node ./dist/bin/dokugen.mjs generate
   ```

5. **Commit your changes**: Use descriptive commit messages.

   ```bash
   git commit -m "Added feature: [describe feature]"
   ```

6. **Push your branch**:

   ```bash
   git push origin feature-your-feature-name
   ```

7. **Create a Pull Request**: Go to GitHub and submit a pull request.

## Acknowledgements

This project uses the following open-source libraries:

- [commander](https://github.com/tj/commander.js)
- [chalk](https://github.com/chalk/chalk)
- [fs-extra](https://github.com/jprichardson/node-fs-extra)
- [path](https://nodejs.org/api/path.html)
- [inquirer](https://github.com/SBoudrias/Inquirer.js)
- [axios](https://github.com/axios/axios)

## ⚙️ Technologies Used

- **TypeScript**: Scalable and maintainable codebase.
- **Chokidar**: File system watcher for live updates.
- **Commander.js**: CLI framework.
- **Inquirer.js**: Interactive command-line prompts.
- **Next.js**: SEO-friendly dashboard interface.
- **Supabase PostgreSQL**: Real-time active user monitoring.
- **OpenAI**: Used for README content generation.

## License

This project is open-source and available under the MIT License. See the `LICENSE` file for more information.

## Contributors

- [OritseWeyinmi Samuel Tuoyo](https://github.com/samueltuoyo15)
- [CharmingDc Adebayo](https://github.com/Charmingdc)
- [Ogunwele](https://github.com/ogunlewe)

## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/samueltuoyo15/Dokugen)