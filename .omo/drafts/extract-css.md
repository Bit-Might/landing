---
slug: extract-css
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/extract-css.md
approach: The plan is to refactor the HTML by extracting all the inline CSS from the `<style>` block in `index.html` into a new, separate `styles.css` file. The `index.html` will then be updated to link to this external stylesheet. This improves code organization and follows best practices.
---

# Draft: extract-css

## Decisions (with rationale)
- **Decision:** Create an external `styles.css` file and move all inline styles from `index.html` into it.
- **Rationale:** Separating CSS from HTML is a fundamental web development best practice. It improves maintainability, readability, and allows the browser to cache the stylesheet separately.

## Scope IN
- Creating a new file: `styles.css`.
- Editing `index.html`.

## Scope OUT (Must NOT have)
- Changing any of the actual CSS rules.
- Modifying any other files.

## Approval gate
status: awaiting-approval
