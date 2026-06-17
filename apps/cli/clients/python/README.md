# Dokugen (Python Client)

Dokugen is a lightweight, AI-powered README.md generator command-line tool. It automates writing and updating project documentation, ensuring clean, consistent, and professional README files.

---

## ⚡ Quick Start

### Installation

Install Dokugen globally using `uv` (recommended) or `pip`:

```bash
uv tool install dokugen
# or
pip install dokugen
```

---

## 🚀 Usage

### 1. Launch the Interactive Assistant
Simply run `dokugen` in your project folder to open the interactive setup assistant. From here, you can generate a README, update files, revert backups, or run AI-assisted Git commits.

```bash
dokugen
```

*Note: If `dokugen` command is not in your PATH, you can also run it via Python:*
```bash
python -m dokugen
```

### 2. Standalone Commands

#### Generate README
Scan your project files and construct a new README.md.
```bash
dokugen generate
```

#### Generate README with a custom Template
Use any public README.md file as a structure template.
```bash
dokugen generate --template https://raw.githubusercontent.com/username/repo/main/README.md
```

#### Smart Update README
Intelligently rebuilds auto-generated sections (tech stack, API details, file layout) while keeping your custom text, notes, and badges intact.
```bash
dokugen update
```

#### AI Git Commit (`aic`)
Analyze your staged files, generate a Conventional Commit message automatically, commit, and optionally push.
```bash
dokugen aic
# or
dokugen aic --push
```

#### Safety Backup Revert (`revert`)
Accidentally generated something you didn't like? Restore your previous README instantly from our automatic backup.
```bash
dokugen revert
```

---

## ✨ Features

- **Interactive Menu**: Run `dokugen` with no arguments to navigate all tool actions in a beautiful console prompt.
- **Smart Updates**: Re-run the generation process without losing your manual modifications. Only auto-generated blocks get updated.
- **AI-Powered Commits**: Automatic staging and conventional commit message generation via Gemini.
- **Compressed Uploads**: Efficiently packages codebases with 70–90% upload size compression to support larger projects.
- **Language Agnostic**: Works out of the box with JavaScript, TypeScript, Python, Rust, Go, C#, C++, Java, and more.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Read our [Contribution Guide](https://github.com/samueltuoyo15/Dokugen/blob/main/CONTRIBUTION.md) to get started.

## 👤 Author

- **Samuel Tuoyo**
- [Twitter](https://x.com/TuoyoS26091)
- [LinkedIn](https://www.linkedin.com/in/samuel-tuoyo-8568b62b6)

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
[![PyPI](https://img.shields.io/pypi/v/dokugen?label=PyPI&color=blue)](https://pypi.org/project/dokugen/)
[![Made in Nigeria](https://img.shields.io/badge/made%20in-nigeria-008751.svg?style=flat-square)](https://github.com/acekyd/made-in-nigeria)
