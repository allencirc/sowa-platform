# Skills Taxonomy & ESCO Integration

## Overview

The SOWA platform maps its skill database to the **European Skills, Competences, Qualifications and Occupations (ESCO)** taxonomy, the EU reference classification for skills and occupations. This alignment:

- Demonstrates compliance with EU/Irish skills policy frameworks
- Enables transferable skill identification across adjacent industrial sectors
- Provides a common vocabulary for comparing skills across the offshore wind, maritime, construction, and energy sectors
- Supports the "Skills Bridge" feature that helps career changers understand their transferable skills

## Why ESCO?

ESCO is maintained by the European Commission and provides:

- **Persistent URIs** for each skill/competence/knowledge concept
- **Hierarchical classification** (4 levels) from broad to specific
- **Multi-language support** (27 EU languages)
- **Cross-sector applicability** — the same skill concept is used regardless of industry

For Ireland specifically, ESCO aligns with SOLAS/QQI frameworks and the National Skills Strategy.

## Database Schema

The `Skill` model in `prisma/schema.prisma` includes these ESCO fields:

| Field             | Type       | Description                                                     |
| ----------------- | ---------- | --------------------------------------------------------------- |
| `escoUri`         | `String?`  | ESCO concept URI (e.g., `http://data.europa.eu/esco/skill/...`) |
| `onetCode`        | `String?`  | O\*NET SOC code for US cross-reference                          |
| `isTransferable`  | `Boolean`  | Whether this skill transfers across sectors                     |
| `adjacentSectors` | `String[]` | Sectors where this skill is recognised                          |
| `escoLevel`       | `Int?`     | ESCO hierarchy level (1=broadest, 4=most specific)              |
| `escoType`        | `String?`  | `"skill/competence"` or `"knowledge"`                           |

## Mapping Approach

### Source of Truth

The curated mapping file at `src/lib/data/esco-mappings.json` is the single source of truth. Each entry maps a skill slug to its ESCO metadata:

```json
{
  "slug": "electrical-systems",
  "name": "Electrical Systems",
  "category": "Technical",
  "escoUri": "http://data.europa.eu/esco/skill/...",
  "onetCode": "47-2111.00",
  "isTransferable": true,
  "adjacentSectors": ["Maritime", "Construction", "Oil & Gas", "Renewable Energy"],
  "escoLevel": 3,
  "escoType": "skill/competence"
}
```

### Seeding

Run the ESCO seed script to populate/update the database:

```bash
npm run db:seed:esco
```

This upserts all 49 skills (31 original + 18 new OWE-specific) with their ESCO metadata. The script is idempotent and can be re-run safely.

### Adding New Skills

1. Add the skill entry to `src/lib/data/esco-mappings.json`
2. Look up the ESCO URI using the [ESCO API](https://ec.europa.eu/esco/api/search?text=SKILL_NAME&type=skill&language=en&limit=5)
3. Set `isTransferable` and `adjacentSectors` based on domain knowledge
4. Run `npm run db:seed:esco`

## Adjacent Sectors

The platform recognises 8 adjacent sectors for transferable skills:

| Sector            | Description                                   |
| ----------------- | --------------------------------------------- |
| Maritime          | Shipping, port operations, marine engineering |
| Construction      | Civil engineering, building trades            |
| Oil & Gas         | Upstream/downstream energy, petrochemicals    |
| Aerospace         | Aviation, spacecraft, defence aerospace       |
| Nuclear           | Nuclear power generation, decommissioning     |
| Renewable Energy  | Solar, wave, other renewables                 |
| Defence           | Military, naval, defence contracting          |
| Heavy Engineering | Manufacturing, industrial engineering         |

## Skills Bridge Feature

The Skills Bridge card on career detail pages shows career changers how their existing skills transfer:

1. User selects their current sector from a dropdown
2. The system matches career skills against the selected sector using `isTransferable` and `adjacentSectors`
3. Results display as two columns: "Your Existing Skills" (matched) and "Skills to Develop" (gaps)
4. A match percentage indicates overall transferability
5. Gap skills link to relevant training courses

### Match Algorithm

```
matchPercentage = round((matchedSkills.length / totalCareerSkills.length) * 100)
```

A skill matches if `skill.isTransferable === true` AND `skill.adjacentSectors.includes(selectedSector)`.

## API Endpoints

### GET /api/skills

Returns paginated skills list. Supports filters:

- `category` — filter by skill category
- `search` — full-text search on skill name
- `transferable` — filter to transferable skills only
- `sector` — filter by adjacent sector

### GET /api/skills/transferable?sector=Maritime

Returns all transferable skills for a given sector. Used by the Skills Bridge component.

## ESCO API Reference

- **Search endpoint:** `https://ec.europa.eu/esco/api/search?text={query}&type=skill&language=en`
- **Skill detail:** `https://ec.europa.eu/esco/api/resource/skill?uri={escoUri}`
- **Full documentation:** https://esco.ec.europa.eu/en/use-esco/esco-api
