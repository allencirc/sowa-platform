# Changelog

All notable changes to the SOWA platform will be documented in this file.

## Unreleased

### Added — Email notifications for content workflow

Editors and admins now receive email notifications when content moves
through the publishing workflow. Notifications are sent via SMTP
(nodemailer) and can be toggled per-user in admin Settings.

- **Email dispatch abstraction** (`src/lib/email.ts`) — SMTP transport
  with lazy singleton, `EMAIL_ENABLED` kill switch for dev safety,
  fire-and-forget pattern (never blocks API responses). Four branded
  HTML templates: submitted for review, approved, rejected, published.

- **Content author resolution** (`src/lib/content-author.ts`) — derives
  the original author from the earliest `ContentVersion` record, avoiding
  schema changes to existing content models.

- **Notification orchestrator** (`src/lib/notifications.ts`) — maps
  status transitions to emails, respects per-user preferences. Triggers:
  `IN_REVIEW` notifies all admins, `PUBLISHED` notifies the author,
  rejection (`IN_REVIEW → DRAFT`) notifies the author with the note.

- **Notification preferences API** (`/api/notification-preferences`) —
  GET (list) and PUT (toggle) endpoints. Preferences default to enabled
  when no row exists (zero-config for existing users).

- **NotificationSettings UI** (`src/components/admin/NotificationSettings.tsx`)
  — toggle switches in admin Settings, role-aware (admins see 4 events,
  editors see 3). Optimistic updates with revert on failure.

- **Prisma migration** `add-notification-preferences` — new
  `NotificationPreference` model with `@@unique([userId, event])`.

- **Tests** — 7 Vitest unit tests for email dispatch + templates,
  6 for the notification orchestrator, 3 Playwright e2e tests for
  API auth enforcement on the preferences endpoint.

### Added — Diagnostic assessment, phase 1 (engine + infrastructure)

This is the first of two PRs delivering the three diagnostic enhancements
scoped in the brief. Phase 1 lands the scoring engine, the share-link
encoding library, the reusable view components, and the accessible
question-step primitives. The user-visible wiring (share button, tabs,
auto-advance toggle, results sub-route) depends on the in-flight i18n
migration and will land in phase 2 once that merges.

- **Share-link encoding library** (`src/lib/diagnostic-share.ts`) —
  `encodeAnswers` / `decodeAnswers` / `buildShareUrl` with schema
  versioning. URL-safe base64, typically under 300 characters for a
  12-question run. Decoder returns a discriminated union so old
  links surface as `incompatible_version` instead of silently
  producing nonsense. Fully covered by `diagnostic-share.test.ts`
  (round-trip, error paths, version gate, URL construction).

- **Role-family fit engine** (`src/lib/diagnostic-role-weights.ts`,
  `computeRoleFamilyFit` in `src/lib/diagnostic.ts`). Six role
  families — technician, engineer, marine ops, HSE, project /
  commercial, data / digital — with a steering-group-reviewable
  weight map. Confidence is a skill-percentage × weight weighted
  average with deterministic English reasoning bullets (no runtime
  AI — static, accessible, SEO-friendly). `DiagnosticResult` gains
  a new `roleFamilyFit` field; existing scoring, gap severity,
  benchmark overlay, `AISummary`, course ranking, and
  `interestToCareerMap` are untouched. Unassessed skills are skipped
  rather than silently scoring 0. Covered by
  `diagnostic-role-fit.test.ts`.

- **Reusable results view components** (`ResultsView.tsx`,
  `RoleFitView.tsx`). `ResultsView` hosts the hero, copy-share-link
  button, mentor `mailto:`, and the tabs panel. `RoleFitView` renders
  the top-3 role cards with confidence bars, reasoning bullets, and
  career deep-links. Both components compile cleanly in phase 1 but
  are not yet wired into a route — consumers land in phase 2.

### Changed — Accessibility (question step)

- `QuestionStep` now exposes proper ARIA semantics. Single-choice
  options use `role="radiogroup"` / `role="radio"` with
  `aria-checked`; multi-choice uses `role="group"` / `role="checkbox"`;
  scale questions are a labelled `role="radiogroup"` with descriptive
  `aria-label`s (`"3 — Somewhat"`). Space and Enter activate the
  focused option.
- All option buttons carry `data-option="true"` so tests and the
  parent component can target them without brittle class selectors.
- Focus-visible rings using `ring-accent-dark` meet WCAG 1.4.11
  Non-text Contrast (3:1) against both option and page backgrounds.
- Scale question hover scale respects `motion-reduce`.
- `e2e/diagnostic.spec.ts` adds an axe-core serious/critical build
  gate on `/diagnostic/assessment`.

### Holding for phase 2

The following are built, tested locally, and waiting on the i18n
migration before shipping to users:

- "Copy share link" button and mentor mailto on the results page.
- `/diagnostic/assessment/results?a=<encoded>` sub-route that
  decodes the payload and re-runs `calculateResults`.
- Gaps / Best-fit roles tab control with URL round-trip.
- `AssessmentClient` updates: auto-advance toggle (WCAG 2.2.1),
  focus-to-heading on question change, aria-live question
  announcements, arrow-key navigation across option groups.
