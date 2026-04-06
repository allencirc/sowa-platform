# Disaster Recovery Plan

Scope: the SOWA OWE Platform production environment (Vercel Paris + Neon Paris PostgreSQL). This document is the authoritative recovery-objectives reference for tender Appendix 1 and for any future operations handover.

---

## 1. Recovery Objectives

| Objective | Target | Notes |
|-----------|--------|-------|
| **RPO (Recovery Point Objective)** | **≤ 1 minute** | Neon ships Write-Ahead Log (WAL) continuously; point-in-time recovery granularity is sub-minute on paid tiers. |
| **RTO (Recovery Time Objective) — application** | **≤ 15 minutes** | Vercel redeploy of the last known good build. |
| **RTO — database full restore** | **≤ 60 minutes** | Neon branch-from-timestamp operation; typical restore time under 10 minutes for this dataset size. |
| **RTO — complete regional failover** | **≤ 4 hours** | Deploy to fallback region (`dub1` Dublin) and restore DB to Neon `aws-eu-central-1` (Frankfurt) branch. |
| **Maximum Tolerable Data Loss** | **1 minute of writes** | Aligned with RPO. |
| **Maximum Tolerable Outage** | **4 hours** | Aligned with regional failover RTO. |

---

## 2. Backup Strategy

### 2.1 Database (Neon PostgreSQL)

| Layer | Mechanism | Frequency | Retention |
|-------|-----------|-----------|-----------|
| Continuous WAL | Neon storage engine (built-in) | Streaming, continuous | **7 days** (point-in-time recovery window, paid tier) |
| Daily logical dump | Scheduled GitHub Action running `pg_dump` against Neon, encrypted and uploaded to a separate object store (AWS S3 Paris bucket with Object Lock, or Backblaze B2 EU) | **Daily at 02:00 UTC** | **30 days rolling + 12 monthly + 7 yearly** |
| Schema snapshot | Prisma migration files checked into git | Per migration | Permanent (git history) |
| Seed data | `prisma/seed.ts` checked into git | Per seed change | Permanent (git history) |

**Separation of control:** daily dumps live in a **different cloud provider account** from the primary Neon project. This defends against account compromise, accidental project deletion, and provider-level outages.

**Encryption:** backups are encrypted at rest (AES-256 via object store) and in transit (TLS 1.2+). The encryption key is stored in the tender owner's password manager, never in source control.

### 2.2 Application Code

Three independent copies of the source tree exist at all times, so that loss of any single provider — including the primary GitHub organisation — never blocks a rebuild:

| Layer | Mechanism | Frequency | Location |
|-------|-----------|-----------|----------|
| **Primary** | GitHub (private org `skillnet-owa`) | Continuous (every push) | GitHub |
| **Hot mirror** | Automatic push mirror to a secondary Git host (GitLab or Codeberg) configured via GitHub Actions `ad-m/github-push-action` on every push to `main` | Continuous (every push to `main`) | Separate provider, separate account |
| **Cold offline bundle** | Scheduled GitHub Action runs `git bundle create sowa-platform-$(date +%Y%m%d).bundle --all`, signs it (GPG), encrypts it (age), and uploads it to the **same S3 Paris Object-Lock bucket used for database dumps** | **Daily at 02:00 UTC**, co-located with the daily `pg_dump` | S3 Paris with Object Lock (immutable for 35 days) + quarterly copy burned to the tender owner's offline encrypted USB drive |

**Restore from cold bundle (works without any access to GitHub):**

```bash
# 1. Retrieve the latest bundle from the object store (separate account from Neon)
aws s3 cp s3://sowa-dr-paris/code/sowa-platform-latest.bundle.age ./

# 2. Decrypt and verify the GPG signature
age -d -i ~/.age/dr-key.txt sowa-platform-latest.bundle.age > sowa.bundle
gpg --verify sowa.bundle.sig sowa.bundle

# 3. Clone from the bundle (no network required after step 1)
git clone sowa.bundle sowa-platform
cd sowa-platform
git remote remove origin        # optional — bundle acts as origin

# 4. Proceed with the Dockerfile rebuild in §4.5 / §4.7
docker build -t sowa-platform:latest .
```

- Vercel retains every production build for rollback via "Promote to Production". This is **not** a code-recovery mechanism — Vercel artefacts are opaque blobs, not source — so the three copies above are what matter for rebuild-from-source.
- Node version, env var list, and build command documented in `docs/deployment-guide.md` so the application can be rebuilt from source on any compatible host within one hour.
- Decryption keys for the offline bundle live in the tender owner's password manager alongside the database-dump key — two people hold recovery copies at all times.

### 2.3 Uploaded Media

Production target: object storage (S3/R2/Vercel Blob) with **cross-region replication** enabled to a second EU region. Until migrated off local `public/uploads/`, the demo environment relies on the daily tarball step documented in `deployment-guide.md`.

### 2.4 Secrets

- NextAuth secret, database URLs, and API keys are stored in Vercel's encrypted environment variable store and mirrored in a password manager controlled by the platform owner.
- Rotation schedule: 12 months, or immediately on personnel change or suspected compromise.

---

## 3. Point-in-Time Recovery (PITR)

Neon's branching model allows recovery to any moment within the PITR window without overwriting production.

**Procedure:**

1. Identify the target recovery timestamp (e.g. from an incident report).
2. In the Neon console (or via CLI): `neon branch create --parent main --timestamp "2026-04-05T09:23:00Z" --name recovery-20260405`.
3. Neon provisions a new branch at that timestamp within ~30–90 seconds.
4. Validate: connect Prisma to the branch, run read-only queries against affected tables, confirm data state.
5. Promote: either repoint `DATABASE_URL` at the new branch (fastest), or `pg_dump` the branch and restore selected tables into main.
6. Update Vercel environment variable, trigger redeploy (~60 seconds).
7. Document the recovery in the incident log.

---

## 4. Failover Procedures

### 4.1 Scenario A — Application Error / Bad Deploy

**Detection:** Vercel deployment fails, 5xx spike in Vercel Analytics, synthetic check fails, or user report.

**Response:**
1. Vercel dashboard → **Deployments** → select last known good build → **Promote to Production**.
2. Verify the homepage, `/careers`, `/diagnostic/assessment` resolve with 200.
3. **Target time to restore: 5 minutes.**

### 4.2 Scenario B — Database Corruption or Accidental Delete

**Detection:** admin or user reports missing content; data integrity check fails.

**Response:**
1. **Stop writes:** toggle the platform into read-only mode by setting `READ_ONLY=true` in Vercel env vars and redeploying. Enforcement lives in `src/lib/read-only.ts` and `src/proxy.ts`; while the flag is on, every mutating request (`POST`/`PUT`/`PATCH`/`DELETE`) to `/api/*` or `/admin/*` returns **HTTP 503** with a JSON `read_only_mode` body, safe `GET`/`HEAD`/`OPTIONS` traffic continues to serve readers, the admin dashboard shows a "Read-only mode" banner, and server actions (e.g. admin password rotation) refuse directly as a defence-in-depth check. The NextAuth endpoints (`/api/auth/*`) and the `/admin/login` sign-in action are **deliberately exempt** so operators can still authenticate and drive the recovery playbook — NextAuth uses JWT sessions and therefore writes no data during sign-in. Coverage is asserted by `src/__tests__/lib/read-only.test.ts` and `src/__tests__/proxy.test.ts`.
2. Identify the timestamp just before the incident from Vercel logs / admin audit log.
3. Create a Neon branch at that timestamp (see §3).
4. Compare the branch against current state, identify affected rows.
5. Either repoint `DATABASE_URL` at the recovered branch **or** selectively restore rows via `pg_dump`/`psql`.
6. Turn `READ_ONLY` back off, redeploy. The banner and 503 responses clear automatically on the next request.
7. **Target time to restore: 30–60 minutes.**

### 4.3 Scenario C — Neon Regional Outage

**Detection:** Neon status page reports `aws-eu-west-3` incident; database connection errors across the board.

**Response:**
1. Wait up to 30 minutes for Neon to restore — most incidents resolve within that window and failover takes longer.
2. If the outage exceeds 30 minutes: restore the **most recent daily logical dump** into the pre-provisioned standby Neon project in `aws-eu-central-1` (Frankfurt).
3. Update `DATABASE_URL` in Vercel env vars, trigger redeploy.
4. Post user-facing banner: "The platform is running in read-recovery mode following a provider incident; some recent registrations may need to be re-submitted."
5. When the primary region recovers, replay the delta from Frankfurt back to Paris or declare Frankfurt the new primary.
6. **Target time to restore: up to 4 hours.** Expected data loss: up to 24 hours of writes (bounded by the last daily dump).

### 4.4 Scenario D — Vercel Regional Outage

**Detection:** Vercel status page reports `cdg1` incident; homepage unreachable.

**Response:**
1. Vercel automatically serves from adjacent edge regions for static assets. Dynamic routes will fail.
2. If `cdg1` remains down > 30 minutes: manually redeploy to the `dub1` (Dublin) region via Vercel project settings.
3. **Target time to restore: 1 hour.**

### 4.5 Scenario E — Complete Vercel Outage

**Detection:** all Vercel-hosted sites down.

**Response:**
1. Rebuild the Next.js application from source on a fallback host:
   - Scaleway Serverless Containers (Paris), **or**
   - A temporary Docker deployment using the repository-root `Dockerfile` (see `deployment-guide.md` §"Alternative: Docker Deployment") on Hetzner Cloud (Helsinki) or OVH (Gravelines).
2. Point DNS (`sowa.ie` A / CNAME record) at the fallback.
3. Ensure `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` are set on the fallback.
4. **Target time to restore: 4 hours.** Requires DNS TTL to have been kept at 300 seconds during normal operations.

### 4.6 Scenario F — Loss of Connectivity (end-user side)

Not a platform failure; the application is fully static-cacheable at Vercel's edge for anonymous reads, so brief connectivity blips do not affect users who have already loaded the page. No action required by the operator.

### 4.7 Scenario G — Loss of Server / VM (self-hosted fallback only)

Applies only if the platform has been migrated off Vercel to a self-hosted model. Response: rebuild from the repository-root `Dockerfile` (`docker build -t sowa-platform:latest .`) on a new VM, restore env vars from the password manager, run `docker run --rm -e DATABASE_URL=... sowa-platform:latest npx prisma migrate deploy`, restore the latest daily dump, then start the container. **Target: 4 hours.**

### 4.8 Scenario H — Loss of Source Control (GitHub outage or org lockout)

**Detection:** GitHub status page reports a platform-wide incident; or the `skillnet-owa` organisation is locked, suspended, or otherwise inaccessible; or `git clone` from GitHub fails from multiple networks.

**Why this is a distinct scenario:** Scenarios E and G both assume the operator can `git clone` the repo. If GitHub itself is the failing dependency, neither scenario can start. The three-copy strategy in §2.2 is what makes this scenario survivable.

**Response:**

1. **First preference — hot mirror.** Clone from the secondary Git host (GitLab or Codeberg). This should succeed unless both providers are down simultaneously.
   ```bash
   git clone git@gitlab.com:skillnet-owa/sowa-platform.git
   ```
2. **Second preference — cold offline bundle.** If both Git hosts are unreachable, retrieve the latest daily bundle from the S3 Paris DR bucket (separate cloud account from Neon, so not affected by a GitHub incident):
   ```bash
   aws s3 cp s3://sowa-dr-paris/code/sowa-platform-latest.bundle.age ./
   age -d -i ~/.age/dr-key.txt sowa-platform-latest.bundle.age > sowa.bundle
   gpg --verify sowa.bundle.sig sowa.bundle
   git clone sowa.bundle sowa-platform
   ```
3. **Last resort — offline USB.** If cloud object storage is also unreachable (extremely unlikely compound failure), the tender owner's quarterly encrypted USB copy is used. Data loss is bounded by 90 days of commits in this worst case, but the platform itself remains rebuildable.
4. Proceed with Scenario E (§4.5) or Scenario G (§4.7) using the restored working tree.
5. Once GitHub recovers (or a replacement org is created), push the restored tree to re-establish the primary. Re-enable the hot mirror and the daily bundle action.
6. **Target time to restore: 4 hours** (step 1 path), **5 hours** (step 2 path, accounting for decrypt + verify).

**Expected data loss:** zero (hot mirror path) to ≤ 24 hours of commits (cold bundle path), bounded by the daily bundle schedule. Merged commits are always present in at least one of the three copies.

---

## 5. Restore Drills

| Drill | Frequency | Success Criteria |
|-------|-----------|------------------|
| Point-in-time recovery of a single record | **Quarterly** | Record recovered within 15 minutes; no impact on production. |
| Full database restore from daily dump into a scratch Neon project | **Every 6 months** | Full dataset restored; Prisma `migrate status` clean; row counts match. |
| Application rollback on Vercel | **Quarterly** | Last-known-good build promoted within 5 minutes. |
| Regional failover tabletop exercise | **Annually** | Team can execute §4.3 and §4.5 from this document without live intervention. |
| Backup restore verification (automated) | **Weekly** | Automated CI job pulls the most recent daily dump, restores it into an ephemeral Neon branch, runs a row-count and schema diff, tears it down. Failure pages on-call. |
| Source-control cold-bundle restore | **Monthly** | Automated CI job (running outside the GitHub org, on the secondary provider) downloads the latest `.bundle.age`, decrypts, verifies the GPG signature, `git clone`s it, runs `npm ci && npm run build && docker build`, then tears the workspace down. Failure pages on-call. Proves Scenario H §4.8 step 2 is executable end-to-end. |
| Hot-mirror freshness check | **Daily** | Automated job compares `HEAD` on the GitLab/Codeberg mirror to `HEAD` on GitHub `main`. Drift of > 1 hour pages on-call. |

All drills are logged in a shared operations document (`ops/dr-drill-log.md`) with the date, operator, outcome, and any remediations.

---

## 6. Managed Service SLAs Referenced

| Service | SLA | Source |
|---------|-----|--------|
| Vercel Enterprise compute & CDN | 99.99% monthly uptime | https://vercel.com/legal/enterprise-sla |
| Neon Postgres (Scale / Business) | 99.95% monthly uptime | https://neon.tech/docs/introduction/support |
| AWS underlying infrastructure (for Vercel & Neon) | 99.99% for multi-AZ services | https://aws.amazon.com/legal/service-level-agreements/ |
| GitHub (primary source control) | 99.9% | https://github.com/pricing |
| GitLab / Codeberg (secondary source-control mirror) | 99.5% (best-effort; community/standard tier) | https://about.gitlab.com/pricing/ / https://docs.codeberg.org/ |
| S3 Paris (cold bundle + DB dump storage, Object Lock) | 99.9% availability, 99.999999999% durability | https://aws.amazon.com/s3/sla/ |
| Cloudflare DNS (recommended for `sowa.ie`) | 100% DNS uptime SLA | https://www.cloudflare.com/en-gb/business-sla/ |

The combined **application-layer SLA** for the Vercel + Neon stack, assuming independent failures, is ≥ 99.94% monthly availability, equating to a theoretical maximum of ~26 minutes of downtime per month.

---

## 7. Roles & Responsibilities

| Role | Responsibility | Current holder |
|------|---------------|----------------|
| Incident Commander | Declares an incident, owns recovery sequencing, signs off on resumption of service | Platform Lead (Skillnet) |
| Database Operator | Executes PITR, dump restores, schema fixes | Technical Delivery Partner |
| Communications Lead | User-facing status page, tender stakeholder updates | Skillnet Comms |
| Post-Incident Reviewer | Produces blameless post-incident report within 5 working days | Platform Lead |

---

## 8. Automation Prerequisites

The daily backup and weekly restore-drill workflows are committed to the
repository at `.github/workflows/backup.yml` and `.github/workflows/restore-drill.yml`.
They do not execute until the following GitHub Actions secrets and external
resources are provisioned. Until that is complete, the workflows remain in a
"configured, pending first production run" state.

### 8.1 Required GitHub Actions secrets

Configure under **Repository → Settings → Secrets and variables → Actions**:

| Secret | Used by | Description |
|--------|---------|-------------|
| `BACKUP_DATABASE_URL` | `backup.yml` | Read-only Postgres connection string for production Neon (separate role, `pg_dump`-only grants recommended). |
| `AGE_RECIPIENT_PUBLIC_KEY` | `backup.yml` | Public half of the age keypair. Dumps are encrypted to this recipient. |
| `AGE_IDENTITY_PRIVATE_KEY` | `restore-drill.yml` | Private half, used only by the drill workflow to decrypt the dump into an ephemeral branch. Stored **only** in GitHub Secrets and in the platform owner's password manager. |
| `BACKUP_AWS_ACCESS_KEY_ID` | both | IAM user credentials in a **separate AWS account** from any Vercel/Neon integrations, with access scoped to the backup bucket only. |
| `BACKUP_AWS_SECRET_ACCESS_KEY` | both | As above. |
| `BACKUP_AWS_REGION` | both | Region of the backup bucket (e.g. `eu-west-3` Paris). |
| `BACKUP_BUCKET` | both | S3 bucket name. Must have Object Lock (Governance or Compliance mode), Versioning, and lifecycle rules matching the 30-day rolling / 12 monthly / 7 yearly retention in §2.1. |
| `NEON_API_KEY` | `restore-drill.yml` | Neon API token scoped to branch create/delete on the project. |
| `NEON_PROJECT_ID` | `restore-drill.yml` | Project ID for the production Neon project. |
| `DATABASE_URL_READONLY` | `restore-drill.yml` | Read-only connection string against production, used for row-count comparison during the drill. |

### 8.2 One-time setup checklist

1. **Generate age keypair** (`age-keygen -o sowa-backup.key`). Store the private key file in the password manager; paste the `AGE-SECRET-KEY-...` line as `AGE_IDENTITY_PRIVATE_KEY`; paste the public `age1...` line as `AGE_RECIPIENT_PUBLIC_KEY`.
2. **Provision the S3 backup bucket** in the separate AWS account with Object Lock, Versioning, and the retention lifecycle rules from §2.1.
3. **Create the backup IAM user** with a policy limited to `s3:PutObject`, `s3:ListBucket`, and `s3:GetObject` against that one bucket.
4. **Create the Neon backup role** with `SELECT`-only grants on application schemas plus the system catalogue access `pg_dump` requires. Use its connection string as `BACKUP_DATABASE_URL`.
5. **Create the Neon read-only role** used for drill verification queries. Use its connection string as `DATABASE_URL_READONLY`.
6. **Issue the Neon API token** scoped to the production project with branch management permissions. This becomes `NEON_API_KEY`.
7. **Populate all GitHub Actions secrets** from steps 1–6.
8. **Manually trigger `backup.yml`** via *Actions → Daily Database Backup → Run workflow* and confirm an encrypted object lands in the bucket.
9. **Manually trigger `restore-drill.yml`** and confirm it creates, populates, verifies, and tears down the ephemeral Neon branch without errors.
10. **Record the first successful drill** in `ops/dr-drill-log.md`, replacing the "pending" placeholder row.

Steps 1–7 are prerequisites for automation; steps 8–10 mark the workflows as
live. Prior to step 10 completing, the cells in §5 marked "Automated" should
be read as "configured, pending first production run".

---

## 9. Pre-Go-Live Checklist (Handover)

**Delivery framing:** daily backup automation is **delivered** as part of this tender — the workflows, scripts, scoring logic, retention policy, and drill harness are all committed to the repository and reviewable today. The SLA is not "backups running in production from day one of evaluation"; it is **"daily backup automation delivered; activated on cutover by the operations team"**, because the secrets that arm the workflows can only be issued against the operations team's own cloud accounts after contract award.

This section makes the configured-vs-pending split explicit so the evaluator and the incoming operations team can see exactly what ships in the box and what must be provisioned at cutover.

### 9.1 Configured and delivered in the repository (no action required)

| Item | Where it lives | Status |
|------|----------------|--------|
| Daily backup workflow (encrypted `pg_dump` → Object-Locked S3) | `.github/workflows/backup.yml` | ✅ Committed |
| Weekly automated restore-drill workflow | `.github/workflows/restore-drill.yml` | ✅ Committed |
| Daily code bundle workflow (`git bundle` → S3 + GPG + age) | `.github/workflows/code-bundle.yml` | ✅ Committed |
| Hot-mirror push to secondary Git host | `.github/workflows/mirror.yml` | ✅ Committed |
| Read-only mode enforcement (kill-switch for Scenario B) | `src/lib/read-only.ts`, `src/proxy.ts` | ✅ Implemented + tested |
| Read-only mode test coverage | `src/__tests__/lib/read-only.test.ts`, `src/__tests__/proxy.test.ts` | ✅ Passing in CI |
| Dockerfile for rebuild-from-source (Scenarios E, G, H) | `/Dockerfile` | ✅ Committed |
| Recovery runbook (this document) | `docs/disaster-recovery.md` | ✅ Committed |
| Deployment runbook | `docs/deployment-guide.md` | ✅ Committed |
| Prisma migration history | `prisma/migrations/` | ✅ Committed (authoritative schema) |
| Seed data for scratch-restore verification | `prisma/seed.ts` | ✅ Committed |
| DR drill log template | `ops/dr-drill-log.md` | ✅ Committed with "pending first production run" placeholder rows |

### 9.2 Requires secrets / external provisioning at handover (operations team)

These items cannot be configured during the tender phase because they require credentials against the operations team's own cloud accounts. Each row maps to a step in §8.2.

| Item | Blocker | §8.2 step | Owner at cutover |
|------|---------|-----------|------------------|
| Age keypair for backup encryption | Must be generated and stored in the operations password manager | 1 | Database Operator |
| S3 Paris backup bucket with Object Lock + lifecycle rules | Requires AWS account in a separate tenancy from Neon/Vercel | 2 | Incident Commander |
| Backup IAM user (least-privilege, backup bucket only) | Depends on bucket provisioning (step 2) | 3 | Incident Commander |
| Neon `pg_dump`-only role (`BACKUP_DATABASE_URL`) | Requires production Neon project access | 4 | Database Operator |
| Neon read-only role (`DATABASE_URL_READONLY`) for drill verification | Requires production Neon project access | 5 | Database Operator |
| Neon API token scoped to branch management (`NEON_API_KEY`) | Requires production Neon project access | 6 | Database Operator |
| All GitHub Actions secrets populated from steps 1–6 | Depends on all of the above | 7 | Platform Lead |
| Secondary Git host account + push-mirror deploy key | Requires GitLab or Codeberg account under operations control | — (§2.2) | Platform Lead |
| Cloudflare DNS with 300s TTL on `sowa.ie` | Requires DNS delegation to operations | — (§4.5) | Platform Lead |
| Standby Neon project in `aws-eu-central-1` (Frankfurt) for Scenario C | Requires Neon account | — (§4.3) | Incident Commander |

### 9.3 Activation procedure (performed by operations team on cutover day)

1. Work through §8.2 steps 1–7 to provision secrets and external resources.
2. Manually trigger `backup.yml` (§8.2 step 8). Confirm an encrypted object lands in the backup bucket.
3. Manually trigger `restore-drill.yml` (§8.2 step 9). Confirm the ephemeral Neon branch is created, populated, verified, and torn down cleanly.
4. Manually trigger `code-bundle.yml`. Confirm the encrypted `.bundle.age` lands alongside the database dump.
5. Verify the hot mirror by pushing a no-op commit and checking that `HEAD` on the secondary Git host matches GitHub within 5 minutes.
6. Record the first successful run of each workflow in `ops/dr-drill-log.md`, replacing the "pending first production run" placeholder rows (§8.2 step 10).
7. Confirm on-call paging is wired to the weekly restore-drill and daily hot-mirror freshness checks (§5).
8. Sign off on the checklist in `ops/dr-drill-log.md`. From this point, the cells in §5 marked "Automated" are live rather than configured-pending.

**Exit criteria for go-live:** every row in §9.1 is ✅, every row in §9.2 is satisfied against the operations team's own cloud accounts, and steps 9.3.1–9.3.8 are complete and logged. Only then does the daily backup automation transition from "delivered" to "running in production".

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-04-05 | Initial DR document created for tender submission | Platform Lead |
| 2026-04-05 | Added §8 Automation Prerequisites documenting the setup checklist for `backup.yml` and `restore-drill.yml` | Platform Lead |
| 2026-04-05 | Added §9 Pre-Go-Live Checklist making configured-vs-pending split explicit for handover; reframed backup automation SLA as "delivered; activated on cutover by operations team" | Platform Lead |
