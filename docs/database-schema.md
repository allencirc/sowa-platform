# Database Schema

ORM: Prisma 7.6.0 | Database: PostgreSQL 15+

Schema file: `prisma/schema.prisma`

---

## Enums

### Content & Workflow

| Enum | Values |
|------|--------|
| `ContentStatus` | `DRAFT`, `IN_REVIEW`, `PUBLISHED`, `ARCHIVED` |
| `ContentType` | `CAREER`, `COURSE`, `EVENT`, `RESEARCH`, `NEWS` |
| `UserRole` | `ADMIN`, `EDITOR`, `VIEWER` |

### Career Domain

| Enum | Values |
|------|--------|
| `CareerSector` | `OPERATIONS_MAINTENANCE`, `MARINE_OPERATIONS`, `SURVEY_DESIGN`, `HEALTH_SAFETY_ENVIRONMENT`, `ELECTRICAL`, `POLICY_REGULATION`, `PROJECT_MANAGEMENT` |
| `EntryLevel` | `APPRENTICE`, `ENTRY`, `MID`, `SENIOR`, `LEADERSHIP` |
| `PathwayType` | `PROGRESSION`, `LATERAL`, `SPECIALISATION` |

### Course Domain

| Enum | Values |
|------|--------|
| `ProviderType` | `UNIVERSITY`, `ETB`, `PRIVATE`, `INDUSTRY`, `SKILLNET_NETWORK`, `GOVERNMENT` |
| `DeliveryFormat` | `IN_PERSON`, `ONLINE`, `BLENDED`, `SELF_PACED` |

### Event Domain

| Enum | Values |
|------|--------|
| `EventType` | `WORKSHOP`, `WEBINAR`, `CONFERENCE`, `NETWORKING`, `TRAINING`, `ROADSHOW` |
| `LocationType` | `PHYSICAL`, `VIRTUAL`, `HYBRID` |

### Skills

| Enum | Values |
|------|--------|
| `SkillCategory` | `TECHNICAL`, `SAFETY`, `REGULATORY`, `DIGITAL`, `MANAGEMENT` |

### Diagnostic

| Enum | Values |
|------|--------|
| `DiagnosticQuestionType` | `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `SCALE` |

### Registrations

| Enum | Values |
|------|--------|
| `RegistrationType` | `EVENT`, `COURSE` |
| `RegistrationStatus` | `PENDING`, `CONFIRMED`, `CANCELLED` |

---

## Models

### Skill

Core unit of competency. Linked to both careers and courses.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | Auto-generated ID |
| `slug` | String | Unique | URL-safe identifier |
| `name` | String | | Display name |
| `category` | SkillCategory | | Technical, Safety, Regulatory, Digital, Management |
| `createdAt` | DateTime | Default: now() | |
| `updatedAt` | DateTime | @updatedAt | |

**Relations:** CareerSkill[], CourseSkill[]

---

### Career

A career role in the offshore wind energy sector.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `slug` | String | Unique | |
| `title` | String | | Role title |
| `sector` | CareerSector | | One of 7 OWE sectors |
| `entryLevel` | EntryLevel | | Seniority level |
| `description` | String | | Full description |
| `salaryMin` | Int? | | Lower salary bound (EUR) |
| `salaryMax` | Int? | | Upper salary bound (EUR) |
| `keyResponsibilities` | String[] | | List of responsibilities |
| `qualifications` | String[] | | Required qualifications |
| `workingConditions` | String? | | Working environment description |
| `growthOutlook` | String? | | Industry growth narrative |
| `status` | ContentStatus | Default: DRAFT | Publishing state |
| `publishAt` | DateTime? | | Scheduled publish timestamp |
| `rejectionNote` | String? | | Reason for rejection from review |
| `createdAt` | DateTime | Default: now() | |
| `updatedAt` | DateTime | @updatedAt | |

**Relations:** CareerSkill[], PathwayConnection[] (from), PathwayConnection[] (to), CourseCareer[]

---

### PathwayConnection

Directed edge between two careers representing a progression, lateral move, or specialisation path.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `fromId` | String | FK → Career | Source career |
| `toId` | String | FK → Career | Target career |
| `type` | PathwayType | | progression, lateral, specialisation |
| `timeframe` | String | | e.g. "2-3 years experience" |

**Unique constraint:** `(fromId, toId)` — only one connection between any two careers.

---

### Course

A training course from an Irish education or training provider.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `slug` | String | Unique | |
| `title` | String | | Course title |
| `provider` | String | | Provider name |
| `providerType` | ProviderType | | University, ETB, Private, etc. |
| `description` | String | | |
| `entryRequirements` | String? | | Prerequisites |
| `deliveryFormat` | DeliveryFormat | | In-Person, Online, Blended, Self-Paced |
| `location` | String? | | Physical location |
| `nfqLevel` | Int? | | National Framework of Qualifications level (1-10) |
| `duration` | String | | e.g. "5 days", "1 year" |
| `cost` | Float | Default: 0 | Cost in EUR. 0 = free |
| `costNotes` | String? | | e.g. "Fully funded by Skillnet" |
| `nextStartDate` | DateTime? | | Next intake date |
| `accredited` | Boolean | Default: false | |
| `certificationAwarded` | String? | | Certificate name |
| `tags` | String[] | | Freeform tags |
| `status` | ContentStatus | Default: DRAFT | |
| `publishAt` | DateTime? | | |
| `rejectionNote` | String? | | |
| `createdAt` | DateTime | | |
| `updatedAt` | DateTime | | |

**Relations:** CourseSkill[], CourseCareer[]

---

### Event

An event (conference, webinar, workshop, roadshow, etc.).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `slug` | String | Unique | |
| `title` | String | | |
| `type` | EventType | | Workshop, Webinar, Conference, etc. |
| `startDate` | DateTime | | |
| `endDate` | DateTime? | | |
| `locationType` | LocationType | | Physical, Virtual, Hybrid |
| `location` | String? | | Venue / URL |
| `description` | String | | |
| `capacity` | Int? | | Max registrations (null = unlimited) |
| `image` | String? | | Image URL |
| `status` | ContentStatus | Default: DRAFT | |
| `publishAt` | DateTime? | | |
| `rejectionNote` | String? | | |
| `createdAt` | DateTime | | |
| `updatedAt` | DateTime | | |

---

### Research

Published research papers, policy documents, and industry reports.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `slug` | String | Unique | |
| `title` | String | | |
| `author` | String | | |
| `organisation` | String | | Publishing organisation |
| `publicationDate` | DateTime | | |
| `summary` | String | | |
| `categories` | String[] | | e.g. ["Policy", "Workforce Planning"] |
| `isFeatured` | Boolean | Default: false | Show in featured section |
| `image` | String? | | |
| `status` | ContentStatus | Default: DRAFT | |
| `publishAt` | DateTime? | | |
| `rejectionNote` | String? | | |
| `createdAt` | DateTime | | |
| `updatedAt` | DateTime | | |

---

### NewsArticle

News articles and announcements.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `slug` | String | Unique | |
| `title` | String | | |
| `date` | DateTime | | Publication date |
| `excerpt` | String | | Short summary for cards |
| `content` | String | | Full HTML content (TipTap output) |
| `category` | String | | e.g. "Announcements", "Industry" |
| `author` | String | | |
| `image` | String? | | |
| `status` | ContentStatus | Default: DRAFT | |
| `publishAt` | DateTime? | | |
| `rejectionNote` | String? | | |
| `createdAt` | DateTime | | |
| `updatedAt` | DateTime | | |

---

### DiagnosticQuestion

Questions for the skills self-assessment tool.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK (user-defined, e.g. "q1") | |
| `text` | String | | Question text |
| `type` | DiagnosticQuestionType | | single_choice, multiple_choice, scale |
| `options` | Json? | | Array of `{ label, value, scoreImpact }` |
| `scaleMin` | Int? | | For scale questions |
| `scaleMax` | Int? | | For scale questions |
| `scaleLabels` | Json? | | `{ "1": "Beginner", "5": "Expert" }` |
| `scoreImpact` | Json? | | Default score impact for scale questions |
| `createdAt` | DateTime | | |
| `updatedAt` | DateTime | | |

---

### User

Admin CMS users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `email` | String | Unique | |
| `name` | String? | | |
| `role` | UserRole | Default: VIEWER | ADMIN, EDITOR, VIEWER |
| `passwordHash` | String? | | bcrypt hash |
| `createdAt` | DateTime | | |
| `updatedAt` | DateTime | | |

**Relations:** ContentVersion[]

---

### Registration

Event and course registrations from public users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `type` | RegistrationType | | EVENT or COURSE |
| `contentId` | String | | Soft FK to Event or Course ID |
| `name` | String | | Registrant name |
| `email` | String | | Registrant email |
| `phone` | String? | | |
| `organisation` | String? | | |
| `role` | String? | | Job role |
| `dietaryRequirements` | String? | | For in-person events |
| `additionalNotes` | String? | | |
| `gdprConsent` | Boolean | | Must be true |
| `status` | RegistrationStatus | Default: PENDING | |
| `createdAt` | DateTime | | |
| `updatedAt` | DateTime | | |

**Indexes:** `(type, contentId)`, `(email)`

---

### ContentVersion

Audit trail for all content changes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid() | |
| `contentType` | ContentType | | CAREER, COURSE, EVENT, RESEARCH, NEWS |
| `contentId` | String | | ID of the content record |
| `version` | Int | | Auto-incrementing per content item |
| `snapshot` | Json | | Full JSON snapshot of the record at that version |
| `changeNote` | String? | | Human-readable description of the change |
| `changedById` | String | FK → User | |
| `changedAt` | DateTime | Default: now() | |

**Unique constraint:** `(contentType, contentId, version)`
**Index:** `(contentType, contentId)`

---

## Junction Tables

### CareerSkill

| Field | FK | Cascade |
|-------|----|---------|
| `careerId` | Career.id | DELETE |
| `skillId` | Skill.id | DELETE |

**Composite PK:** `(careerId, skillId)`

### CourseSkill

| Field | FK | Cascade |
|-------|----|---------|
| `courseId` | Course.id | DELETE |
| `skillId` | Skill.id | DELETE |

**Composite PK:** `(courseId, skillId)`

### CourseCareer

| Field | FK | Cascade |
|-------|----|---------|
| `courseId` | Course.id | DELETE |
| `careerId` | Career.id | DELETE |

**Composite PK:** `(courseId, careerId)`

---

## Entity Relationship Diagram

```
                         ┌──────────┐
                    ┌───→│  Skill   │←───┐
                    │    └──────────┘    │
               CareerSkill          CourseSkill
                    │                    │
              ┌─────┴─────┐       ┌─────┴─────┐
              │  Career    │←─────→│  Course    │
              └─────┬─────┘       └───────────┘
                    │  CourseCareer
           PathwayConnection
           (self-referential)
              from ↔ to

  ┌──────────┐  ┌───────────┐  ┌─────────────────┐
  │  Event   │  │  Research  │  │  NewsArticle     │
  └──────────┘  └───────────┘  └─────────────────┘

  ┌──────────────┐        ┌────────────────┐
  │ Registration │        │ ContentVersion │
  │ (soft FK to  │        │ (FK to User)   │
  │  Event/Course│        │ (tracks all    │
  │  via contentId)       │  content types)│
  └──────────────┘        └────────────────┘

  ┌──────────────────────┐
  │ DiagnosticQuestion   │
  │ (standalone, JSON    │
  │  scoring logic)      │
  └──────────────────────┘

  ┌──────────┐
  │   User   │──→ ContentVersion (changedBy)
  └──────────┘
```

---

## Seed Data

The seed script (`prisma/seed.ts`) populates the database from JSON files in `src/lib/data/`:

| Data File | Records | Notes |
|-----------|---------|-------|
| `skills.json` | 31 skills | Across 5 categories: Technical, Safety, Regulatory, Digital, Management |
| `careers.json` | 12 careers | Across 7 sectors with pathway connections and skill links |
| `courses.json` | 15 courses | From Irish universities, ETBs, Skillnet networks, private providers. Includes 2 free Skillnet-funded courses |
| `events.json` | 6 events | Conferences, webinars, workshops, roadshows |
| `research.json` | 5 items | Includes 2 key Irish policy documents |
| `news.json` | ~5 articles | Launch announcements and industry news |
| `diagnosticQuestions.json` | 15 questions | Mix of single-choice, multiple-choice, and scale questions with scoring logic |

**Default admin user created by seed:**
- Email: `admin@sowa.ie`
- Password: `changeme123` (bcrypt hashed)
- Role: `ADMIN`

### Seed Execution Order

1. Skills (no dependencies)
2. Careers (no dependencies)
3. CareerSkill links (depends on 1, 2)
4. PathwayConnections (depends on 2)
5. Courses (no dependencies)
6. CourseSkill links (depends on 1, 5)
7. CourseCareer links (depends on 2, 5)
8. Events (no dependencies)
9. Research (no dependencies)
10. News (no dependencies)
11. DiagnosticQuestions (no dependencies)
12. Admin User (no dependencies)

---

## Migrations

| Migration | Date | Description |
|-----------|------|-------------|
| `20260404112931_init` | 4 Apr 2026 | Initial schema: all enums, 12 tables, indexes, constraints |
| `20260404115459_add_registrations` | 4 Apr 2026 | Registration system: RegistrationType/Status enums, registrations table with indexes |
