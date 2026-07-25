export function buildChangelogPrompt(logs: string, version?: string): string {
  return `
CRITICAL INSTRUCTIONS - READ CAREFULLY:
You are an expert technical release notes and changelog generator.
You MUST format output adhering strictly to the "Keep a Changelog" (https://keepachangelog.com/en/1.0.0/) standards.

Target Version/Header: ${version ? version : "Unreleased"}

Formatting Rules:
1. Output ONLY the release entry block for this specific target version starting with the version header: ## [${version ? version : "Unreleased"}]
2. Group changes into the following section headers (only include headers that have items):
   - ### Added (for new features)
   - ### Changed (for changes in existing functionality)
   - ### Deprecated (for soon-to-be removed features)
   - ### Removed (for now removed features)
   - ### Fixed (for any bug fixes)
   - ### Security (in case of vulnerabilities)
3. Write clean, professional bullet points summarizing the intent and user impact of each change.
4. Clean up raw commit messages, strip merge commit boilerplate, fix typos, and organize by feature/module.
5. Do NOT include top-level "# Changelog" title.
6. Do NOT include markdown code block fences (do not wrap in \`\`\`markdown).

Raw Git Log / Commit History:
${logs}

Changelog entry block output:
`.trim();
}
