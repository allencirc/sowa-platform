---
name: Monthly maintenance review
about: Recurring monthly health check for the SOWA OWE Platform
title: "chore: monthly maintenance review — YYYY-MM"
labels: ["maintenance", "recurring"]
assignees: ["ronanwalsh", "allenwixted"]
---

> Open on the first working day of each month. Close once every
> section is either ticked or has a linked follow-up issue.
> Referenced by `SOWA_Tender_Draft_and_Checklist.md` and
> `Tender_Section_Repository_Management.md`.

## 1. Dependencies & supply chain

- [ ] Review the open Dependabot PRs; merge or triage each one
- [ ] `npm outdated` — record any majors that were deferred and why
- [ ] `npm audit --omit=dev` — zero high/critical, or tracked with owner + ETA
- [ ] CodeQL alerts triaged (0 open High/Critical)
- [ ] Secret scanning alerts triaged (0 open)

## 2. CI / quality gates

- [ ] CI green on `main` for the last 30 days (note any flakes)
- [ ] Coverage ≥ target (unit + e2e); link to latest report
- [ ] Lighthouse / Web Vitals checked on preview; record regressions
- [ ] Playwright + axe a11y run clean on homepage, `/careers`, `/training`,
      `/diagnostic`, `/admin/signin`

## 3. Data & backups

- [ ] Confirm daily Neon backup workflow ran on every day of the month
- [ ] Monthly restore drill executed (`.github/workflows/restore-drill.yml`);
      link the run
- [ ] Prisma migration history matches production
- [ ] RPO/RTO still within the targets documented in
      `docs/disaster-recovery.md`

## 4. Security posture

- [ ] Review admin user list and last-sign-in dates; deactivate dormant accounts
- [ ] Rotate any credentials past their rotation window
- [ ] Review audit log for anomalies
- [ ] Confirm HTTPS / HSTS / CSP headers still live (`curl -I` the homepage)
- [ ] Review `SECURITY.md` contact and SLAs — still accurate?

## 5. Observability

- [ ] Sentry — triage open issues, close stale, tag releases
- [ ] Better Stack uptime — confirm all monitors green, record any incidents
- [ ] Vercel Analytics / Speed Insights — record Core Web Vitals trend

## 6. Documentation & tender artefacts

- [ ] `README.md`, `CHANGELOG.md`, `docs/**` reflect reality
- [ ] `SOWA_Tender_Draft_and_Checklist.md` still accurate — any updates needed?
- [ ] Architecture or runbook changes captured in an ADR under `docs/adr/`

## 7. Follow-ups

<!-- Create separate issues for any item that can't be closed out this
     month and link them here. Do not let this review become a dumping
     ground. -->

---

**Reviewed by:**
**Date:**
