# Contributing to Dokugen

Thanks for wanting to contribute to Dokugen! We appreciate your help making this project better.

We accept contributions across these main parts of the project:
- **CLI** (`apps/cli/clients`)
- **Server** (`apps/server`)
- **Docs** (`apps/docs`)
- **VSCode Extension** (`apps/vscode-extension`)

---

## Simple Guidelines

Before submitting a pull request, please keep these basic rules in mind:

1. **No Emojis**: Do not add emojis in your code, inline comments, commit messages, or PR titles.
2. **Clean Up Debug Logs**: Remove temporary `console.log`, `print()`, debug code, or unused labels before submitting your code.
3. **Test Your Code**: Make sure your changes compile and pass basic linting (`pnpm run lint`).
4. **Clean Commit Messages**: Use simple, descriptive commit messages without emojis (for example: `feat(cli): add new option` or `fix(server): fix route response`).

---

## Setup & App Workflows

### Prerequisites
- **Node.js** (v18+)
- **pnpm** (v9+ recommended)

Run `pnpm install` at the project root to install dependencies for all apps.

---

### 1. CLI (`apps/cli/clients`)

#### TypeScript CLI (`apps/cli/clients/typescript`)
1. Go to `apps/cli/clients/typescript`.
2. Make your edits in `bin/` or `src/`.
3. Run `pnpm run build` to compile your TypeScript code into `dist/`.
4. Test it locally by running `node dist/bin/dokugen.mjs`.

#### Python CLI (`apps/cli/clients/python`)
1. Go to `apps/cli/clients/python`.
2. Set up a virtual environment: `python -m venv .venv` and activate it.
3. Install editable mode: `pip install -e .`
4. Test your commands using `dokugen`.

#### Go CLI (`apps/cli/clients/golang`)
1. Go to `apps/cli/clients/golang`.
2. Test your changes with `go run main.go` or `go build`.

---

### 2. Server (`apps/server`)
1. Go to `apps/server`.
2. Create a `.env` file with your local API keys (Gemini, Supabase, etc.).
3. Run `pnpm run dev` or `pnpm run build` to test the backend logic.
4. Keep server responses and prompt templates clean without emojis.

---

### 3. Docs (`apps/docs`)
1. Go to `apps/docs`.
2. Run `pnpm run dev` to preview the Next.js site locally.
3. Run `pnpm run build` to make sure the site builds cleanly.

---

### 4. VSCode Extension (`apps/vscode-extension`)
1. Go to `apps/vscode-extension` and open it in VSCode (`code .`).
2. Press `F5` to open the Extension Development Host window.
3. Test your commands from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).

---

## Submitting Your Work

1. If you're planning a big feature or fix, open an issue first so we can discuss it.
2. Push your branch and open a Pull Request.

Thanks again for helping out!
