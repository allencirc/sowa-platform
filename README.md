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
