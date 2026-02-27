# Dokugen

Dokugen is a lightweight README.md file Generator Command Line Interface Tool. It simplifies the process of writing your README.md file from scratch by generating professional README.md files for your projects, saving you time and ensuring consistency using AI. The idea behind Dokugen is simple but impactful, automate the most neglected part of a repo. The results cleaner projects and happier contributors

## Installation

### Prerequisites

- Python 3.8+
- [uv](https://docs.astral.sh/uv/) (Recommended) or pip

### Install with uv (Recommended)

```bash
uv tool install dokugen
# or
uv pip install dokugen
```

### Install with pip

```bash
pip install dokugen
```

## Usage

### Navigate to the project you want to work with

```bash
cd my-project
```

### Generate a new README interactively

```bash
dokugen generate
# or
python -m dokugen generate
```

> This command launches an interactive prompt to guide you through creating a professional README file.

### Generate README with template

```bash
dokugen generate --template https://raw.githubusercontent.com/username/repo-name/blob/main/README.md
```

> Use a custom GitHub repo readme file as a template to generate a concise and strict readme for your project.

### Update Existing README (Smart Update)

```bash
dokugen update
```

> **NEW!** Intelligently updates only auto-generated sections of your README while preserving all your custom content. Perfect for keeping your README fresh as your project evolves without losing your personal touch.

### Check Version

```bash
dokugen --version
```

## Features

- **Auto-Update System**: Dokugen automatically checks for new versions and updates itself when you run any command. Always stay current!
- **Smart README Updates**: Update your README without losing custom content. Only auto-generated sections get refreshed.
- **Automated Generation**: Automatically analyzes your project and generates a comprehensive README.
- **Real-Time Streaming**: Watch your README populate in real-time as it's being generated.
- **Compression Technology**: Handles large codebases efficiently with 70-90% payload size reduction.
- **Easy to Use**: Simple command-line interface for quick and easy README creation.
- **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux.
- **Programming Language and Framework Agnostic**: Works with any language (e.g., Python, JavaScript, Go, C#, C, Rust, etc.)
- **Options & Flags**: Supports flags and options like generating from a template, overwriting existing files, etc.

## Contributing

Contributions are welcome! [Read the contribution guide here.](https://github.com/samueltuoyo15/Dokugen/blob/main/CONTRIBUTION.md)

## Author

- **Samuel Tuoyo**
- [Twitter](https://x.com/TuoyoS26091)
- [LinkedIn](https://www.linkedin.com/in/samuel-tuoyo-8568b62b6)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
[![PyPI](https://img.shields.io/pypi/v/dokugen?label=PyPI&color=blue)](https://pypi.org/project/dokugen/)
[![Made in Nigeria](https://img.shields.io/badge/made%20in-nigeria-008751.svg?style=flat-square)](https://github.com/acekyd/made-in-nigeria)
