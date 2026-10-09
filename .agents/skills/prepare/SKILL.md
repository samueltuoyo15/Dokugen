---
name: prepare
description: Inspects full git diff across uncommitted changes and branch commits, then generates ready-to-paste GitHub Issue and PR markdown matching exact repository templates.
---

# Prepare GitHub Issue & PR Generator

Use this skill when the user runs `/prepare` or requests to prepare an issue and pull request.

## Workflow Instructions

1. Inspect the full branch history and diff:
   - Run `git log origin/main..HEAD` and `git diff origin/main...HEAD` (or `git diff HEAD~N..HEAD` if upstream is not set) to review ALL committed changes on the current feature branch.
   - Also check `git status --short` and `git diff` for any remaining uncommitted edits.
   - Combine all committed features, bug fixes, and chores across the entire branch to provide complete, comprehensive context.
2. Determine whether the branch represents:
   - **Feature request** (`feat: ...`): Use the Feature Request template fields (`Problem`, `Proposed solution`, `Alternatives considered`).
   - **Bug report** (`bug: ...`): Use the Bug Report template fields (`What happened`, `Steps to reproduce`, `Where`, `Additional context`).
   - **Chore / task** (`chore: ...`): Use the Chore template fields (`What needs to change`, `Why now`).
3. State explicitly which issue template option to choose on GitHub: `Feature request`, `Bug report`, or `Chore / task`.
4. Provide the exact text to paste into each field of that GitHub Issue form.
5. Format the Pull Request body based on `.github/PULL_REQUEST_TEMPLATE.md`.

## Output Format

### 1. GitHub Issue

**Template to Choose on GitHub:** `[Feature request | Bug report | Chore / task]`  
**Title:** `[type]: [short descriptive title]`

#### For Feature Request:
```markdown
### Problem
[Describe what is missing or awkward today: the gap]

### Proposed solution
[Describe what was built across the stack]

### Alternatives considered
[Other approaches or notes, or leave blank if standard]
```

#### For Bug Report:
```markdown
### What happened
[What you did, what you expected, what happened instead]

### Steps to reproduce
1. ...
2. ...

### Where
[Package or app affected, e.g. apps/web, apps/server]

### Additional context
[Logs, context, or notes]
```

#### For Chore / Task:
```markdown
### What needs to change
[What needs to change in the codebase]

### Why now
[What prompted this change]
```

---

### 2. GitHub Pull Request

**Title:** `[type]: [short descriptive title]`

```markdown
## Issue

Closes #[ISSUE_NUMBER]

## What changed
- [Concise bullet point 1]
- [Concise bullet point 2]
- [Concise bullet point 3]

## How to verify
1. [Step 1 to test or verify]
2. [Step 2 to test or verify]

## Checklist
- [x] Linked issue was approved before this PR was opened
- [x] `pnpm lint` and `pnpm build` pass locally
- [x] New/changed behavior has been verified
- [x] Docs (README, docs) updated if applicable
```
