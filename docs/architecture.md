# System Architecture

## Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js | 16.2.2 | App Router with server/client component model, SSR for SEO, API routes for backend, single deployable unit |
| Language | TypeScript | 5.x | Strict mode. Type safety across frontend and backend reduces runtime errors |
| Runtime | React | 19.2.4 | Server Components for data-heavy pages, Client Components only where interactivity is needed |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with design tokens. Consistent theming, no CSS-in-JS runtime overhead |
| Database | PostgreSQL | 15+ | Relational model fits the structured content domain. JSONB for flexible diagnostic scoring |
| ORM | Prisma | 7.6.0 | Type-safe database access, auto-generated client, migration management, visual studio |
| Auth | NextAuth.js | 5.0.0-beta.30 | JWT sessions, credentials provider, role-based middleware. Integrates natively with Next.js |
| Forms | React Hook Form + Zod | 7.72 / 4.3 | Performant form handling with schema-based validation shared between client and server |
| Rich Text | TipTap | 3.22.1 | Extensible ProseMirror-based editor for admin content editing |
| Visualisation | @xyflow/react (React Flow) | 12.10.2 | Interactive node-based career pathway maps |
| Charts | Recharts | 3.8.1 | Radar charts for diagnostic skill assessment results |
| Icons | Lucide React | 1.7.0 | Tree-shakeable SVG icon library. Consistent line-icon style |
| Utilities | clsx + tailwind-merge | 2.1 / 3.5 | Conditional class names with Tailwind conflict resolution via `cn()` helper |

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
├──────────────────────┬──────────────────────────────────┤
│   (frontend) group   │          admin group              │
│   Public pages       │   Authenticated CMS pages         │
│   Server Components  │   Client Components + forms       │
│   SSR / Static       │   JWT session guard               │
├──────────────────────┴──────────────────────────────────┤
│                    API Routes (/api/*)                    │
│   Rate-limited  │  Auth-guarded  │  Zod-validated        │
├─────────────────────────────────────────────────────────┤
│              Library Layer (src/lib/)                     │
│   queries.ts  │  validations.ts  │  auth.ts  │  utils.ts│
├─────────────────────────────────────────────────────────┤
│                Prisma ORM (schema.prisma)                 │
├─────────────────────────────────────────────────────────┤
│                    PostgreSQL                             │
└─────────────────────────────────────────────────────────┘
```

### Route Groups

- **`(frontend)`** — Public-facing pages. Uses a shared layout with `Header` and `Footer`. Pages are server components by default, with `'use client'` only for interactive elements (pathway map, diagnostic quiz, filters, search).
- **`admin`** — CMS pages behind authentication. The admin layout checks the NextAuth session and redirects unauthenticated users to `/admin/login`. Includes sidebar navigation and top bar.

### Component Hierarchy

```
src/components/
├── ui/              # Design system primitives (Button, Card, Badge, Input, etc.)
├── layout/          # Header, Footer, MobileMenu, Breadcrumbs, CookieConsent
├── home/            # Homepage sections (Hero, AudienceCards, StatsBar, etc.)
├── careers/         # CareerCard, PathwayMap (React Flow), MiniPathway, SkillBadge
├── courses/         # CourseCard, FilterPanel, FilterDrawer, FilterChips
├── events/          # EventCard
├── research/        # ResearchCard
├── diagnostic/      # QuestionStep, ProgressBar, ResultsChart, GapCard
├── registration/    # RegisterButton, RegistrationModal
└── admin/           # Sidebar, Topbar, DataTable, form components, RichTextEditor
```

---

## Data Flow

### Public Page Request

```
Browser → Next.js Server Component
           ↓
         queries.ts (getAllCareers, getFilteredCourses, etc.)
           ↓
         Prisma Client
           ↓
         PostgreSQL
           ↓
         HTML response (SSR)
```

### Admin Content Edit

```
Admin Browser → Client Component (React Hook Form)
                  ↓ (fetch)
                API Route (/api/careers)
                  ↓
                Auth middleware (requireAuth + requireRole)
                  ↓
                Zod validation (parseBody)
                  ↓
                Rate limiter check
                  ↓
                Prisma Client (create/update)
                  ↓
                Content versioning (createContentVersion)
                  ↓
                PostgreSQL
                  ↓
                JSON response → UI update
```

### Diagnostic Assessment

```
Browser → /diagnostic/assessment (Client Component)
            ↓
          GET /api/diagnostic/questions → Fetch all questions
            ↓
          User answers questions (client state)
            ↓
          POST /api/diagnostic/results { answers: {...} }
            ↓
          Server: calculateResults() in diagnostic.ts
            - Fetch skills, careers, courses from DB
            - Score answers against skill weightings
            - Identify gaps (high/medium/low severity)
            - Match interests to careers
            - Recommend courses to fill gaps
            ↓
          Return { scores, gaps, recommendedCareers, recommendedCourses }
            ↓
          ResultsChart (Recharts radar) + GapCards + RecommendationCards
```

### Registration Flow

```
Public User → RegisterButton → RegistrationModal
                ↓
              POST /api/registrations
                - Validate with Zod (registrationSchema)
                - Check event capacity (count active registrations)
                - Create registration with GDPR consent flag
                ↓
              Admin → GET /api/admin/registrations (paginated, filterable)
                ↓
              Admin → PATCH /api/admin/registrations/[id] (confirm/cancel)
                ↓
              Admin → GET /api/admin/registrations/export (CSV download)
```

---

## Content Publishing Workflow

```
  DRAFT ──────→ IN_REVIEW ──────→ PUBLISHED
    ↑               │                  │
    └───────────────┘                  │
    (rejection with note)              ↓
                                   ARCHIVED
```

- **EDITOR** can move: DRAFT → IN_REVIEW
- **ADMIN** can move: any transition, including scheduled publishing (set `publishAt` for future date)
- Auto-publish: A PUT endpoint on `/api/content-status` checks for items where `publishAt <= now()` and transitions them to PUBLISHED
- Every status change creates a `ContentVersion` snapshot for audit

---

## Hosting Architecture

### Recommended: Vercel + Managed PostgreSQL

```
┌──────────────────────────────┐
│         Vercel Edge           │
│   CDN, SSL, Edge Middleware   │
├──────────────────────────────┤
│     Vercel Serverless         │
│   Next.js App (SSR + API)     │
│   Auto-scaling functions      │
├──────────────────────────────┤
│      Managed PostgreSQL       │
│   (Neon / Supabase / RDS)     │
│   Connection pooling          │
│   Automatic backups           │
└──────────────────────────────┘
         │
    ┌────┴────┐
    │  Media   │
    │ Storage  │
    │ (local/  │
    │  S3)     │
    └─────────┘
```

**Current state:** Media files are stored on the local filesystem under `public/uploads/`. For production, migrate to an object storage service (S3, Cloudflare R2, or Vercel Blob).

### Environment Requirements

- Node.js 18+ (LTS recommended)
- PostgreSQL 15+
- `DATABASE_URL` environment variable
- `NEXTAUTH_SECRET` for JWT signing
- `NEXTAUTH_URL` for callback URLs

### HubSpot CRM Integration

The platform includes a HubSpot integration layer (`src/lib/hubspot.ts`) for syncing registrations and newsletter subscriptions to a CRM. Currently **stubbed** — the functions log to console when `HUBSPOT_API_KEY` is not set.

```
Registration form   →  POST /api/registrations  →  Prisma (DB write)
                                                  →  syncRegistration() (HubSpot, non-blocking)

Newsletter form     →  POST /api/newsletter      →  syncNewsletterSubscription() (HubSpot)

Admin dashboard     →  GET /api/admin/hubspot/status  →  getSyncStatus()
```

To activate: set `HUBSPOT_API_KEY`, `HUBSPOT_PORTAL_ID`, and `HUBSPOT_NEWSLETTER_LIST_ID` environment variables, then implement the actual API calls in `src/lib/hubspot.ts` using the `@hubspot/api-client` package (already installed).

### AI-Powered Career Summary

The diagnostic tool includes an optional AI summary feature:

```
POST /api/diagnostic/summary
  ↓
Feature flag: AI_SUMMARY_ENABLED=true
  ↓
Anthropic API (Claude Haiku, preferred) OR OpenAI API (GPT-4o-mini, fallback)
  ↓
Personalised ~200-word career guidance paragraph
```

### Analytics and Marketing Pixels

Consent-aware tracking is implemented in `src/lib/analytics.ts` and `src/lib/marketing-pixels.ts`:

- **GA4** — loads only after analytics consent. Typed event helpers for career views, course views, diagnostic completion, search, etc.
- **Meta Pixel** — loads only after marketing consent and `NEXT_PUBLIC_META_PIXEL_ID` is set
- **LinkedIn Insight Tag** — loads only after marketing consent and `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` is set
- Cookie consent banner (`CookieConsent` component) manages preferences via a `sowa_consent` cookie

### SEO and Discovery

- **Dynamic sitemap** (`src/app/sitemap.ts`) — generates entries for all published careers, courses, events, research, and news
- **robots.txt** (`src/app/robots.ts`) — allows all crawlers, blocks `/diagnostic/assessment`
- **PWA manifest** (`src/app/manifest.ts`) — app name, icons, theme colour
- **OG image** (`src/app/opengraph-image.tsx`) — generated Open Graph image
- **Vercel Speed Insights** — Core Web Vitals monitoring via `@vercel/speed-insights`

### Performance Considerations

- Server Components reduce client-side JavaScript
- Prisma connection pooling via PrismaPg adapter
- In-memory rate limiting (swap to Redis for multi-instance deployments)
- Next.js Image optimisation for media
- Vercel Speed Insights integrated for monitoring

---

## Key Architectural Decisions

| Decision | Choice | Alternative Considered | Rationale |
|----------|--------|----------------------|-----------|
| Database | PostgreSQL + Prisma | Payload CMS + MongoDB | Structured relational data model fits the career/course/skill domain. Prisma provides type safety. Payload CMS planned for future phase. |
| Auth | NextAuth credentials | OAuth providers | Admin-only auth. Credentials provider is simplest for internal users. OAuth can be added later. |
| Styling | Tailwind CSS 4 | CSS Modules, styled-components | Utility-first approach, design tokens in config, no runtime overhead, good DX with IDE support |
| State management | Server Components + URL state | Redux, Zustand | Most pages are server-rendered. Filter state lives in URL params. Client state only for modals and forms. |
| Rate limiting | In-memory Map | Redis, Upstash | Sufficient for single-instance deployment. Redis recommended for production multi-instance. |
| Rich text | TipTap | Draft.js, Slate | Modern ProseMirror-based editor with good extension ecosystem. Outputs HTML for flexible rendering. |
| Pathway visualisation | React Flow | D3.js, Cytoscape | Purpose-built for node/edge diagrams with built-in pan, zoom, and interactivity |
