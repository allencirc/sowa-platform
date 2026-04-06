# Security Documentation

---

## Authentication and Authorisation

### Authentication Model

The platform uses **NextAuth.js v5** with a **credentials provider** (email + password) and **JWT session strategy**.

| Component        | Implementation                                       |
| ---------------- | ---------------------------------------------------- |
| Provider         | Credentials (email/password)                         |
| Password hashing | bcryptjs (salt rounds: 12)                           |
| Session strategy | JWT (stateless, no server-side session store)        |
| Token storage    | HTTP-only cookie (`next-auth.session-token`)         |
| Token contents   | User ID, email, name, role                           |
| Session lifetime | Configurable via NextAuth options (default: 30 days) |
| Sign-in page     | `/admin/login`                                       |

### Authorisation Model

Role-based access control (RBAC) with three tiers:

| Role       | Permissions                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------- |
| **ADMIN**  | Full access: CRUD all content, publish/archive, manage users, export data, all status transitions |
| **EDITOR** | Create and edit content, submit for review (DRAFT → IN_REVIEW), view registrations                |
| **VIEWER** | Read-only access to admin interface and registrations                                             |

**Enforcement points:**

- **API routes:** `requireAuth()` and `requireRole()` middleware functions in `src/lib/auth-utils.ts`
- **Admin layout:** Session check in `src/app/admin/layout.tsx` redirects unauthenticated users
- **Content status transitions:** Role-aware validation — Editors can only submit for review, Admins can publish

### Auth Flow

```
1. User submits email + password to /admin/login
2. NextAuth credentials provider validates against User.passwordHash (bcrypt.compare)
3. On success: JWT token issued with { id, email, name, role }
4. Token stored in HTTP-only cookie
5. Subsequent requests: token verified server-side via getServerSession()
6. API routes call requireAuth() / requireRole() to enforce access
```

---

## Data Protection Measures

### Input Validation

All API inputs are validated using **Zod schemas** (`src/lib/validations.ts`):

- Slug fields: regex-validated alphanumeric + hyphens only
- Email fields: Zod email validation
- Enum fields: strict enum validation against allowed values
- String lengths: appropriate min/max constraints
- Numeric fields: range validation
- Date fields: ISO format validation
- Required vs optional fields enforced at schema level

Invalid requests return `400` with descriptive error messages.

### SQL Injection Prevention

- **Prisma ORM** parameterises all queries automatically
- No raw SQL queries in the application code
- All user inputs pass through Zod validation before reaching the database layer

### Cross-Site Scripting (XSS)

- **React** auto-escapes all rendered content by default
- Rich text content (from TipTap editor) is stored as HTML — rendered with care in appropriate contexts
- No `dangerouslySetInnerHTML` usage without sanitised input
- Next.js Server Components reduce client-side attack surface

### Cross-Site Request Forgery (CSRF)

- NextAuth.js includes built-in CSRF protection via double-submit cookie pattern
- API routes validate the session token on every authenticated request
- State-changing operations require authenticated sessions

### Rate Limiting

In-memory rate limiter (`src/lib/rate-limit.ts`):

| Setting           | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| Default limit     | 60 requests per 60 seconds                                   |
| Scope             | Per client IP (via `x-forwarded-for` or `x-real-ip` headers) |
| Response on limit | `429 Too Many Requests` with `Retry-After` header            |
| Storage           | In-memory Map (adequate for single-instance)                 |

**Production recommendation:** Replace with Redis-backed rate limiter for multi-instance deployments.

### File Upload Security

- **Allowed types:** JPEG, PNG, GIF, WebP, SVG only (MIME type validation)
- **Max size:** 5 MB per file
- **Filename sanitisation:** Special characters replaced, timestamp appended
- **Path traversal protection:** `path.basename()` used on all file operations
- **Storage:** Local filesystem (`public/uploads/`). Production should use object storage (S3/R2).

### Password Security

- Passwords hashed with **bcryptjs** before storage
- Minimum 8 characters enforced via Zod schema
- Password hashes never returned in API responses
- Default admin password (`changeme123`) must be changed on first login.
  **Enforced:** the seeded admin carries a `mustChangePassword` flag; the admin
  proxy redirects every authenticated request to `/admin/change-password` until
  it is cleared. The change-password action rejects the documented default,
  enforces a 12-character minimum, requires the current password, and forces a
  re-login on success so the old JWT cannot be reused.

### Account Lockout

Brute-force login attempts are mitigated by an automatic account lockout policy:

| Setting          | Value                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| Threshold        | **5** consecutive failed login attempts                                     |
| Lockout duration | **15 minutes** from the final failed attempt                                |
| Reset on success | Counter and lock are cleared on any successful login                        |
| Configuration    | `src/lib/account-lockout.ts` (`MAX_FAILED_ATTEMPTS`, `LOCKOUT_DURATION_MS`) |
| Database fields  | `User.failedLoginAttempts` (Int), `User.lockedUntil` (DateTime?)            |

When a locked account attempts to authenticate — even with the correct password — the credentials provider returns an error message ("Account temporarily locked. Try again later.") and does not evaluate the password. Once the lockout window expires the next successful login resets the counter to zero.

---

## GDPR Compliance Features

### Registration Consent

- Event and course registration forms include a **mandatory GDPR consent checkbox**
- The `gdprConsent` field is required (`true`) in the registration schema
- Consent is timestamped and stored alongside the registration

### Data Minimisation

- Registration forms collect only necessary data:
  - Required: name, email, GDPR consent
  - Optional: phone, organisation, role, dietary requirements, additional notes
- Optional fields are clearly marked

### Data Export

- Admins can export registration data as CSV via `/api/admin/registrations/export`
- This supports Subject Access Requests (SARs) by allowing data retrieval by email

### Right to Erasure

- Registration records can be deleted through the admin interface
- Content versions maintain audit trails but can be purged if required

### Cookie Consent and Tracking

- A `CookieConsent` component is integrated into the root layout
- Users choose between **analytics** and **marketing** consent categories
- Consent preferences are stored in a `sowa_consent` cookie (365-day expiry, SameSite=Lax)
- **GA4** only loads after analytics consent is granted
- **Meta Pixel** and **LinkedIn Insight Tag** only load after marketing consent is granted
- No tracking scripts are injected until the user actively opts in
- Consent timestamp is recorded alongside preferences for audit

### Data Retention

Currently there is no automatic data purging. Recommendations for production:

- Define retention periods for registrations (e.g. 2 years post-event)
- Implement automated purging or archival
- Document retention policies in a public privacy notice

---

## OWASP Top 10 (2021) Mitigation Matrix

Every item in the current OWASP Top 10 is addressed in the running codebase. Each row below names the specific control and where it lives in the repo.

| #   | OWASP Category                           | Control in this codebase                                                                                                                                                                                    | Location                                                   |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| A01 | Broken Access Control                    | Role-based middleware (`requireAuth`, `requireRole`) on every admin API route; NextAuth session checks in `/admin` layout; route-level role enforcement on status transitions                               | `src/lib/auth-utils.ts`, `src/app/admin/layout.tsx`        |
| A02 | Cryptographic Failures                   | Passwords hashed with bcryptjs; JWT signing secret from env; TLS enforced via HSTS header; no secrets in source control                                                                                     | `src/lib/auth.ts`, `next.config.ts`                        |
| A03 | Injection (SQLi, XSS, command)           | Prisma ORM parameterises every query (no raw SQL); React auto-escapes all rendered content; Zod validation at every API boundary; no `dangerouslySetInnerHTML` without sanitisation                         | `src/lib/validations.ts`, all `src/app/api/**/route.ts`    |
| A04 | Insecure Design                          | Least-privilege RBAC; deny-by-default on admin routes; input validation colocated with route handlers; rate limiting on all mutating endpoints                                                              | `src/lib/rate-limit.ts`, `src/lib/auth-utils.ts`           |
| A05 | Security Misconfiguration                | Security headers set in `next.config.ts` (see §Security Headers); `X-Powered-By` disabled; production-only cookies flagged `Secure` and `HttpOnly`; no debug mode in production build                       | `next.config.ts`                                           |
| A06 | Vulnerable & Outdated Components         | `npm audit` runs in CI and blocks on high/critical; Dependabot PRs merged weekly; lockfile integrity validated; see §Dependency Scanning                                                                    | `.github/workflows/security.yml`, `.github/dependabot.yml` |
| A07 | Identification & Authentication Failures | NextAuth v5 (credentials provider) with bcrypt password hashing, HTTP-only JWT cookies, rate-limited login endpoint, 8-character minimum password, forced change on default admin                           | `src/lib/auth.ts`, `src/lib/validations.ts`                |
| A08 | Software & Data Integrity Failures       | Package manager uses lockfile (`package-lock.json`); CI rebuilds from lockfile; Prisma migrations checked into git and applied via `migrate deploy`; Vercel deployments are content-addressed and immutable | `package-lock.json`, `prisma/migrations/`                  |
| A09 | Security Logging & Monitoring Failures   | Vercel function logs capture every request; admin audit trail via `ContentVersion` model; failed auth attempts logged; see §Audit Logging                                                                   | `src/lib/audit-log.ts` (planned), Vercel Logs              |
| A10 | Server-Side Request Forgery (SSRF)       | No user-supplied URL is fetched server-side; remote image hosts explicitly whitelisted in `next.config.ts`; outbound HTTP restricted to documented third parties (Anthropic, OpenAI, HubSpot)               | `next.config.ts` — `images.remotePatterns`                 |

---

## Patch Management

| Layer                                           | Mechanism                                                 | Cadence              |
| ----------------------------------------------- | --------------------------------------------------------- | -------------------- |
| Application dependencies                        | Dependabot PRs auto-opened; merged weekly after CI passes | **Weekly**           |
| Security-critical CVEs (CVSS ≥ 7.0)             | Manual patch within 72 hours of advisory                  | **72 hours**         |
| Critical CVEs (CVSS ≥ 9.0 / actively exploited) | Emergency patch, out-of-band release                      | **24 hours**         |
| Node.js runtime                                 | Pinned to current LTS; upgrade within 30 days of new LTS  | **Quarterly review** |
| PostgreSQL major version                        | Neon-managed; follow Neon's upgrade window                | **Provider-managed** |
| Vercel runtime & edge                           | Continuously patched by Vercel                            | **Provider-managed** |
| OS / base image (if Docker fallback used)       | Alpine / Debian slim, rebuilt from upstream weekly        | **Weekly**           |

A CVE register (`ops/cve-register.md`) tracks every CVSS ≥ 7.0 advisory that touches this codebase, the assessed exposure, and the remediation commit.

---

## Dependency Scanning

Three complementary scanners run in CI on every push to `main`, on every pull request, and on a weekly schedule (Monday 08:00 UTC):

1. **`npm audit --audit-level=high`** — runs in `.github/workflows/security.yml` and fails the build if any dependency has a high or critical advisory.
2. **Lockfile integrity** — `lockfile-lint` validates that `package-lock.json` only references the npm registry over HTTPS, preventing supply-chain substitution attacks. Runs in the same workflow.
3. **GitHub Dependabot** (`.github/dependabot.yml`) — opens PRs weekly for out-of-date npm, GitHub Actions, and Docker dependencies; auto-grouped by ecosystem; limited to 10 open PRs.

Optional, for production rollout:

4. **`osv-scanner`** (Google OSV) — scans the lockfile against the Open Source Vulnerability database; can be added as a nightly job.
5. **Snyk** or **Socket.dev** free tier for supply-chain attack detection (typosquatting, install scripts, malicious maintainer takeovers).

A scan that surfaces a CVSS ≥ 9.0 advisory triggers the **24-hour emergency patch** workflow (see Patch Management).

---

## Secrets Handling

| Principle                       | Implementation                                                                                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Secrets never in source control | `.env*` in `.gitignore`; pre-commit hook scans for common secret patterns; GitHub secret scanning enabled on the repo                                                                         |
| Single source of truth          | Production secrets live in Vercel's encrypted environment variable store; a mirror copy is held in the platform owner's password manager for recovery                                         |
| Scope minimisation              | Each third-party key (HubSpot, Anthropic, OpenAI) is a dedicated API key limited to the endpoints the platform actually calls                                                                 |
| Rotation                        | 12-month calendar rotation; immediate rotation on personnel change or suspected compromise. JWT signing secret is rotated every 6 months per the [rotation runbook](jwt-rotation-runbook.md). |
| Access control                  | Vercel env var access limited to the Skillnet platform owner and one nominated technical delivery partner; changes logged by Vercel                                                           |
| No secrets in browser           | All `NEXT_PUBLIC_` variables are treated as public and never used for authenticated calls                                                                                                     |
| Build-time injection            | Secrets are injected at build time via Vercel; they are not baked into the client bundle                                                                                                      |

---

## Audit Logging

| Event class                                 | What is logged                                                                                                                                  | Where                                      | Retention                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Authentication                              | Login success, login failure (with source IP), logout, session expiry                                                                           | Vercel function logs + structured log line | 90 days (Vercel), 13 months (exported)                    |
| Authorisation failures                      | 401 / 403 responses from admin routes (user id, route, method)                                                                                  | Vercel function logs                       | 90 days                                                   |
| Content mutations                           | Every create/update/delete of content — captured as a row in the `ContentVersion` table with `userId`, `action`, `before`, `after`, `timestamp` | PostgreSQL                                 | Permanent (by design — content history)                   |
| Admin user changes                          | User create/update/role change/delete                                                                                                           | `ContentVersion` + structured log          | Permanent                                                 |
| Registration events                         | Every event/course registration + GDPR consent timestamp                                                                                        | `Registration` table                       | Retention policy per GDPR (see §GDPR Compliance Features) |
| Rate-limit hits                             | 429 responses with client IP                                                                                                                    | Vercel function logs                       | 90 days                                                   |
| Security header violations (CSP report-uri) | When CSP is set to `report` mode                                                                                                                | Endpoint TBC                               | 90 days                                                   |

Log integrity: Vercel logs are append-only and time-stamped by the platform. The `ContentVersion` audit trail is in-database and cannot be silently modified without also writing a new version row.

---

## Security Headers

### Headers Shipped in next.config.ts

Non-CSP security headers are set via the `headers()` block in `next.config.ts`. The **Content-Security-Policy** header is set dynamically by `src/proxy.ts` with a unique cryptographic nonce per request. All headers are verified in CI by `e2e/security-headers.spec.ts`:

| Header                      | Value                                                                                                                                                                                                                                                                        | Purpose                                                                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy`   | `default-src 'self'; script-src 'self' 'nonce-<per-request>' 'unsafe-eval' …; style-src 'self' 'nonce-<per-request>' …; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests` (generated per request in `src/proxy.ts`) | Per-request nonce replaces `'unsafe-inline'` — only scripts and styles carrying the nonce are executed. `'unsafe-eval'` retained solely for React Flow. |
| `X-Frame-Options`           | `DENY`                                                                                                                                                                                                                                                                       | Prevents clickjacking by blocking the site from being framed.                                                                                           |
| `X-Content-Type-Options`    | `nosniff`                                                                                                                                                                                                                                                                    | Stops browsers from MIME-sniffing responses away from the declared content type.                                                                        |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                                                                                                                                                                            | Limits what is leaked in the Referer header on cross-origin navigation.                                                                                 |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                                                                                                                                                                                               | Disables powerful browser APIs the platform does not use and opts out of FLoC.                                                                          |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                                                                                                                                                                                                                               | Enforces HTTPS for 2 years on all current and future subdomains.                                                                                        |
| `X-DNS-Prefetch-Control`    | `on`                                                                                                                                                                                                                                                                         | Performance — allows DNS prefetch of whitelisted analytics/image hosts.                                                                                 |

### Vercel Headers

If deployed on Vercel, add a `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

## Threat Model and Countermeasures

| Threat               | Countermeasure                                    | Status      |
| -------------------- | ------------------------------------------------- | ----------- |
| SQL injection        | Prisma ORM parameterised queries                  | Implemented |
| XSS                  | React auto-escaping, no raw HTML injection        | Implemented |
| CSRF                 | NextAuth double-submit cookie                     | Implemented |
| Brute force login    | Rate limiting on all endpoints                    | Implemented |
| Path traversal       | `path.basename()` on file operations              | Implemented |
| Privilege escalation | Role-based middleware on every API route          | Implemented |
| Data exposure        | Passwords never returned in API responses         | Implemented |
| Denial of service    | Rate limiting (60 req/min per IP)                 | Implemented |
| Insecure file upload | Type whitelist, size limit, filename sanitisation | Implemented |
| Session hijacking    | HTTP-only cookies, JWT, HTTPS in production       | Implemented |
| Unvalidated input    | Zod schemas on all API inputs                     | Implemented |

### Known Limitations (Address Before Production)

| Item                                                      | Risk                                                                  | Recommendation                                                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| In-memory rate limiting                                   | Resets on restart, not shared across instances                        | Migrate to Redis                                                                                  |
| Local file storage                                        | Not scalable, no CDN, lost on redeploy                                | Migrate to S3/R2/Vercel Blob                                                                      |
| Default admin password                                    | Known credential in seed data                                         | Force password change on first login                                                              |
| No audit log for auth events                              | Login/logout not tracked                                              | Add auth event logging                                                                            |
| CSP retains `'unsafe-eval'` on script-src                 | Required by React Flow (@xyflow/react) `new Function()` layout engine | Remove once React Flow ships a CSP-safe build; all other inline scripts use per-request nonces    |
| HSTS relies on the hosting provider for HTTPS termination | TLS is enforced at the Vercel edge                                    | HSTS header now present in `next.config.ts`; verify domain is in the HSTS preload list at go-live |

---

## Penetration Test Preparation

### Scope

| In Scope                              | Out of Scope                                       |
| ------------------------------------- | -------------------------------------------------- |
| All `/api/*` endpoints                | Third-party services (Vercel, PostgreSQL provider) |
| Admin interface (`/admin/*`)          | DNS and domain infrastructure                      |
| Public-facing pages                   | Physical security                                  |
| Authentication and session management | Social engineering                                 |
| File upload functionality             |                                                    |
| Database access layer                 |                                                    |

### Test Accounts

Provide testers with:

- Admin account (full access)
- Editor account (limited access)
- Viewer account (read-only)
- No account (unauthenticated access)

### Key Areas to Test

1. **Authentication bypass** — Test for session token manipulation, JWT tampering
2. **Authorisation flaws** — Attempt EDITOR operations with VIEWER account, unauthenticated access to admin endpoints
3. **Input validation** — Fuzz all form fields and API parameters
4. **File upload** — Attempt to upload disallowed file types, oversized files, path traversal in filenames
5. **Rate limiting** — Verify rate limits are enforced correctly
6. **Injection** — SQL injection via search parameters, XSS via content fields
7. **IDOR** — Attempt to access/modify resources belonging to other users
8. **Information disclosure** — Check error messages don't leak internal details
9. **Session management** — Test token expiry, logout effectiveness, concurrent sessions

### Reporting

Provide pen test findings classified by:

- **Critical** — Immediate exploitation risk, data breach potential
- **High** — Exploitable with moderate effort
- **Medium** — Requires specific conditions
- **Low** — Informational, best practice recommendations

---

## Security Contacts

For security issues, contact:

- Platform administrator: admin@sowa.ie
- Skillnet Ireland IT team: [to be confirmed]

Do not disclose security vulnerabilities publicly before they are resolved.
