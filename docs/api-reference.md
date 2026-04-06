# API Reference

Base URL: `/api`

All endpoints return JSON. Authenticated endpoints require a valid NextAuth JWT session cookie.

## Common Patterns

### Pagination

All list endpoints accept:

| Param   | Type   | Default | Description              |
| ------- | ------ | ------- | ------------------------ |
| `page`  | number | 1       | Page number (1-indexed)  |
| `limit` | number | 20      | Items per page (max 100) |

Response shape:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Rate Limiting

All endpoints are rate-limited (default: 60 requests / 60 seconds per IP). When exceeded:

```
HTTP 429 Too Many Requests
Headers:
  X-RateLimit-Limit: 60
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1712234567
  Retry-After: 45
```

### Error Responses

```json
{
  "error": "Human-readable message",
  "details": { ... }   // Optional, present on validation errors
}
```

| Code | Meaning                                  |
| ---- | ---------------------------------------- |
| 400  | Validation error or bad request          |
| 401  | Not authenticated                        |
| 403  | Insufficient permissions                 |
| 404  | Resource not found                       |
| 409  | Conflict (duplicate slug, capacity full) |
| 429  | Rate limit exceeded                      |
| 500  | Internal server error                    |

### Authentication Levels

| Level        | Description                   |
| ------------ | ----------------------------- |
| Public       | No auth required              |
| Auth         | Any authenticated user        |
| ADMIN/EDITOR | Requires ADMIN or EDITOR role |
| ADMIN        | Requires ADMIN role           |

---

## Careers

### GET /api/careers

List all careers with optional filtering.

**Auth:** Public

| Query Param  | Type   | Description                                               |
| ------------ | ------ | --------------------------------------------------------- |
| `sector`     | string | Filter by CareerSector enum value                         |
| `entryLevel` | string | Filter by EntryLevel enum value                           |
| `search`     | string | Search title and description                              |
| `status`     | string | Filter by content status                                  |
| `sortBy`     | string | `title`, `sector`, `entryLevel`, `createdAt`, `updatedAt` |
| `order`      | string | `asc` or `desc`                                           |

```bash
curl 'http://localhost:3000/api/careers?sector=MARINE_OPERATIONS&page=1&limit=10'
```

### POST /api/careers

Create a new career.

**Auth:** ADMIN / EDITOR

```bash
curl -X POST http://localhost:3000/api/careers \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "slug": "wind-turbine-technician",
    "title": "Wind Turbine Technician",
    "sector": "OPERATIONS_MAINTENANCE",
    "entryLevel": "ENTRY",
    "description": "Responsible for maintenance and repair of offshore wind turbines.",
    "qualifications": ["Level 6 Electrical/Mechanical qualification"],
    "skills": ["turbine-maintenance", "safety-at-heights"]
  }'
```

**Response:** `201 Created` with the full career object.

**Errors:** `409` if slug already exists.

### GET /api/careers/[slug]

Get a single career by slug.

**Auth:** Public

```bash
curl http://localhost:3000/api/careers/wind-turbine-technician
```

### PUT /api/careers/[slug]

Update a career. All fields optional.

**Auth:** ADMIN / EDITOR

```bash
curl -X PUT http://localhost:3000/api/careers/wind-turbine-technician \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "salaryRange": { "min": 35000, "max": 55000 },
    "changeNote": "Added salary range from industry survey"
  }'
```

Creates a content version snapshot automatically.

### DELETE /api/careers/[slug]

Delete a career and all related junction records (cascade).

**Auth:** ADMIN / EDITOR

```bash
curl -X DELETE http://localhost:3000/api/careers/wind-turbine-technician \
  -H 'Cookie: next-auth.session-token=...'
```

**Response:** `204 No Content`

---

## Courses

### GET /api/courses

List courses with advanced filtering.

**Auth:** Public

| Query Param    | Type    | Description                                                          |
| -------------- | ------- | -------------------------------------------------------------------- |
| `topic`        | string  | Filter by tag/category keyword                                       |
| `format`       | string  | DeliveryFormat enum (`IN_PERSON`, `ONLINE`, `BLENDED`, `SELF_PACED`) |
| `costMax`      | number  | Maximum cost in EUR                                                  |
| `freeOnly`     | boolean | Only show free courses (cost = 0)                                    |
| `provider`     | string  | Filter by provider name                                              |
| `providerType` | string  | ProviderType enum value                                              |
| `startingSoon` | boolean | Courses starting within 90 days                                      |
| `nfqLevel`     | number  | Filter by NFQ level                                                  |
| `search`       | string  | Search title and description                                         |
| `status`       | string  | Content status filter                                                |
| `sortBy`       | string  | `title`, `cost`, `nfqLevel`, `nextStartDate`, `createdAt`            |
| `order`        | string  | `asc` or `desc`                                                      |

```bash
curl 'http://localhost:3000/api/courses?format=ONLINE&freeOnly=true&sortBy=nextStartDate&order=asc'
```

### POST /api/courses

**Auth:** ADMIN / EDITOR

```bash
curl -X POST http://localhost:3000/api/courses \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "slug": "gwo-bst",
    "title": "GWO Basic Safety Training",
    "provider": "Malin Group",
    "providerType": "PRIVATE",
    "description": "Global Wind Organisation certified safety training.",
    "deliveryFormat": "IN_PERSON",
    "location": "Cork, Ireland",
    "duration": "5 days",
    "cost": 1500,
    "accredited": true,
    "certificationAwarded": "GWO BST Certificate",
    "skills": ["safety-at-heights", "sea-survival"],
    "careerRelevance": ["wind-turbine-technician"],
    "tags": ["safety", "gwo", "mandatory"]
  }'
```

### GET /api/courses/[slug]

**Auth:** Public

### PUT /api/courses/[slug]

Update a course. All fields optional (partial update).

**Auth:** ADMIN / EDITOR

```bash
curl -X PUT http://localhost:3000/api/courses/gwo-bst \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "cost": 1350,
    "nextStartDate": "2026-05-12T09:00:00.000Z",
    "tags": ["safety", "gwo", "mandatory", "summer-intake"],
    "changeNote": "Summer intake pricing and date"
  }'
```

Creates a content version snapshot automatically.

### DELETE /api/courses/[slug]

**Auth:** ADMIN / EDITOR

```bash
curl -X DELETE http://localhost:3000/api/courses/gwo-bst \
  -H 'Cookie: next-auth.session-token=...'
```

**Response:** `204 No Content`

---

## Events

### GET /api/events

| Query Param    | Type    | Description                               |
| -------------- | ------- | ----------------------------------------- |
| `type`         | string  | EventType enum                            |
| `locationType` | string  | `PHYSICAL`, `VIRTUAL`, `HYBRID`           |
| `upcoming`     | boolean | Only future events                        |
| `search`       | string  | Search title and description              |
| `sortBy`       | string  | `title`, `startDate`, `type`, `createdAt` |

```bash
curl 'http://localhost:3000/api/events?upcoming=true&type=CONFERENCE'
```

### POST /api/events

**Auth:** ADMIN / EDITOR

```bash
curl -X POST http://localhost:3000/api/events \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "slug": "owe-skills-summit-2026",
    "title": "OWE Skills Summit 2026",
    "type": "CONFERENCE",
    "startDate": "2026-09-15T09:00:00.000Z",
    "endDate": "2026-09-16T17:00:00.000Z",
    "locationType": "PHYSICAL",
    "location": "Convention Centre Dublin",
    "description": "Annual conference on offshore wind skills development.",
    "capacity": 500
  }'
```

### GET /api/events/[slug]

**Auth:** Public

```bash
curl http://localhost:3000/api/events/owe-skills-summit-2026
```

### PUT /api/events/[slug]

Update an event. All fields optional (partial update).

**Auth:** ADMIN / EDITOR

```bash
curl -X PUT http://localhost:3000/api/events/owe-skills-summit-2026 \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "capacity": 650,
    "locationType": "HYBRID",
    "changeNote": "Expanded capacity and added virtual attendance"
  }'
```

Creates a content version snapshot automatically.

### DELETE /api/events/[slug]

**Auth:** ADMIN / EDITOR

```bash
curl -X DELETE http://localhost:3000/api/events/owe-skills-summit-2026 \
  -H 'Cookie: next-auth.session-token=...'
```

**Response:** `204 No Content`

---

## News

### GET /api/news

| Query Param | Type   | Description                              |
| ----------- | ------ | ---------------------------------------- |
| `category`  | string | Filter by news category                  |
| `search`    | string | Search title and content                 |
| `sortBy`    | string | `title`, `date`, `category`, `createdAt` |

### POST /api/news

**Auth:** ADMIN / EDITOR

```bash
curl -X POST http://localhost:3000/api/news \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "slug": "sowa-launch-announcement",
    "title": "SOWA Platform Launches",
    "date": "2026-04-01T00:00:00.000Z",
    "excerpt": "The Skillnet Offshore Wind Academy launches its new careers platform.",
    "content": "<p>Full article HTML content...</p>",
    "category": "Announcements",
    "author": "SOWA Team"
  }'
```

### GET/PUT/DELETE /api/news/[slug]

Same patterns as Careers.

---

## Research

### GET /api/research

| Query Param | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| `category`  | string  | Filter by research category                       |
| `featured`  | boolean | Only featured items                               |
| `search`    | string  | Search title and summary                          |
| `sortBy`    | string  | `title`, `publicationDate`, `author`, `createdAt` |

### POST /api/research

**Auth:** ADMIN / EDITOR

```bash
curl -X POST http://localhost:3000/api/research \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "slug": "owe-workforce-analysis-2026",
    "title": "Offshore Wind Workforce Analysis 2026",
    "author": "SOLAS",
    "organisation": "Department of Further and Higher Education",
    "publicationDate": "2026-03-01T00:00:00.000Z",
    "summary": "Analysis of workforce requirements for Irish offshore wind targets.",
    "categories": ["Policy", "Workforce Planning"],
    "isFeatured": true
  }'
```

### GET/PUT/DELETE /api/research/[slug]

Same patterns as Careers.

---

## Diagnostic

### GET /api/diagnostic/questions

Retrieve all diagnostic assessment questions.

**Auth:** Public

```bash
curl http://localhost:3000/api/diagnostic/questions
```

**Response:**

```json
{
  "data": [
    {
      "id": "q1",
      "text": "What is your current level of experience in the energy sector?",
      "type": "single_choice",
      "options": [
        { "label": "No experience", "value": "none", "scoreImpact": { "industry-knowledge": 0 } },
        { "label": "1-3 years", "value": "junior", "scoreImpact": { "industry-knowledge": 3 } }
      ]
    },
    {
      "id": "q10",
      "text": "Rate your proficiency with data analysis tools",
      "type": "scale",
      "scaleMin": 1,
      "scaleMax": 5,
      "scaleLabels": { "1": "Beginner", "5": "Expert" }
    }
  ]
}
```

### POST /api/diagnostic/results

Submit answers and receive career/course recommendations.

**Auth:** Public

If `contact` is provided with `consent: true`, the top 3 skill gaps and recommended career slugs are synced to HubSpot asynchronously. Sync failures are logged and do not affect the response.

**Request fields:**

| Field             | Type                                 | Required | Notes                                             |
| ----------------- | ------------------------------------ | -------- | ------------------------------------------------- |
| `answers`         | `Record<string, string \| string[]>` | yes      | Keyed by question id                              |
| `contact.email`   | string (email)                       | no       | Required if `contact` is present                  |
| `contact.name`    | string                               | no       | Required if `contact` is present                  |
| `contact.consent` | `true` (literal)                     | no       | Must be `true`; omit `contact` entirely otherwise |

```bash
# Minimal — anonymous
curl -X POST http://localhost:3000/api/diagnostic/results \
  -H 'Content-Type: application/json' \
  -d '{
    "answers": {
      "q1": "junior",
      "q2": ["safety", "electrical"],
      "q10": "3"
    }
  }'

# With consented contact sync to HubSpot
curl -X POST http://localhost:3000/api/diagnostic/results \
  -H 'Content-Type: application/json' \
  -d '{
    "answers": { "q1": "junior", "q10": "3" },
    "contact": {
      "email": "jane@example.com",
      "name": "Jane Doe",
      "consent": true
    }
  }'
```

**Response:**

```json
{
  "scores": { "safety-at-heights": 7, "electrical-systems": 4 },
  "maxPossible": { "safety-at-heights": 10, "electrical-systems": 10 },
  "gaps": [
    {
      "skill": { "slug": "electrical-systems", "name": "Electrical Systems", "category": "Technical" },
      "score": 4,
      "maxScore": 10,
      "severity": "high"
    }
  ],
  "recommendedCareers": [ ... ],
  "recommendedCourses": [ ... ]
}
```

---

## Registrations

### POST /api/registrations

Public registration for events or courses.

**Auth:** Public

```bash
curl -X POST http://localhost:3000/api/registrations \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "EVENT",
    "contentId": "clx1abc123...",
    "name": "Jane Murphy",
    "email": "jane@example.ie",
    "phone": "+353 87 123 4567",
    "organisation": "ESB",
    "role": "Engineer",
    "gdprConsent": true
  }'
```

**Validation:**

- EVENT registrations check capacity against active (non-cancelled) registrations
- `gdprConsent` must be `true`

**Errors:** `404` content not found, `409` event at full capacity.

### GET /api/admin/registrations

List registrations with filtering.

**Auth:** ADMIN / EDITOR / VIEWER

| Query Param | Type   | Description                         |
| ----------- | ------ | ----------------------------------- |
| `type`      | string | `EVENT` or `COURSE`                 |
| `contentId` | string | Filter by specific event/course     |
| `status`    | string | `PENDING`, `CONFIRMED`, `CANCELLED` |
| `dateFrom`  | string | ISO date                            |
| `dateTo`    | string | ISO date                            |
| `search`    | string | Search name and email               |
| `sortBy`    | string | Default `createdAt`                 |
| `order`     | string | Default `desc`                      |

```bash
curl 'http://localhost:3000/api/admin/registrations?type=EVENT&status=PENDING' \
  -H 'Cookie: next-auth.session-token=...'
```

### PATCH /api/admin/registrations/[id]

Update registration status.

**Auth:** ADMIN / EDITOR

```bash
curl -X PATCH http://localhost:3000/api/admin/registrations/clx1abc123 \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{ "status": "CONFIRMED" }'
```

### GET /api/admin/registrations/export

Export registrations as CSV.

**Auth:** ADMIN only

```bash
curl 'http://localhost:3000/api/admin/registrations/export?type=EVENT&contentId=clx1abc123' \
  -H 'Cookie: next-auth.session-token=...' \
  -o registrations.csv
```

**Response:** `text/csv` with headers: ID, Type, Content ID, Name, Email, Phone, Organisation, Role, Dietary Requirements, Additional Notes, GDPR Consent, Status, Created At.

---

## Users

### GET /api/users

List all users.

**Auth:** ADMIN

```bash
curl http://localhost:3000/api/users \
  -H 'Cookie: next-auth.session-token=...'
```

### POST /api/users

Create a new user.

**Auth:** ADMIN

```bash
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "email": "editor@sowa.ie",
    "name": "Content Editor",
    "password": "securepassword123",
    "role": "EDITOR"
  }'
```

Password is hashed with bcrypt before storage.

### PATCH /api/users/[id]

**Auth:** ADMIN. All fields optional.

### DELETE /api/users/[id]

**Auth:** ADMIN. Returns `200 { success: true }`.

---

## Skills

### GET /api/skills

**Auth:** Public

| Query Param | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `category`  | string | SkillCategory enum              |
| `search`    | string | Search name                     |
| `sortBy`    | string | `name`, `category`, `createdAt` |

### POST /api/skills

Create a new skill.

**Auth:** ADMIN or EDITOR

```bash
curl -X POST http://localhost:3000/api/skills \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{ "slug": "blade-inspection", "name": "Blade Inspection", "category": "TECHNICAL" }'
```

Returns `401 Unauthorized` if no session, `403 Forbidden` if the session user is not ADMIN or EDITOR.

---

## Search

### GET /api/search

Global search across all published content types.

**Auth:** Public

| Query Param | Type   | Description                                               |
| ----------- | ------ | --------------------------------------------------------- |
| `q`         | string | **Required.** Search query                                |
| `type`      | string | Optional. `career`, `course`, `event`, `research`, `news` |
| `page`      | number | Default 1                                                 |
| `limit`     | number | Default 20                                                |

```bash
curl 'http://localhost:3000/api/search?q=safety+training&type=course'
```

**Response:**

```json
{
  "data": [
    { "type": "course", "slug": "gwo-bst", "title": "GWO Basic Safety Training", "excerpt": "..." }
  ],
  "pagination": { ... }
}
```

---

## Content Status

### POST /api/content-status

Transition content between publishing states.

**Auth:** ADMIN / EDITOR

```bash
curl -X POST http://localhost:3000/api/content-status \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "contentType": "CAREER",
    "slug": "wind-turbine-technician",
    "newStatus": "PUBLISHED",
    "changeNote": "Approved for publication"
  }'
```

For scheduled publishing:

```bash
curl -X POST http://localhost:3000/api/content-status \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=...' \
  -d '{
    "contentType": "NEWS",
    "slug": "launch-announcement",
    "newStatus": "PUBLISHED",
    "publishAt": "2026-05-01T09:00:00.000Z"
  }'
```

### PUT /api/content-status

Auto-publish scheduled content. Called by a cron job or external scheduler.

**Auth:** Public (system endpoint)

```bash
curl -X PUT http://localhost:3000/api/content-status
```

**Response:** `{ "publishedCount": 3 }`

---

## Content Versions

### GET /api/versions

List version history for a piece of content.

**Auth:** Any authenticated user

| Query Param   | Type   | Description                                     |
| ------------- | ------ | ----------------------------------------------- |
| `contentType` | string | `CAREER`, `COURSE`, `EVENT`, `RESEARCH`, `NEWS` |
| `contentId`   | string | The record ID                                   |

```bash
curl 'http://localhost:3000/api/versions?contentType=CAREER&contentId=clx1abc123' \
  -H 'Cookie: next-auth.session-token=...'
```

### GET /api/versions/[id]

Get a specific version snapshot.

**Auth:** Any authenticated user

---

## Media

### POST /api/media

Upload an image file.

**Auth:** Any authenticated user

```bash
curl -X POST http://localhost:3000/api/media \
  -H 'Cookie: next-auth.session-token=...' \
  -F 'file=@hero-image.jpg'
```

**Constraints:**

- Allowed types: JPEG, PNG, GIF, WebP, SVG
- Max size: 5 MB
- Filename sanitised and timestamped

**Response:** `201 { filename, url, size }`

### GET /api/media

List all uploaded media files.

**Auth:** Any authenticated user

### DELETE /api/media?filename=hero-image-1712234567.jpg

Delete a media file. Path traversal protected.

**Auth:** Any authenticated user

---

## Newsletter

### POST /api/newsletter

Subscribe to the SOWA newsletter with optional topic preferences.

**Auth:** Public

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.ie",
    "topics": ["careers", "events", "policy"]
  }'
```

| Field    | Type     | Required | Description                      |
| -------- | -------- | -------- | -------------------------------- |
| `email`  | string   | Yes      | Valid email address              |
| `topics` | string[] | No       | Interest topics (defaults to []) |

**Response:** `201 { message, email, topics }`

Silently syncs to HubSpot if `HUBSPOT_API_KEY` is configured (non-blocking — HubSpot failures do not fail the request).

---

## Diagnostic AI Summary

### POST /api/diagnostic/summary

Generate an AI-powered personalised career guidance summary from diagnostic results.

**Auth:** Public

**Feature gate:** Requires `AI_SUMMARY_ENABLED=true` environment variable. Returns `403` if disabled.

**AI providers:** Anthropic Claude Haiku (preferred) or OpenAI GPT-4o-mini (fallback). At least one API key must be configured.

```bash
curl -X POST http://localhost:3000/api/diagnostic/summary \
  -H 'Content-Type: application/json' \
  -d '{
    "background": {
      "currentSituation": "transitioning from oil and gas",
      "experienceLevel": "mid-career",
      "interestArea": "operations and maintenance"
    },
    "gaps": [
      { "skillName": "GWO Safety Training", "severity": "high", "scorePercent": 20 }
    ],
    "recommendedCareers": [
      { "title": "Wind Turbine Technician", "sector": "Operations & Maintenance", "entryLevel": "Entry" }
    ],
    "recommendedCourses": [
      { "title": "GWO Basic Safety Training", "provider": "Malin Group", "duration": "5 days", "cost": 1500 }
    ],
    "overallScorePercent": 45
  }'
```

**Response:** `200 { summary: "Personalised 200-word guidance paragraph..." }`

**Errors:** `403` feature disabled, `503` no AI API key configured, `500` AI generation failed.

---

## HubSpot Integration

### GET /api/admin/hubspot/status

Check HubSpot CRM sync status.

**Auth:** Any authenticated user

```bash
curl http://localhost:3000/api/admin/hubspot/status \
  -H 'Cookie: next-auth.session-token=...'
```

---

## Authentication

### POST /api/auth/[...nextauth]

Handled by NextAuth.js. Supports:

- `POST /api/auth/signin` — Sign in with credentials
- `POST /api/auth/signout` — Sign out
- `GET /api/auth/session` — Get current session

Authentication uses JWT session strategy. Tokens include `id`, `email`, `name`, and `role`.
