const CONVENTIONAL_COMMIT_REGEX = /^(feat|fix|refactor|chore|docs|style|test|perf|ci|build)(\([^)]+\))?:\s*(.+)$/i;
const GENERIC_FALLBACK_MESSAGES = new Set(["chore: update code", "chore: update codebase", "chore: update files"]);

export type SanitizedCommitMessage =
  | { message: string; repaired: boolean }
  | { message?: never; repaired: false; reason: string };

export function extractCompletionMessage(completion: unknown): string {
  if (!completion || typeof completion !== "object") return "";

  const choices = (completion as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return "";

  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") return "";

  const message = (firstChoice as { message?: unknown }).message;
  if (!message || typeof message !== "object") return "";

  const content = (message as { content?: unknown }).content;
  return typeof content === "string" ? content.trim() : "";
}

export function sanitizeCommitMessage(raw: string): SanitizedCommitMessage {
  if (!raw || !raw.trim()) {
    return { repaired: false, reason: "The model returned an empty response" };
  }

  const text = raw
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .trim();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const cleaned = line
      .replace(/^[-*•]\s+/, "")
      .replace(/^["'`]|["'`]$/g, "")
      .replace(/^(commit message|commit|suggested commit|generated commit):\s*/i, "")
      .trim();

    const match = cleaned.match(CONVENTIONAL_COMMIT_REGEX);
    if (!match) continue;

    const type = match[1].toLowerCase();
    const scope = (match[2] || "").toLowerCase();
    let description = match[3]
      .trim()
      .replace(/[.!?]+$/, "")
      .replace(/^["'`]|["'`]$/g, "")
      .replace(/\s+/g, " ");
    description = description.charAt(0).toLowerCase() + description.slice(1);

    const prefix = `${type}${scope}: `;
    const maxDescriptionLength = 72 - prefix.length;
    if (description.length > maxDescriptionLength) {
      const shortened = description.slice(0, maxDescriptionLength + 1);
      const lastSpace = shortened.lastIndexOf(" ");
      description = (lastSpace > 0 ? shortened.slice(0, lastSpace) : shortened.slice(0, maxDescriptionLength)).trim();
    }

    if (description) {
      const message = `${prefix}${description}`;
      if (GENERIC_FALLBACK_MESSAGES.has(message)) {
        return { repaired: false, reason: "The model returned a generic, non-specific commit message" };
      }
      return { message, repaired: message !== cleaned };
    }
  }

  return { repaired: false, reason: "The model response was not a valid Conventional Commit message" };
}
