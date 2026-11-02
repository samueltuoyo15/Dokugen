import Container from "./Container";
import GradientPanel, { type GradientVariant } from "./GradientPanel";
import TerminalWindow from "./TerminalWindow";

interface Step {
  variant: GradientVariant;
  muted: string;
  strong: string;
  title: string;
  lines: string[];
}

const steps: Step[] = [
  {
    variant: "purple",
    muted: "Instant",
    strong: "README",
    title: "dokugen generate",
    lines: ["$ dokugen generate", "Analyzing project files...", "Scanning project files...", "README.md created successfully"],
  },
  {
    variant: "orange",
    muted: "Smart",
    strong: "Updates",
    title: "dokugen update",
    lines: [
      "$ dokugen update",
      "Analyzing README structure...",
      "Updating auto-generated sections...",
      "Your custom content is untouched",
    ],
  },
  {
    variant: "green",
    muted: "Commit",
    strong: "with AI",
    title: "dokugen aic",
    lines: ["$ dokugen aic", "Files being committed:", "Analyzing staged changes...", "feat(auth): add device login"],
  },
];

/** Three gradient cards, each with a terminal cropped at the card edge. */
export default function HowItHelps() {
  return (
    <Container className="pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-zinc-950 md:text-5xl">
          How Dokugen helps you <span className="italic text-violet-600">ship faster.</span>
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
          Document, update and commit your project with everything you need, in one command.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.strong}>
            <GradientPanel variant={step.variant} className="h-[340px] pl-5 pt-16">
              <TerminalWindow title={step.title} className="h-full w-[150%] rounded-r-none rounded-b-none">
                <div className="space-y-2 px-4 py-4 font-mono text-[11px] leading-relaxed">
                  {step.lines.map((line) => (
                    <p key={line} className={line.startsWith("$") ? "text-zinc-100" : "text-zinc-400"}>
                      {line}
                    </p>
                  ))}
                </div>
              </TerminalWindow>
            </GradientPanel>
            <p className="mt-4 text-xl font-medium tracking-tight text-zinc-400">
              {step.muted} <span className="font-semibold text-zinc-950">{step.strong}</span>
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
