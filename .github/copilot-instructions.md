---
applyTo: "**"
---
# Repository-Wide Copilot Instructions

## Source of truth
- Use scripts as editable source.
- built contains generated JavaScript output.
- Avoid direct edits in built unless user explicitly asks for it.

## Safe editing
- Make the smallest change that solves the task.
- Preserve existing public names and ids unless full call-site updates are included.
- Keep runtime behavior stable unless behavior change is requested.

## Build and verification
- Compile TypeScript with: npx tsc -p tsconfig.json
- If errors appear, fix errors related to the task and report remaining blockers.

## Frontend and runtime contracts
- Keep index.html script include order intact unless required.
- Preserve selectors used by event listeners and canvas bootstrapping.
- Maintain compatibility with existing responsive breakpoints in CSS.

## Communication expectations
- Explain what changed and why.
- Include concrete file references when summarizing edits.
