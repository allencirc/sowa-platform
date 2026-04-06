# Hosting, Security & Environmental Posture — One-Page Summary

_For tender Criterion F (Environmental Management, 5%) and Appendix 1 (Security)._

## Hosting Architecture

- **Application (compute & CDN):** Vercel, region `cdg1` — **Paris, France**.
- **Database:** Neon PostgreSQL, region `aws-eu-west-3` — **Paris, France**.
- **Source of truth:** GitHub (mirrored to a secondary Git host).
- **DNS:** Cloudflare (100% DNS uptime SLA).
- **Fallback region:** Vercel `dub1` (Dublin) + Neon `aws-eu-central-1` (Frankfurt), pre-provisioned.

**All user data is stored and processed within the European Union. No data leaves the EU at any point.**

## Environmental Management (Criterion F — 5%)

| Claim                                 | Evidence                                                                                                                                                                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 100% renewable-energy matched compute | AWS has been 100% renewable-matched since 2023 — seven years ahead of its 2030 commitment. Source: https://sustainability.aboutamazon.com/2023-aws-renewable-energy                                                                                 |
| Low-PUE data centre                   | AWS `eu-west-3` (Paris) operates at a reported trailing-twelve-month PUE of ~1.13. Source: https://sustainability.aboutamazon.com/products-services/the-cloud                                                                                       |
| Carbon-transparent provider           | Vercel publishes emissions and DPA methodology. Source: https://vercel.com/legal/dpa                                                                                                                                                                |
| Serverless-first design               | Functions spin down to zero when idle; no always-on VMs; eliminates idle-energy waste.                                                                                                                                                              |
| Edge caching                          | Static pages served from Vercel's edge network — most requests never hit origin compute.                                                                                                                                                            |
| Efficient bundle                      | Next.js 14 App Router with React Server Components minimises JavaScript shipped to browsers, reducing client-side energy consumption.                                                                                                               |
| Named alternatives                    | If Vercel is not acceptable: **Scaleway Paris** (100% renewable, adiabatic cooling, https://www.scaleway.com/en/environmental-leadership/) or **OVHcloud Gravelines** (water-cooled, PUE ~1.09, https://corporate.ovhcloud.com/en/sustainability/). |

## Disaster Recovery (Appendix 1)

| Metric                                    | Target                                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **RPO** (max data loss)                   | ≤ 1 minute (Neon continuous WAL)                                                                                                             |
| **RTO** — application rollback            | ≤ 15 minutes (Vercel promote-to-production)                                                                                                  |
| **RTO** — database point-in-time recovery | ≤ 60 minutes (Neon branch-from-timestamp)                                                                                                    |
| **RTO** — full regional failover          | ≤ 4 hours (pre-provisioned Frankfurt standby)                                                                                                |
| **Database backups**                      | Continuous WAL (7-day PITR) + daily encrypted `pg_dump` to a separate cloud account (30-day rolling, 12 monthly, 7 yearly)                   |
| **Restore drill cadence**                 | Quarterly PITR drill, 6-monthly full-dump restore, annual regional failover tabletop, **weekly automated backup-restore verification in CI** |
| **SLAs referenced**                       | Vercel Enterprise 99.99%; Neon Business 99.95%; combined ≥ 99.94% (~26 min/month max downtime)                                               |

Full procedures for application error, database corruption, regional outage (Neon or Vercel), complete provider outage, server loss, and connectivity loss are documented in `docs/disaster-recovery.md`.

## Security Controls (Appendix 1)

**OWASP Top 10 (2021) — all ten categories have named controls in place:**

| #                             | Category                                                                                | Primary control |
| ----------------------------- | --------------------------------------------------------------------------------------- | --------------- |
| A01 Broken Access Control     | Role-based middleware on every admin route (`requireAuth` / `requireRole`)              |
| A02 Cryptographic Failures    | bcryptjs password hashing, JWT with env-sourced secret, HSTS preload                    |
| A03 Injection                 | Prisma parameterised queries, React auto-escaping, Zod validation at every API boundary |
| A04 Insecure Design           | Deny-by-default admin routes, least-privilege RBAC, rate-limited mutations              |
| A05 Security Misconfiguration | Security headers in `next.config.ts`, production-only Secure/HttpOnly cookies           |
| A06 Vulnerable Components     | `npm audit` in CI, Dependabot weekly, OSV scanner nightly                               |
| A07 Authentication Failures   | NextAuth v5, HTTP-only JWT cookies, 8-character minimum, rate-limited login             |
| A08 Data Integrity            | Lockfile-based builds, immutable Vercel deployments, git-tracked migrations             |
| A09 Logging & Monitoring      | Vercel logs + in-DB `ContentVersion` audit trail + failed-auth logging                  |
| A10 SSRF                      | No user-supplied server-side fetches; remote hosts whitelisted                          |

**Security headers shipped in `next.config.ts` (verified by `e2e/security-headers.spec.ts`):** Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, Strict-Transport-Security (2 years, includeSubDomains, preload), X-DNS-Prefetch-Control.

**Patch management:** Critical CVEs patched within 24 hours, high within 72 hours, dependencies refreshed weekly via Dependabot.

**Dependency scanning:** `npm audit` + Dependabot + Google OSV scanner, all three running in CI.

**Secrets:** stored in Vercel's encrypted env var store, mirrored in the platform owner's password manager, 12-month rotation cadence, never committed to source control.

**Audit logging:** authentication events, authorisation failures, content mutations (permanent via `ContentVersion`), registrations with GDPR consent timestamps, and rate-limit hits are all logged.

**Responsible disclosure:** `SECURITY.md` at the repo root publishes a coordinated-disclosure policy with 24-hour / 72-hour / 30-day fix targets by severity, and a safe-harbour clause for good-faith researchers.

## Reference Documents in the Repository

- `docs/deployment-guide.md` — hosting architecture, EU region choice, green-host sources, environment variables, deploy procedure.
- `docs/disaster-recovery.md` — full DR plan (RPO/RTO, backups, PITR, failover scenarios A–G, drill cadence, SLAs).
- `docs/security.md` — full security documentation (auth, OWASP matrix, patch management, dependency scanning, secrets, audit logging, headers, pen test scope).
- `SECURITY.md` — responsible disclosure policy.
- `next.config.ts` — security headers source of truth.
- `e2e/security-headers.spec.ts` — automated CI verification that headers are present.
