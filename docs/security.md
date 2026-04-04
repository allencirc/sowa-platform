# Security Documentation

---

## Authentication and Authorisation

### Authentication Model

The platform uses **NextAuth.js v5** with a **credentials provider** (email + password) and **JWT session strategy**.

| Component | Implementation |
|-----------|---------------|
| Provider | Credentials (email/password) |
| Password hashing | bcryptjs (salt rounds: default 10) |
| Session strategy | JWT (stateless, no server-side session store) |
| Token storage | HTTP-only cookie (`next-auth.session-token`) |
| Token contents | User ID, email, name, role |
| Session lifetime | Configurable via NextAuth options (default: 30 days) |
| Sign-in page | `/admin/login` |

### Authorisation Model

Role-based access control (RBAC) with three tiers:

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access: CRUD all content, publish/archive, manage users, export data, all status transitions |
| **EDITOR** | Create and edit content, submit for review (DRAFT → IN_REVIEW), view registrations |
| **VIEWER** | Read-only access to admin interface and registrations |

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

| Setting | Value |
|---------|-------|
| Default limit | 60 requests per 60 seconds |
| Scope | Per client IP (via `x-forwarded-for` or `x-real-ip` headers) |
| Response on limit | `429 Too Many Requests` with `Retry-After` header |
| Storage | In-memory Map (adequate for single-instance) |

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
- Default admin password (`changeme123`) must be changed on first login

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

## Security Headers

### Recommended Headers

Configure these in `next.config.ts` or via your hosting provider:

```javascript
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com; font-src 'self' https://fonts.gstatic.com;"
  },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
]
```

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
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

---

## Threat Model and Countermeasures

| Threat | Countermeasure | Status |
|--------|---------------|--------|
| SQL injection | Prisma ORM parameterised queries | Implemented |
| XSS | React auto-escaping, no raw HTML injection | Implemented |
| CSRF | NextAuth double-submit cookie | Implemented |
| Brute force login | Rate limiting on all endpoints | Implemented |
| Path traversal | `path.basename()` on file operations | Implemented |
| Privilege escalation | Role-based middleware on every API route | Implemented |
| Data exposure | Passwords never returned in API responses | Implemented |
| Denial of service | Rate limiting (60 req/min per IP) | Implemented |
| Insecure file upload | Type whitelist, size limit, filename sanitisation | Implemented |
| Session hijacking | HTTP-only cookies, JWT, HTTPS in production | Implemented |
| Unvalidated input | Zod schemas on all API inputs | Implemented |

### Known Limitations (Address Before Production)

| Item | Risk | Recommendation |
|------|------|----------------|
| In-memory rate limiting | Resets on restart, not shared across instances | Migrate to Redis |
| Local file storage | Not scalable, no CDN, lost on redeploy | Migrate to S3/R2/Vercel Blob |
| Default admin password | Known credential in seed data | Force password change on first login |
| No account lockout | Unlimited login attempts (rate-limited only) | Add account lockout after N failures |
| No audit log for auth events | Login/logout not tracked | Add auth event logging |
| No Content Security Policy | Not configured by default | Add CSP headers per recommendations above |
| No HTTPS enforcement in code | Relies on hosting provider | Add HSTS header, verify redirect configuration |
| JWT secret management | Single secret in env var | Consider key rotation strategy |

---

## Penetration Test Preparation

### Scope

| In Scope | Out of Scope |
|----------|-------------|
| All `/api/*` endpoints | Third-party services (Vercel, PostgreSQL provider) |
| Admin interface (`/admin/*`) | DNS and domain infrastructure |
| Public-facing pages | Physical security |
| Authentication and session management | Social engineering |
| File upload functionality | |
| Database access layer | |

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
