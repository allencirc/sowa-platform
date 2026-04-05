# SOWA OWE Platform

The Skillnet Offshore Wind Academy (SOWA) careers platform connects learners, workers, and employers to Ireland's offshore wind energy sector. This web application provides career pathway mapping, a training course directory, events and research repositories, and a skills diagnostic tool that matches users to careers and courses based on their current capabilities.

## Screenshots

<!-- TODO: add screenshots / GIF of homepage, pathway map, and diagnostic results -->

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS v4
- Prisma ORM + PostgreSQL
- NextAuth v5
- @xyflow/react (pathway visualisation)
- Recharts (diagnostic results)
- Vitest (unit) + Playwright (e2e)

## Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd sowa-platform

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Edit .env with DATABASE_URL, NEXTAUTH_SECRET, etc.

# 4. Database
npx prisma migrate dev
npx prisma db seed

# 5. Run
npm run dev
```

App runs at http://localhost:3000.

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Admin Guide](docs/admin-guide.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Security](docs/security.md)
- [Database Schema](docs/database-schema.md)
- [ADR 0001 — Internationalisation](docs/adr/0001-i18n.md)

## Internationalisation

SOWA ships in **English (default)**, **Irish** (`ga`), **Polish** (`pl`),
**Ukrainian** (`uk`) and **Portuguese** (`pt`). Public routes live under
`/[locale]/...`; requests without a locale prefix are redirected by
`src/proxy.ts` to the visitor's preferred locale (derived from
`Accept-Language`, falling back to `en`).

Admin (`/admin/*`) and API (`/api/*`) surfaces are **not** localised.

### File layout

```
messages/
├── en.json   # source of truth — every key lives here first
├── ga.json
├── pl.json
├── uk.json
└── pt.json
src/lib/i18n.ts          # locale list, getDictionary(), matchLocale(), format()
src/proxy.ts             # locale detection + redirect + x-sowa-locale header
src/components/layout/LanguageSwitcher.tsx   # globe-icon menu in header
```

The approach (Next.js built-in vs `next-intl`) is documented in
[ADR 0001](docs/adr/0001-i18n.md).

### Adding a string

1. Add the key to `messages/en.json` under an appropriate namespace
   (`nav`, `hero`, `footer`, `cta`, `diagnostic`, …).
2. Add the same key to **every** other locale file. If you don't have a
   translation yet, prefix the English value with `[TODO] `. These are
   easy to find later:
   ```bash
   grep -rn "\[TODO\]" messages/
   ```
3. Consume it in a Server Component:
   ```tsx
   import { getDictionary } from "@/lib/i18n";

   export default async function Page({ params }) {
     const { locale } = await params;
     const dict = await getDictionary(locale);
     return <h1>{dict.hero.title}</h1>;
   }
   ```
   For interpolation (`{year}`, `{current}`, etc.) use the `format()`
   helper:
   ```ts
   import { format } from "@/lib/i18n";
   format(dict.footer.copyright, { year: new Date().getFullYear() });
   ```

### Adding a locale

1. Add the code to `locales` in `src/lib/i18n.ts` and fill in
   `localeLabels` (native script) and `localeBcp47` (e.g. `"it-IT"`).
2. Add the same code to the `LOCALES` constant in
   `src/components/layout/LanguageSwitcher.tsx` — it's duplicated there
   because the switcher is a client component and can't import from a
   `server-only` module.
3. Copy `messages/en.json` to `messages/{code}.json` and prefix every
   value with `[TODO] ` until translations land.
4. If the language uses a new script (e.g. Greek, Arabic), add the
   relevant `next/font` subset in `src/app/layout.tsx` and extend the
   font-family fallback in `src/app/globals.css`.
5. `generateStaticParams` in `src/app/(frontend)/[locale]/layout.tsx`
   picks the new locale up automatically from `locales`.

### Linking between localised pages

Server components can build hrefs as ``` `/${locale}/careers` ```. For
cases where you already have a path and just need to ensure it carries a
locale, use the `localeHref` helper from `@/lib/i18n`. Hard-coded links
like `/careers` still work because the proxy will redirect, but explicit
is preferred.

## Testing

```bash
npm test               # Vitest unit tests
npm run test:e2e       # Playwright end-to-end tests
npm run test:coverage  # Coverage report
```

## Project Structure

```
sowa-platform/
├── src/
│   ├── app/          # Next.js App Router pages and layouts
│   ├── components/   # UI primitives and feature components
│   └── lib/          # Data access, types, utilities, diagnostic engine
├── prisma/           # Schema, migrations, seed scripts
├── e2e/              # Playwright test suites
├── docs/             # Project documentation
└── public/           # Static assets
```

## Status

Built for the SOWA tender (2026).
