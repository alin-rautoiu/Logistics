# Agent Workflow Guide

This repository uses TypeScript source files under scripts and generated JavaScript output under built.

## Primary rules
- Edit source in scripts for behavioral changes.
- Treat built as generated output from TypeScript compilation.
- Do not hand-edit generated files in built unless explicitly requested.
- Keep script loading order stable in index.html unless a task requires change.

## Validation
- Compile with: npx tsc -p tsconfig.json
- Report compile errors with file and line references.

## Change quality
- Prefer minimal, targeted edits.
- Preserve existing class names, canvas ids, and selector contracts.
- Add concise comments only for non-obvious logic.

## Where to look
- Global defaults: .github/copilot-instructions.md
- Scoped coding rules: .github/instructions/*.instructions.md
