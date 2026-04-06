<!--
  Thanks for contributing to the SOWA OWE Platform.
  Please fill in each section below. PRs with empty sections will be
  blocked by review until they are completed.
-->

## What

<!-- One or two sentences describing the change. What does this PR do? -->

## Why

<!-- Motivation and context. Link to a ticket, issue, or tender section
     if applicable, e.g. Closes #123 or refs docs/security.md §4.2. -->

## How

<!-- High-level summary of the approach. Highlight any non-obvious
     decisions, trade-offs, or architectural changes. -->

## How tested

<!-- Tick all that apply and add details.
     Automated tests are required for new logic. -->

- [ ] `npm run type-check` passes locally
- [ ] `npm run lint` passes locally
- [ ] `npm run format:check` passes locally
- [ ] `npm test` (Vitest) passes locally
- [ ] `npm run test:e2e` (Playwright + axe) passes locally
- [ ] Manual QA in a Vercel preview deployment
- [ ] Not applicable (explain why):

## Screenshots / recordings

<!-- For any user-visible change, attach before/after screenshots or
     a short screen recording. Desktop + mobile where relevant.
     Delete this section if the change has no visible output. -->

## Risk & rollback

<!-- Migration? Data backfill? Feature flag? How do we roll this back
     if it breaks production? Leave "Low risk — revert the commit"
     if there is nothing special. -->

## Checklist

- [ ] PR title follows Conventional Commits (`feat:`, `fix:`, `chore:` …)
- [ ] No secrets, credentials, or personal data committed
- [ ] Docs updated where behaviour changed (`README.md`, `docs/**`, `CLAUDE.md`)
- [ ] `prisma migrate diff` is clean, or a new migration has been committed
- [ ] Accessibility considered (keyboard, contrast, labels, focus order)
- [ ] Telemetry / logs do not leak PII
