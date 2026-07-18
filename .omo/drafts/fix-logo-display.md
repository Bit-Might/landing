---
slug: fix-logo-display
status: awaiting-approval
intent: unclear
pending-action: write .omo/plans/fix-logo-display.md
approach: The plan will fix the SVG logo's display by modifying the SVG to use `currentColor` for its fill, making it stylable via CSS. It will also add a specific height to the logo's CSS in `index.html` to ensure it renders at a consistent and appropriate size within the header.
---

# Draft: fix-logo-display

## Open assumptions (announced defaults)
1. **Color:** The logo should inherit its color from the parent CSS. The SVG's internal hardcoded white fill is incorrect. **Default:** Modify SVG to use `fill="currentColor"`.
2. **Size:** The logo needs an explicit size to render predictably. The header is 80px tall, and the associated `<a>` tag has a `font-size` of `42px`, implying the intended logo height. **Default:** Add a CSS rule to set the `img` height to `42px`.

## Findings (cited - path:lines)
- `/Users/ta-nu-ki/Documents/Projects/landing/index.html:321`: `logo.svg` is used in an `<img>` tag without explicit width or height.
- `/Users/ta-nu-ki/Documents/Projects/landing/assets/logo.svg:6`: The SVG has an internal style setting a hardcoded fill color: `.st0{fill:#FFFFFF;}`.

## Decisions (with rationale)
- **Decision 1:** Modify the SVG to use `currentColor`. **Rationale:** This is a web development best practice for themeable icons and logos, allowing CSS to control the color. It fixes the inflexible hardcoded color.
- **Decision 2:** Add a CSS rule to `index.html` to control the logo's size. **Rationale:** This fixes the missing size, which causes unpredictable rendering. Setting a height of `42px` aligns with the existing CSS `font-size` on the `.logo` class, suggesting it was the intended size.

## Scope IN
- Editing `assets/logo.svg`.
- Editing `index.html`.

## Scope OUT (Must NOT have)
- Any changes to the site's layout or other assets.
- Changing the logo's vector shape.

## Approval gate
status: awaiting-approval
