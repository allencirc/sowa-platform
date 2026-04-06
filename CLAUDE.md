# SOWA OWE Platform — Project Context

> This file is the single source of truth for the project. Claude Code reads it automatically.
> All build prompts assume this context is loaded.

## PROJECT GOAL

Build the **Skillnet Offshore Wind Academy (SOWA)** careers platform for a tender presentation to evaluators. It must look and feel production-ready and be architecturally clean enough to deploy. The platform is backed by PostgreSQL via Prisma with seeded realistic data, has an authenticated admin area, and is covered by unit and e2e tests.

**Reference site to match/exceed:** https://www.skillnetmmcaccelerate.ie/en

---

## STACK

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (utility-first, design tokens via config)
- **Prisma 7 + PostgreSQL** (data layer, migrations, seed)
- **NextAuth v5** (admin auth, credentials provider)
- **@xyflow/react** for career pathway visualisation
- **Recharts** for diagnostic tool results (radar chart)
- **Tiptap** for rich-text editing in the admin UI
- **react-hook-form + zod** for form validation
- **Vitest** (unit) and **Playwright + axe-core** (e2e + a11y) for testing
- **HubSpot API client** for CRM integration
- **Inter** font via next/font

---

## DESIGN TOKENS

```js
// tailwind.config.ts — extend theme with these
colors: {
  primary: {
    DEFAULT: '#0C2340',  // Deep ocean blue — headers, nav, primary CTAs
    light: '#1A3A5C',    // Hover states
    dark: '#081828',      // Active states
  },
  secondary: {
    DEFAULT: '#00A878',  // Teal/wind green — accents, highlights, success
    light: '#00C98E',
    dark: '#008A62',
  },
  accent: {
    DEFAULT: '#4A90D9',  // Sky blue — links, interactive elements
    light: '#6BA8E8',
    dark: '#3578C0',
  },
  surface: {
    DEFAULT: '#F7F9FC',  // Page backgrounds
    card: '#FFFFFF',     // Card backgrounds
    dark: '#0C2340',     // Dark sections (hero, stats bar, footer)
  },
  text: {
    primary: '#1A1A2E',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
    muted: '#9CA3AF',
  },
  status: {
    warning: '#F59E0B',
    error: '#DC2626',
    success: '#00A878',
    info: '#4A90D9',
  },
  sector: {
    'operations': '#0C2340',
    'marine': '#1E6091',
    'electrical': '#F59E0B',
    'survey-design': '#7C3AED',
    'hse': '#DC2626',
    'policy': '#059669',
    'project-management': '#EA580C',
  }
}
```

**Typography:** Inter, system fallbacks. Base 16px. Scale: 14, 16, 18, 20, 24, 30, 36, 48px.

**Visual tone:** Professional, clean, modern. Government-meets-tech — credible and trustworthy but not boring. Wind turbine imagery, ocean/coastal tones, clean iconography.

---

## PROJECT STRUCTURE

```
sowa-platform/
├── src/
│   ├── app/
│   │   ├── (frontend)/           # Public pages (layout with Header + Footer)
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── careers/
│   │   │   │   ├── page.tsx      # Career listing + pathway map
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx  # Career detail
│   │   │   ├── training/
│   │   │   │   ├── page.tsx      # Course directory
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx  # Course detail
│   │   │   ├── events/
│   │   │   │   ├── page.tsx      # Events listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx  # Event detail
│   │   │   ├── research/
│   │   │   │   ├── page.tsx      # Research repository
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx  # Research detail
│   │   │   ├── diagnostic/
│   │   │   │   ├── page.tsx      # Diagnostic landing
│   │   │   │   └── assessment/
│   │   │   │       └── page.tsx  # Take assessment + results
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx      # Global search results
│   │   │   └── layout.tsx        # Public layout (Header + Footer wrapper)
│   │   └── layout.tsx            # Root layout (html, body, fonts)
│   ├── components/
│   │   ├── ui/                   # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── Section.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Sticky header with mega-menu nav
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileMenu.tsx    # Hamburger menu drawer
│   │   │   └── Breadcrumbs.tsx
│   │   ├── careers/
│   │   │   ├── CareerCard.tsx
│   │   │   ├── PathwayMap.tsx    # React Flow interactive map
│   │   │   ├── MiniPathway.tsx   # Small version for detail pages
│   │   │   └── SkillBadge.tsx
│   │   ├── courses/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── FilterPanel.tsx   # Sidebar filters (desktop)
│   │   │   ├── FilterDrawer.tsx  # Bottom sheet filters (mobile)
│   │   │   └── FilterChips.tsx   # Active filter chips
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   └── EventList.tsx
│   │   ├── research/
│   │   │   ├── ResearchCard.tsx
│   │   │   └── FeaturedResearch.tsx
│   │   ├── diagnostic/
│   │   │   ├── QuestionStep.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ResultsChart.tsx  # Recharts radar chart
│   │   │   ├── GapCard.tsx
│   │   │   └── RecommendationCards.tsx
│   │   └── home/
│   │       ├── HeroSection.tsx
│   │       ├── AudienceCards.tsx
│   │       ├── FeaturedCareers.tsx
│   │       ├── PathwayTeaser.tsx
│   │       ├── UpcomingCourses.tsx
│   │       ├── UpcomingEvents.tsx
│   │       ├── DiagnosticCTA.tsx
│   │       ├── LatestResearch.tsx
│   │       ├── StatsBar.tsx
│   │       └── NewsletterSignup.tsx
│   ├── lib/
│   │   ├── queries.ts            # Data access functions wrapping Prisma (getCareerBySlug, etc.)
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── auth.ts               # NextAuth v5 config
│   │   ├── types.ts              # Shared TypeScript interfaces / Prisma type re-exports
│   │   ├── utils.ts              # formatDate, formatCurrency, slugify, cn, etc.
│   │   ├── diagnostic.ts         # Scoring engine for diagnostic tool
│   │   └── integrations/         # HubSpot and other third-party adapters
│   └── styles/
│       └── globals.css
├── prisma/
│   ├── schema.prisma             # Source of truth for data models
│   ├── migrations/
│   └── seed.ts                   # Seed script (npm run db:seed)
├── e2e/                          # Playwright specs
├── public/
│   └── images/                   # Placeholder images
├── CLAUDE.md                     # THIS FILE
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── next.config.ts
```

---

## DATA MODELS (TypeScript interfaces)

```typescript
// All mock data conforms to these interfaces.
// When building components, import types from '@/lib/types'

interface Career {
  slug: string
  title: string
  sector: 'Operations & Maintenance' | 'Marine Operations' | 'Survey & Design' |
          'Health, Safety & Environment' | 'Electrical' | 'Policy & Regulation' |
          'Project Management'
  entryLevel: 'Apprentice' | 'Entry' | 'Mid' | 'Senior' | 'Leadership'
  description: string
  salaryRange?: { min: number; max: number }
  keyResponsibilities?: string[]
  qualifications: string[]
  workingConditions?: string
  growthOutlook?: string
  skills: string[]           // skill slugs
  pathwayConnections: PathwayConnection[]
  relatedCourses: string[]   // course slugs
}

interface PathwayConnection {
  to: string                 // career slug
  type: 'progression' | 'lateral' | 'specialisation'
  timeframe: string
}

interface Course {
  slug: string
  title: string
  provider: string
  providerType: 'University' | 'ETB' | 'Private' | 'Industry' | 'Skillnet_Network' | 'Government'
  description: string
  entryRequirements?: string
  deliveryFormat: 'In-Person' | 'Online' | 'Blended' | 'Self-Paced'
  location?: string
  nfqLevel?: number | null
  duration: string
  cost: number               // 0 = free
  costNotes?: string
  nextStartDate?: string     // ISO date
  accredited?: boolean
  certificationAwarded?: string
  skills: string[]           // skill slugs
  careerRelevance: string[]  // career slugs
  tags: string[]
}

interface Event {
  slug: string
  title: string
  type: 'Workshop' | 'Webinar' | 'Conference' | 'Networking' | 'Training' | 'Roadshow'
  startDate: string          // ISO datetime
  endDate?: string
  locationType: 'Physical' | 'Virtual' | 'Hybrid'
  location?: string
  description: string
  capacity?: number
}

interface Research {
  slug: string
  title: string
  author: string
  organisation: string
  publicationDate: string    // ISO date
  summary: string
  categories: string[]
  isFeatured?: boolean
}

interface Skill {
  slug: string
  name: string
  category: 'Technical' | 'Safety' | 'Regulatory' | 'Digital' | 'Management'
}

interface DiagnosticQuestion {
  id: string
  text: string
  type: 'single_choice' | 'multiple_choice' | 'scale'
  options?: DiagnosticOption[]
  scaleMin?: number
  scaleMax?: number
  scaleLabels?: Record<string, string>
  scoreImpact?: Record<string, number>
}

interface DiagnosticOption {
  label: string
  value: string
  scoreImpact?: Record<string, number>
}

interface DiagnosticResult {
  scores: Record<string, number>       // skill slug → score
  maxPossible: Record<string, number>  // skill slug → max possible score
  gaps: DiagnosticGap[]
  recommendedCareers: Career[]
  recommendedCourses: Course[]
}

interface DiagnosticGap {
  skill: Skill
  score: number
  maxScore: number
  severity: 'high' | 'medium' | 'low'
}
```

---

## PAGE LAYOUTS

### Homepage (top to bottom)
1. **Hero:** Full-width, dark overlay on gradient/image. H1: "Your Career in Offshore Wind Starts Here". Subtitle. Two CTAs: "Explore Careers" (primary), "Take Skills Assessment" (outline).
2. **Audience cards:** 4-column grid. "Explore Careers", "Find Training", "Enterprise Support", "Get Involved". Icon, title, 1-line desc, arrow.
3. **Featured careers:** H2 + horizontal scroll of 4 CareerCards.
4. **Pathway teaser:** Decorative section + "Discover Your Path" CTA.
5. **Upcoming courses:** H2 + 3 CourseCards.
6. **Upcoming events:** H2 + 3 EventCards.
7. **Diagnostic CTA:** Banner. "Not sure where to start? Assess your OWE skills in 5 minutes."
8. **Latest research:** Featured large + 2 small ResearchCards.
9. **Stats bar:** Dark bg. "12 Career Pathways | 15+ Training Courses | 6 Events | 31 Skills Mapped"
10. **Newsletter signup:** Email + topic checkboxes + subscribe.
11. **Footer.**

### Career Listing (/careers)
- Full-width React Flow pathway map at top
- Sector filter buttons below map
- Grid of CareerCards below filters

### Career Detail (/careers/[slug])
- Breadcrumb → Hero (title, sector, level, salary) → Description → Key Responsibilities → Skills badges → Qualifications → Working Conditions → Growth Outlook → Related Courses (CourseCards) → Mini pathway ("Where This Leads" / "How to Get Here")

### Course Directory (/training)
- Sidebar filters (desktop) / filter drawer (mobile): Topic, Format, NFQ Level, Provider, Cost, Starting Soon
- Course card grid, sort dropdown, active filter chips, result count
- URL updates with filter state

### Course Detail (/training/[slug])
- Breadcrumb → Title + badges → Key info grid (Duration, Cost, Date, Location, Cert) → Description → Entry Requirements → Skills gained → Related Careers → CTA

### Diagnostic (/diagnostic + /diagnostic/assessment)
- Landing: explanation + audience buttons
- Assessment: one question at a time, progress bar, styled answer cards
- Results: radar chart, top 3 gaps, recommended careers, recommended courses, action buttons

### Events (/events)
- List view, event cards with type/location badges, upcoming/past toggle

### Research (/research)
- Featured hero item + filterable grid

### Search (/search?q=)
- Results grouped by content type with badges

---

## NAVIGATION STRUCTURE

```
Header:
  Logo (left) | Careers | Training | Events | Research | News | Diagnostic | [Search icon] | [Get Involved CTA] (right)

Mobile:
  Logo (left) | [Hamburger] (right) → Drawer with full nav

Footer columns:
  Careers | Training | Events | Research | About | Legal (Privacy, Terms, Accessibility, Cookies)
```

---

## KEY LIBRARIES

```json
{
  "dependencies": {
    "next": "^14.2",
    "@xyflow/react": "^12",
    "recharts": "^2.12",
    "lucide-react": "^0.400",
    "clsx": "^2.1",
    "tailwind-merge": "^2.3"
  }
}
```

Use `lucide-react` for all icons. Use `clsx` + `tailwind-merge` for conditional class names (create a `cn()` utility).

---

## CODING STANDARDS

- Each component in its own file
- TypeScript strict mode — type everything
- Use `cn()` utility for Tailwind class merging
- Use Next.js App Router conventions (page.tsx, layout.tsx, loading.tsx)
- Server components by default, `'use client'` only when needed (interactivity)
- Access data via query functions in `@/lib/queries.ts` (which wrap Prisma), never import from `@/lib/data/*` JSON or call Prisma directly from components
- Write paths go through server actions or route handlers; validate with zod
- All images: use Next.js `<Image>` component or gradient placeholders
- Responsive: mobile-first, test at 320px, 768px, 1024px, 1440px
- Accessibility: semantic HTML, alt text, ARIA where needed, keyboard navigable, focus visible

---

## SEED DATA

Seed data lives in `prisma/seed.ts` and is loaded with `npm run db:seed`. The schema of
record is `prisma/schema.prisma`. Legacy JSON fixtures may remain in `src/lib/data/` but
are no longer the source of truth — update the seed script and run a migration instead.

The seeded dataset includes:
- 12 careers across 7 sectors with pathway connections
- 15 courses from various Irish providers (including 2 free Skillnet-funded)
- 6 events (conferences, webinars, workshops, roadshows)
- 5 research items (including the 2 key policy documents)
- 31 skills across 5 categories
- 15 diagnostic questions with branching logic and scoring
