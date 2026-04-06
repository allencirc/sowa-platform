# SOWA Platform — Backlog

## Pending

### Enterprise Support landing page
**Source:** reference-parity.md:22 — Enterprise Support audience card has no destination page; currently links to `/diagnostic` as a workaround.

**Proposed:** Lightweight static `/enterprise` page at `src/app/(frontend)/enterprise/page.tsx`.
- Hero: "Workforce planning for offshore wind employers"
- 3 value props: skills gap analysis, tailored training cohorts, talent pipeline
- Reuse existing queries: featured Skillnet-funded courses via `getCourses()`, latest research via `getResearch()`
- CTA: newsletter signup + `mailto:` contact
- No new Prisma models or seed changes required

**Then:** update `src/components/home/AudienceCards.tsx` href from `/diagnostic` → `/enterprise`.
