---
applyTo: "{index.html,syles/**/*.css}"
---
# Frontend Integration Instructions

## HTML wiring
- Keep canvas object bootstrapping and script ordering stable by default.
- Do not rename or remove selectors used by JavaScript listeners without updating all references.

## CSS safety
- Preserve behavior-oriented classes and states used by runtime code.
- Avoid broad selector edits that can create regressions in unrelated sections.
- Maintain existing media-query intent and responsive behavior.

## Interaction checks
- Verify expand and collapse states, hover interactions, and hidden or visible toggles.
- Avoid pointer-events conflicts around canvas containers and controls.

## Completion criteria
- Main content flow remains readable and usable.
- Canvas controls remain visible and interactive.
- Read-more interactions continue to work.
