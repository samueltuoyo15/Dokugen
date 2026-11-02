import Copy from "@/components/Copy";
import Container from "./Container";

const cardClass = "rounded-2xl border border-zinc-200 bg-white p-6";

/** Install steps. Wording is unchanged from the previous page. */
export default function GetStarted() {
  return (
    <Container className="pb-24">
      <h2 id="get-started" className="scroll-mt-8 text-4xl font-bold tracking-tight text-zinc-950">
        Getting Started
      </h2>

      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className={`${cardClass} flex flex-col`}>
            <h3 className="mb-3 text-lg font-bold text-zinc-950">Method 1: Node.js</h3>
            <p className="mb-6 flex-grow text-sm leading-relaxed text-zinc-500">
              Install globally via npm, yarn, or pnpm if you have Node.js installed.
            </p>
            <Copy code="npm install -g dokugen" />
            <p className="mt-3 text-xs text-zinc-400">
              or: <code className="font-mono text-zinc-600">pnpm add -g dokugen@latest</code>
            </p>
          </div>

          <div className={`${cardClass} flex flex-col`}>
            <h3 className="mb-3 text-lg font-bold text-zinc-950">Method 2: Python</h3>
            <p className="mb-6 flex-grow text-sm leading-relaxed text-zinc-500">
              Install via uv (recommended) or pip. The Python client is fully featured and production-ready.
            </p>
            <Copy code="uv tool install dokugen" />
            <p className="mt-3 text-xs text-zinc-400">
              or: <code className="font-mono text-zinc-600">pip install dokugen</code>
            </p>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="mb-3 text-lg font-bold text-zinc-950">3. Navigate to Project</h3>
          <p className="mb-6 text-sm leading-relaxed text-zinc-500">
            Open your terminal and navigate to your project directory:
          </p>
          <Copy code="cd your-project" className="text-sm" />
        </div>

        <div className={cardClass}>
          <h3 className="mb-3 text-lg font-bold text-zinc-950">4. Launch Interactive Menu</h3>
          <p className="mb-6 text-sm leading-relaxed text-zinc-500">
            Run the CLI command without arguments to open the interactive assistant:
          </p>
          <Copy code="dokugen" className="text-sm" />
        </div>

        <div className={cardClass}>
          <h3 className="mb-3 text-lg font-bold text-zinc-950">5. Customize</h3>
          <p className="text-sm leading-relaxed text-zinc-500">
            Edit the generated{" "}
            <code className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">
              README.md
            </code>{" "}
            file to check the final output.
          </p>
        </div>
      </div>
    </Container>
  );
}
