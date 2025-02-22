# Dokugen: Your README.md Generator 🦸

A CLI tool to automatically generate high-quality README files for your projects. Spend less time on documentation and more time building!

## Description

Dokugen scans your project, analyzes the file structure and code, and then generates a comprehensive README.md file based on your project type and key characteristics. It supports various languages and frameworks, including JavaScript/TypeScript, Python, Go, and more. It also asks you key questions like "Does your project use Docker?" to improve the output.

## Installation

To install Dokugen globally and make it accessible from any project directory, run:

```bash
npm install -g dokugen
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

## Contributing

Contributions are welcome! Feel free to submit pull requests with improvements, bug fixes, or new features.

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Submit a pull request.

## License

This project is open-source and available under the MIT License. See the `LICENSE` file for more information.
### Developers [Samuel Tuoyo](https://github.com/samueltuoyo15) & [Charming DC](https://github.com/Charmingdc)
## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Dokugen](https://img.shields.io/badge/Built%20with-Dokugen-brightgreen)](https://github.com/your-username/dokugen)

## Acknowledgements

This project uses the following open-source libraries:

*   [commander](https://github.com/tj/commander.js)
*   [chalk](https://github.com/chalk/chalk)
*   [fs-extra](https://github.com/jprichardson/node-fs-extra)
*   [path](https://nodejs.org/api/path.html)
*   [inquirer](https://github.com/SBoudrias/Inquirer.js)
*   [axios](https://github.com/axios/axios)