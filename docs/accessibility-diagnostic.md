# Diagnostic assessment — accessibility notes

The OWE skills diagnostic is designed to meet WCAG 2.1 / 2.2 AA. This
document records the ARIA semantics, keyboard interaction model, and
focus-ring strategy for the question step — the parts of the
accessibility pass landing in phase 1. Phase 2 additions (auto-advance
toggle, focus-to-heading on question change, aria-live question
announcements) are documented here once the corresponding route
changes ship alongside the i18n migration.

## Question step ARIA semantics

The three question types each expose the expected ARIA role pattern:

| Question type       | Container role | Item role  | State          |
| ------------------- | -------------- | ---------- | -------------- |
| Single choice       | `radiogroup`   | `radio`    | `aria-checked` |
| Multiple choice     | `group`        | `checkbox` | `aria-checked` |
| Scale (1–5 circles) | `radiogroup`   | `radio`    | `aria-checked` |

The scale `radiogroup` carries a descriptive `aria-label` of the form
`Rate from 1 to 5`, and each scale button gets an individual
`aria-label` like `"3 — Somewhat"` so screen readers announce the
scale meaning, not just the numeral.

All option buttons carry `data-option="true"`, which lets both tests
and future parent components target options without depending on
class names.

## Keyboard interaction

| Key                 | Action                                                |
| ------------------- | ----------------------------------------------------- |
| `Tab` / `Shift+Tab` | Move focus between the group and other page controls. |
| `Space` / `Enter`   | Select / toggle the currently focused option.         |

## Focus rings

All interactive elements in the question step use
`focus-visible:ring-2 focus-visible:ring-accent-dark
focus-visible:ring-offset-2`. `accent-dark` (#3578C0) against the
white / surface backgrounds exceeds a 3:1 contrast ratio, meeting
WCAG 1.4.11 Non-text Contrast.

## Motion

Hover scale effects on the scale circles respect
`motion-reduce:hover:scale-100` and `motion-reduce:scale-100`, so
users with `prefers-reduced-motion: reduce` see no scale
animation.

## Test coverage

- `e2e/diagnostic.spec.ts` runs axe-core against
  `/diagnostic/assessment` and fails the build on any serious or
  critical violation.
- `e2e/a11y.spec.ts` runs the platform-wide WCAG 2.2 AA sweep on
  both desktop and mobile viewports, which includes the diagnostic
  assessment route.
