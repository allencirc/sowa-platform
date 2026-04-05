# Security Policy

The Skillnet Offshore Wind Academy (SOWA) OWE Platform takes the security of user data and the integrity of the service seriously. This document describes how to report a vulnerability and what you can expect in return.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security reports.**

Send vulnerability reports to: **security@sowa.ie**

If PGP is preferred, request the current public key in your initial email and we will reply with the fingerprint before any sensitive detail is exchanged.

Please include:

- A clear description of the issue and its impact.
- Steps to reproduce, a proof of concept, or a minimal failing request.
- The affected URL(s), endpoint(s), or commit hash.
- Your name or handle for acknowledgement (optional).

## Response Commitments

| Stage | Target |
|-------|--------|
| Acknowledgement of receipt | **Within 2 working days** |
| Initial triage and severity assessment | **Within 5 working days** |
| Status update cadence during investigation | **Weekly** |
| Fix target — Critical (CVSS ≥ 9.0) | **24 hours** |
| Fix target — High (CVSS 7.0–8.9) | **72 hours** |
| Fix target — Medium (CVSS 4.0–6.9) | **30 days** |
| Fix target — Low (CVSS < 4.0) | **Next scheduled release** |
| Public disclosure | Coordinated with the reporter, **no earlier than 30 days** after a fix is deployed, unless the reporter requests otherwise |

## Safe Harbour

We will not pursue or support legal action against researchers who:

- Make a good-faith effort to avoid privacy violations, data destruction, or service disruption.
- Only interact with accounts they own or have explicit permission to access.
- Do not exploit a vulnerability beyond what is necessary to confirm it.
- Do not disclose the issue publicly before it is resolved.
- Give us reasonable time to remediate before any public disclosure.

## Scope

**In scope**

- The production web application at `https://sowa.ie` (and any staging hosts explicitly listed on this page at the time of testing).
- All `/api/*` endpoints.
- The admin interface at `/admin/*`.
- Authentication, session handling, and access control.
- File upload functionality.
- Any code in this repository.

**Out of scope**

- Third-party services operated by Vercel, Neon, HubSpot, Anthropic, or OpenAI (report these to their respective security teams).
- DNS infrastructure and domain registrar accounts.
- Social engineering against staff, users, or third parties.
- Physical attacks against data centres or offices.
- Denial-of-service, volumetric, or rate-limit stress testing.
- Automated scanner output without a demonstrated, reproducible finding.
- Missing best-practice headers that are already documented as accepted trade-offs in `docs/security.md`.

## Related Documentation

For the full picture of how the platform protects user data, see:

- `docs/security.md` — OWASP Top 10 controls, authentication model, input validation, patch management, dependency scanning, secrets handling, audit logging, security headers.
- `docs/disaster-recovery.md` — RPO/RTO, backup cadence, point-in-time recovery, failover procedures.
- `docs/deployment-guide.md` — hosting architecture, EU data residency, SLA references.
- `docs/hosting-posture-summary.md` — one-page tender-ready summary of the above.

Thank you for helping keep SOWA and its users safe.
