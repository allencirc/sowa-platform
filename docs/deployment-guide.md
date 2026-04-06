# Deployment Guide

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/sowa?schema=public` |
| `NEXTAUTH_SECRET` | Random string for JWT signing. Generate with `openssl rand -base64 32` | `K7x...long_random_string` |
| `NEXTAUTH_URL` | Full URL of the deployed site (must match exactly) | `https://sowa.ie` |

### Recommended

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | `production` for production builds | `development` |

### AI Summary (Optional)

| Variable | Description |
|----------|-------------|
| `AI_SUMMARY_ENABLED` | Set to `"true"` to enable AI-powered diagnostic summaries |
| `CLAUDE_KEY` (or `ANTHROPIC_API_KEY`) | Anthropic API key (preferred for AI summaries) |
| `OPENAI_API_KEY` | OpenAI API key (fallback if Anthropic not set) |

### HubSpot CRM (Optional)

| Variable | Description |
|----------|-------------|
| `HUBSPOT_API_KEY` | HubSpot private app API key. Required to activate CRM sync. |
| `HUBSPOT_PORTAL_ID` | HubSpot account/portal ID |
| `HUBSPOT_NEWSLETTER_LIST_ID` | Static list ID for newsletter subscribers |

### Analytics and Marketing (Optional, client-side)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta (Facebook) Pixel ID |
| `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` | LinkedIn Insight Tag partner ID |

> **Note:** `NEXT_PUBLIC_` prefixed variables are exposed to the browser. Analytics and marketing pixels only load after the user grants consent via the cookie banner.

Create a `.env` file locally or configure these in your hosting provider's environment settings.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 15+ (local or managed service)
- **npm** 9+ or equivalent package manager

---

## Local Development Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd sowa-platform

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed the database
npx prisma db seed

# 7. Start development server
npm run dev
```

The app is available at `http://localhost:3000`.

**Prisma Studio** (visual database browser):
```bash
npx prisma studio
```
Opens at `http://localhost:5555`.

---

## Production Build

```bash
# Build the Next.js application
npm run build

# Start the production server
npm start
```

The build output is in `.next/`. The production server runs on port 3000 by default (configurable via `PORT` env var).

---

## Database Migrations

### Running Migrations in Production

```bash
# Deploy all pending migrations (non-interactive)
npx prisma migrate deploy
```

This applies all migrations in `prisma/migrations/` that haven't been applied yet. It does NOT create new migrations — use `migrate dev` for that during development.

### Creating a New Migration

During development:
```bash
# Edit prisma/schema.prisma, then:
npx prisma migrate dev --name descriptive_name
```

This generates a new SQL migration file in `prisma/migrations/`.

### Migration History

| Migration | Description |
|-----------|-------------|
| `20260404112931_init` | Initial schema: all content models, enums, junction tables, users, versions |
| `20260404115459_add_registrations` | Registration system with status tracking |
| `20260405120000_add_content_source` | Adds `ContentSource` enum and `source`/`externalId` columns to `courses` and `events` for external feed ingestion (Eventbrite, CareersPortal, FetchCourses, Qualifax) |

### Checking Migration Status

```bash
npx prisma migrate status
```

---

## Seeding the Database

```bash
npx prisma db seed
```

This runs `prisma/seed.ts` which:
1. Clears existing data (in correct dependency order)
2. Inserts skills, careers, courses, events, research, news, diagnostic questions
3. Creates junction table entries (career-skill, course-skill, course-career links)
4. Creates pathway connections between careers
5. Creates a default admin user (`admin@sowa.ie` / `changeme123`)

**Important:** The seed script is designed for initial setup and demo environments. It clears all existing data before inserting. Do NOT run on a production database with real content.

---

## Production Hosting Recommendation (Green, EU-Region)

**Primary recommendation: Vercel — `cdg1` (Paris, France) region, backed by a Neon PostgreSQL database in `aws-eu-west-3` (Paris).**

### Why this stack

| Requirement | How it is met |
|-------------|---------------|
| EU-region data residency | Both compute (`cdg1`) and database (`aws-eu-west-3`) are located in Paris, France. No user data leaves the EU. |
| Renewable-energy powered | Vercel's compute and bandwidth run on AWS infrastructure. AWS has been **100% renewable-energy matched since 2023**, seven years ahead of its 2030 commitment. See: https://sustainability.aboutamazon.com/2023-aws-renewable-energy (AWS Sustainability, 2023). |
| Data-centre efficiency | The `eu-west-3` (Paris) AWS region operates at a reported trailing-twelve-month PUE of ~1.13 and publishes a regional carbon methodology. See: https://sustainability.aboutamazon.com/products-services/the-cloud |
| Carbon transparency | Vercel publishes emissions and methodology in its Trust Center: https://vercel.com/security and https://vercel.com/legal/dpa. Neon publishes sustainability and region data at: https://neon.tech/docs/introduction/regions |
| Managed SLAs | Vercel Enterprise: 99.99% uptime SLA. Neon: 99.95% uptime SLA on paid tiers (https://neon.tech/docs/introduction/support). |
| Irish/EU compliance | Both providers are GDPR-compliant, offer signed DPAs, and list sub-processors publicly. |

### Named alternatives (if Vercel is not acceptable)

| Provider | EU Region | Renewable-energy source |
|----------|-----------|-------------------------|
| **Scaleway Serverless** | Paris (`fr-par`) | 100% renewable-powered datacentres (DC5 adiabatic cooling, no A/C). https://www.scaleway.com/en/environmental-leadership/ |
| **OVHcloud Public Cloud** | Gravelines / Strasbourg (FR) | Water-cooled, PUE ~1.09, 100% low-carbon electricity. https://corporate.ovhcloud.com/en/sustainability/ |
| **Microsoft Azure App Service** | North Europe (Dublin) | 100% renewable-matched since 2025 commitment; Dublin region. https://www.microsoft.com/en-us/sustainability |

**Decision:** Vercel Paris + Neon Paris is the chosen configuration for this tender. It minimises operational overhead (no Kubernetes, no VM patching), keeps all user data within the EU, and runs on verifiably renewable-matched infrastructure. Scaleway `fr-par` is the fallback if the awarding body requires a French-owned provider.

> **Green host sources quoted in the tender response:**
> - AWS 100% renewable energy (2023): https://sustainability.aboutamazon.com/2023-aws-renewable-energy
> - Scaleway environmental leadership: https://www.scaleway.com/en/environmental-leadership/
> - OVHcloud sustainability report: https://corporate.ovhcloud.com/en/sustainability/

---

## Deployment to Vercel

### First-Time Setup

1. Push the repository to GitHub/GitLab
2. Import the project in [vercel.com](https://vercel.com)
3. Set environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. Set the build command: `npx prisma generate && npm run build`
5. Deploy

### Database Setup

Use a managed PostgreSQL service:
- **Neon** (recommended for Vercel — serverless-friendly)
- **Supabase**
- **AWS RDS**
- **Railway**

After creating the database:
```bash
# Run migrations against production database
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Seed initial data (only for first deployment)
DATABASE_URL="postgresql://..." npx prisma db seed
```

### Subsequent Deployments

Vercel automatically rebuilds on push to the main branch. If the deployment includes new migrations:

1. Run migrations before or during deployment:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```
2. Push code to trigger Vercel rebuild

### Vercel Build Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npx prisma generate && npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 18.x or 20.x |

---

## Alternative: Docker Deployment

A production-ready multi-stage `Dockerfile` ships at the repository root
alongside a `.dockerignore`. It is the canonical artefact for Scenario E
(complete Vercel outage) and Scenario G (self-hosted VM rebuild) in
`disaster-recovery.md`.

Highlights:

- Three stages (`deps` → `builder` → `runner`) to keep the runtime image small.
- Runs `prisma generate` during build and `npm prune --omit=dev` before
  assembling the runner layer.
- Runs as a non-root `nextjs` user, with `tini` as PID 1 so SIGTERM reaches
  `next start` cleanly.
- Ships a `HEALTHCHECK` that hits the homepage over loopback.

Build and run:

```bash
# Build the image
docker build -t sowa-platform:latest .

# Apply migrations against the target database
docker run --rm \
  -e DATABASE_URL="postgresql://..." \
  sowa-platform:latest npx prisma migrate deploy

# Start the app
docker run -d --name sowa -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://sowa.ie" \
  sowa-platform:latest
```

See the `Dockerfile` in the repo root for the full definition.

---

## Backup and Restore

### Database Backup

```bash
# Full database dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Database Restore

```bash
# Restore from backup
psql $DATABASE_URL < backup_20260404_120000.sql

# Restore from compressed backup
gunzip -c backup_20260404_120000.sql.gz | psql $DATABASE_URL
```

### Media Backup

Currently media files are stored locally in `public/uploads/`. Back up this directory:

```bash
tar -czf media_backup_$(date +%Y%m%d).tar.gz public/uploads/
```

For production, migrate to S3/R2/Vercel Blob for automatic redundancy.

### Automated Backups

Set up a cron job for regular backups:

```cron
# Daily database backup at 2am
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/sowa_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
0 3 * * * find /backups -name "sowa_*.sql.gz" -mtime +30 -delete
```

---

## Rollback Procedure

### Application Rollback

**On Vercel:**
1. Go to the Vercel dashboard → Deployments
2. Find the last known good deployment
3. Click the three-dot menu → **Promote to Production**

**On self-hosted:**
```bash
# If using git tags
git checkout v1.x.x
npm install
npx prisma generate
npm run build
npm start
```

### Database Rollback

Prisma does not support automatic migration rollback. To roll back a migration:

1. **Identify the migration** to undo
2. **Write a reverse migration** SQL script manually
3. **Apply it:**
   ```bash
   psql $DATABASE_URL < rollback_migration_name.sql
   ```
4. **Mark the migration as rolled back** in the `_prisma_migrations` table:
   ```sql
   DELETE FROM _prisma_migrations WHERE migration_name = '20260404115459_add_registrations';
   ```

**Safer approach:** Restore from a pre-migration database backup.

### Content Rollback

The ContentVersion system provides built-in content rollback:

1. Find the version to restore via the admin UI or API
2. The version snapshot contains the full state of the content at that point
3. Apply the snapshot data to update the current record

---

## Monitoring and Logging

### Vercel Analytics

The app includes `@vercel/speed-insights` for Core Web Vitals monitoring. No additional configuration needed on Vercel.

### Application Logs

**On Vercel:** Logs are available in the Vercel dashboard under Functions → Logs.

**Self-hosted:** Next.js logs to stdout/stderr. Use a log aggregator:

```bash
# Example with PM2
pm2 start npm --name "sowa" -- start
pm2 logs sowa
```

### Database Monitoring

```bash
# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Slow query log (configure in postgresql.conf)
# log_min_duration_statement = 1000  # Log queries > 1 second
```

### Health Checks

The application responds on all routes. A simple health check:

```bash
curl -s -o /dev/null -w "%{http_code}" https://sowa.ie/api/skills
# Expected: 200
```

### Scheduled Tasks

Set up cron jobs for automated operations:

```bash
# Every 15 minutes, check for content to auto-publish
*/15 * * * * curl -X PUT https://sowa.ie/api/content-status

# Daily database backup at 2am
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/sowa_$(date +\%Y\%m\%d).sql.gz

# Weekly cleanup of old backups (keep 30 days)
0 3 * * 0 find /backups -name "sowa_*.sql.gz" -mtime +30 -delete
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `prisma generate` fails | Ensure `DATABASE_URL` is set and the database is reachable |
| Migrations fail | Check the database user has DDL permissions (CREATE TABLE, ALTER, etc.) |
| Auth redirects loop | Verify `NEXTAUTH_URL` matches the actual deployment URL |
| 500 errors on API | Check server logs. Most likely a database connection issue. |
| Rate limiting too strict | Adjust limits in `src/lib/rate-limit.ts` (default: 60 req/min) |
| Images not loading | Check `next.config.ts` remote image domains. Add your CDN domain if using external storage. |
| Build fails on Vercel | Ensure `npx prisma generate` runs before `npm run build` in the build command |
