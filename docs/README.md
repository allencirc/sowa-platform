# SOWA Platform — Technical Documentation

**Skillnet Offshore Wind Academy (SOWA) — Offshore Wind Energy Careers Platform**

Version 0.1.0 | Last updated: 4 April 2026

---

## Document Index

| Document | Description | Audience |
|----------|-------------|----------|
| [System Architecture](./architecture.md) | Tech stack, component architecture, data flow, hosting | Developers, Architects |
| [API Reference](./api-reference.md) | Full REST API documentation with schemas and examples | Developers, Integrators |
| [Database Schema](./database-schema.md) | Prisma models, relations, ER diagram, seed data | Developers, DBAs |
| [Admin User Guide](./admin-guide.md) | CMS login, content management, registrations, exports | Content Editors, Admins |
| [Deployment Guide](./deployment-guide.md) | Environment setup, build, deploy, migrations, rollback | DevOps, Developers |
| [Security Documentation](./security.md) | Auth model, GDPR, data protection, security headers | Security, Compliance |
| | | |
| **For the Skillnet team — Operational Documentation** | | |
| [Content Type Guides](./content-type-guides.md) | Guidelines for creating and managing different content types | Content Editors, Team |
| [Publishing Workflow](./publishing-workflow.md) | Content publishing process, review stages, and approval workflows | Content Editors, Team |
| [User Role Management](./user-role-management.md) | User permissions, role assignments, and access control | Admins, Team |
| [Media Library](./media-library.md) | Managing images, videos, and other media assets | Content Editors, Team |
| [Registrations Export](./registrations-export.md) | Exporting and managing registration data | Admins, Data Managers |
| [Diagnostic Tool](./diagnostic-tool.md) | Skills diagnostic tool features and administration | Team, Support |
| [Training Materials](./training-materials.md) | Training resources and onboarding materials for the team | Team, New Users |

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

Default admin credentials (change immediately):
- Email: `admin@sowa.ie`
- Password: `changeme123`

---

## Project Overview

The SOWA platform is a Next.js application that serves as Ireland's national careers and training portal for the offshore wind energy sector. It provides:

- **Career Explorer** — 12 career pathways across 7 sectors with interactive pathway maps
- **Training Directory** — Course listings from Irish universities, ETBs, and private providers
- **Skills Diagnostic** — Self-assessment tool mapping skill gaps to career recommendations
- **Event Hub** — Conferences, webinars, workshops, and roadshows
- **Research Repository** — Policy documents and industry research
- **Admin CMS** — Full content management with publishing workflows, version history, and registration tracking
- **HubSpot CRM** — Registration and newsletter sync (stubbed, ready for activation)
- **AI Career Summary** — Optional AI-powered diagnostic guidance (Anthropic Claude or OpenAI)
- **Analytics** — Consent-aware GA4 tracking, Meta Pixel, and LinkedIn Insight Tag slots
