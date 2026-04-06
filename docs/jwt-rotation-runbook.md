# JWT Secret Rotation Runbook

---

## Overview

`NEXTAUTH_SECRET` signs all session JWTs issued by the platform. Rotating this secret **invalidates every active session** — all logged-in users will be signed out and must re-authenticate. Treat rotation as a planned maintenance operation and communicate it to the team in advance.

---

## Schedule

| Trigger                                        | Timeframe                                      |
| ---------------------------------------------- | ---------------------------------------------- |
| Routine rotation                               | Every **6 months**                             |
| Suspected compromise                           | **Immediately** (see Emergency Rotation below) |
| Personnel change (admin/deploy access revoked) | Within **24 hours**                            |

---

## Steps (Planned Rotation)

### 1. Generate a new secret

```bash
openssl rand -base64 32
```

Copy the output — this is your new secret value.

### 2. Set the old secret for graceful migration (optional)

If your NextAuth v5 configuration supports dual-secret verification:

- In the Vercel dashboard, add a **new** environment variable:
  - **Key:** `NEXTAUTH_SECRET_OLD`
  - **Value:** the **current** value of `NEXTAUTH_SECRET`

This allows sessions signed with the previous secret to remain valid during the transition window. If your NextAuth configuration does not support `NEXTAUTH_SECRET_OLD`, skip this step.

### 3. Update the signing secret

- In the Vercel dashboard, update the existing environment variable:
  - **Key:** `NEXTAUTH_SECRET`
  - **Value:** the new secret generated in Step 1

### 4. Trigger redeployment

Redeploy the production environment so the new secret takes effect:

```bash
vercel --prod
```

Or trigger a redeployment from the Vercel dashboard.

### 5. Verify admin login

- Navigate to `/admin/login`
- Sign in with valid admin credentials
- Confirm the session is created successfully and the admin dashboard loads
- Check that protected API routes return `200` (not `401`)

### 6. Remove the old secret

After **24 hours** (once all old sessions have naturally expired or been replaced):

- Remove the `NEXTAUTH_SECRET_OLD` environment variable from Vercel
- Trigger another redeployment

---

## Emergency Rotation (Suspected Compromise)

If the signing secret is believed to be compromised, rotate immediately without a grace period:

1. **Generate a new secret:** `openssl rand -base64 32`
2. **Update `NEXTAUTH_SECRET`** in Vercel env vars with the new value — **do not** set `NEXTAUTH_SECRET_OLD`
3. **Trigger redeployment** immediately
4. **Accept that all active sessions are invalidated** — every user will need to re-login
5. **Notify the team** via Slack and/or email:
   - What happened (suspected compromise of JWT signing secret)
   - What was done (immediate rotation, all sessions invalidated)
   - What users should do (re-login; report any suspicious activity)
6. **Investigate** the compromise vector and document findings

---

## Verification Checklist

After any rotation (planned or emergency), confirm:

- [ ] A new login at `/admin/login` produces a valid session
- [ ] The admin dashboard loads without authentication errors
- [ ] Old session cookies are rejected (test by using a previously-saved cookie or a different browser session that was active before rotation)
- [ ] API routes behind `requireAuth()` return `200` for new sessions and `401` for old/invalid tokens
- [ ] No errors in Vercel function logs related to JWT verification

---

## Secret Storage

The new secret value must be recorded in:

1. **Vercel environment variables** (production + preview)
2. **Platform owner's password manager** (recovery copy)

Never commit the secret to source control or share it via unencrypted channels.
