---
applyTo: "scripts/**/*.ts"
---
# Simulation Code Instructions

## Architecture
- Follow established base classes in scripts/Canvas and scripts/Entities.
- Prefer extending existing patterns over introducing new framework layers.

## Behavior and determinism
- Keep update loops and transitions deterministic unless intentional randomness is required.
- Parameterize randomness so it can be tuned or disabled.

## Type and API consistency
- Keep changes aligned across scripts/Types, scripts/Targets, and instanced canvas classes.
- When changing constructor signatures, update all affected instanced usages.

## Performance
- Avoid unnecessary allocations in per-frame loops.
- Reuse objects where practical inside draw and update paths.

## Completion criteria
- TypeScript compiles with npx tsc -p tsconfig.json.
- No stale imports or orphan references remain.
- Existing canvas entry points still initialize correctly from index.html.
