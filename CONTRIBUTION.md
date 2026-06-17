# Contributing to Dokugen

First off, thank you for considering contributing to Dokugen! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

Currently, we are actively accepting contributions in these specific areas:

-   **CLI** (`apps/cli/clients`)
-   **Docs** (`apps/docs`)
-   **Server** (`apps/server`)
-   **VSCode Extension** (`apps/vscode-extension`)

---

## Getting Started

To get started, you'll need to set up the project locally. Here is a step-by-step specific guide to help you navigate the codebase without getting overwhelmed.

### Prerequisites

-   **Node.js**: Version 18 or higher.
-   **pnpm**: Recommended package manager (but `npm` or `yarn` works too).

### 1. Global Setup

Before working on any specific part of the app, you need to clone the repo and install the dependencies for the entire workspace.

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/samueltuoyo15/Dokugen.git
    ```

2.  **Enter the Project Root**:
    ```bash
    cd Dokugen
    ```

3.  **Install All Dependencies**:
    We use a workspace structure, so installing at the root handles dependencies for all apps (Cli, Server, etc.) at once.
    ```bash
    pnpm install
    # or
    npm install
    ```

---

## Contribution Workflows

Depending on what you want to fix or improve, follow the specific workflow below.

### Working on the CLI (`apps/cli/clients`)

This is the core command-line tool. If you are adding features or fixing bugs in the CLI:

#### TypeScript CLI

1.  **Navigate to the TypeScript CLI Directory**:
    ```bash
    cd apps/cli/clients/typescript
    ```

2.  **Make Your Changes**:
    Edit the TypeScript source files in `bin/`.

3.  **Build the Project (CRITICAL STEP)**:
    Since the TS client is a TypeScript project, **you must compile your code** before you can run it. The `node` command cannot run TypeScript files directly (`.ts`), it needs the compiled JavaScript in the `dist/` folder.
    
    *Every time you make a TS change, run:*
    ```bash
    pnpm run build
    # or
    npm run build
    ```
    *This generates the `dist` folder.*

4.  **Test Your Changes**:
    Run the compiled CLI locally:
    ```bash
    node dist/bin/dokugen.mjs generate
    # or for smart update:
    node dist/bin/dokugen.mjs update
    # or for commit message generation:
    node dist/bin/dokugen.mjs aic
    ```

#### Python CLI

1.  **Navigate to the Python CLI Directory**:
    ```bash
    cd apps/cli/clients/python
    ```

2.  **Set Up a Local Environment**:
    We recommend using a Python virtual environment to manage dependencies locally:
    ```bash
    python -m venv .venv
    # Activate virtual environment
    # On Windows:
    .venv\Scripts\activate
    # On macOS/Linux:
    source .venv/bin/activate
    ```

3.  **Install in Editable Mode**:
    Install the package and its development dependencies:
    ```bash
    pip install -e .
    ```

4.  **Make Your Changes**:
    Edit the Python source files in `src/dokugen/`.

5.  **Test Your Changes**:
    You can run the CLI commands directly:
    ```bash
    dokugen generate
    # or for smart update:
    dokugen update
    # or for commit message generation:
    dokugen aic
    ```

---

### Working on the Server (`apps/server`)

This handles the backend logic and API requests.

1.  **Navigate to the Server Directory**:
    ```bash
    cd apps/server
    ```

2.  **Environment Setup**:
    You **must** create a `.env` file in `apps/server/` for the server to run. Copy the variables below:

    ```env
    PORT=3000
    NODE_ENV=development
    BACKEND_DOMAIN=http://localhost:3000
    GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
    MODEL_NAME=gemini-2.5-flash
    GROQ_API_KEY=your_groq_api_key_here
    GROQ_MODEL_NAME=llama-3.3-70b-versatile
    SUPABASE_CLIENT_URL=your_supabase_url
    SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
    SUPABASE_SECRET_KEY=your_supabase_secret_key
    ```
    *(Note: Replace the placeholders with your actual API keys/URLs).*

3.  **Build & Run**:
    ```bash
    npm run build
    npm start
    ```
    *Alternatively, for development, you can run `npx ts-node server.ts` or `npm run dev`.*

---

## Submission Guidelines

-   **Issues**: Before starting any major work, please open an issue to discuss what you want to change. Alternatively, you can browse existing [Open Issues](https://github.com/samueltuoyo15/Dokugen/issues) and comment on one you'd like to tackle.
-   **Pull Requests**: specific to the area you worked on (`feat(cli): ...` or `fix(server): ...`).

Thank you for helping active this project! Happy Coding!
