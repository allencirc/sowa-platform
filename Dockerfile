# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# SOWA Platform — fallback Dockerfile
#
# Referenced by:
#   - docs/deployment-guide.md §"Alternative: Docker Deployment"
#   - docs/disaster-recovery.md §4.5 Scenario E (Complete Vercel Outage)
#   - docs/disaster-recovery.md §4.7 Scenario G (Self-hosted VM rebuild)
#
# Build:
#   docker build -t sowa-platform:latest .
#
# Run (requires DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL):
#   docker run --rm -p 3000:3000 \
#     -e DATABASE_URL="postgresql://..." \
#     -e NEXTAUTH_SECRET="..." \
#     -e NEXTAUTH_URL="https://sowa.ie" \
#     sowa-platform:latest
#
# Run migrations against the target database before first boot:
#   docker run --rm -e DATABASE_URL="postgresql://..." \
#     sowa-platform:latest npx prisma migrate deploy
# ---------------------------------------------------------------------------

# ----- Stage 1: dependencies ------------------------------------------------
FROM node:26-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
# Uses the repo's postinstall hook to run `prisma generate`.
RUN npm ci

# ----- Stage 2: build -------------------------------------------------------
FROM node:26-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# Drop dev dependencies so the runner image ships only what `next start` needs.
RUN npm prune --omit=dev

# ----- Stage 3: runner ------------------------------------------------------
FROM node:26-alpine AS runner
RUN apk add --no-cache libc6-compat openssl tini
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as a non-root user.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3000

# Lightweight healthcheck — homepage returns 200 when the app is ready.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>{if(r.status>=400)process.exit(1)}).catch(()=>process.exit(1))"

# tini is PID 1 so SIGTERM from the orchestrator reaches `next start` cleanly.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
