---
slug: fix-logo-inline
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/fix-logo-inline.md
approach: The plan will fix the logo rendering issue by inlining the SVG code directly into the index.html file and updating the corresponding CSS. This is a more robust method than using an `<img>` tag and ensures styles are applied correctly.
---

# Draft: fix-logo-inline

## Decisions (with rationale)
- **Decision:** Inline the SVG into the HTML.
- **Rationale:** The user reported the logo was appearing black, which indicates that using `<img src="logo.svg">` with `fill: currentColor` is not working reliably in their environment. Inlining the SVG makes it part of the DOM, which is the most robust way to ensure CSS `color` is inherited correctly.

## Scope IN
- Editing `index.html`.
- Reading `assets/logo.svg`.

## Scope OUT (Must NOT have)
- Creating new files.
- Modifying any files other than `index.html`.

## Approval gate
status: awaiting-approval
