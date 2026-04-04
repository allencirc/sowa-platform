import { describe, it, expect } from "vitest";
import {
  createCareerSchema,
  updateCareerSchema,
  createCourseSchema,
  updateCourseSchema,
  createEventSchema,
  updateEventSchema,
  createResearchSchema,
  updateResearchSchema,
  createNewsSchema,
  updateNewsSchema,
  createSkillSchema,
  createRegistrationSchema,
  diagnosticAnswersSchema,
  searchSchema,
  paginationSchema,
  courseFiltersSchema,
  careerFiltersSchema,
  eventFiltersSchema,
  statusTransitionSchema,
  ContentStatusEnum,
  CareerSectorEnum,
  EntryLevelEnum,
  DeliveryFormatEnum,
  EventTypeEnum,
  LocationTypeEnum,
  SkillCategoryEnum,
} from "@/lib/validations";

// ── Enum schemas ─────────────────────────────────────────

describe("Enum schemas", () => {
  it("CareerSectorEnum accepts all valid sectors", () => {
    const sectors = [
      "Operations & Maintenance",
      "Marine Operations",
      "Survey & Design",
      "Health, Safety & Environment",
      "Electrical",
      "Policy & Regulation",
      "Project Management",
    ];
    for (const s of sectors) {
      expect(CareerSectorEnum.safeParse(s).success).toBe(true);
    }
  });

  it("CareerSectorEnum rejects invalid sector", () => {
    expect(CareerSectorEnum.safeParse("Fishing").success).toBe(false);
  });

  it("EntryLevelEnum accepts all valid levels", () => {
    for (const level of ["Apprentice", "Entry", "Mid", "Senior", "Leadership"]) {
      expect(EntryLevelEnum.safeParse(level).success).toBe(true);
    }
  });

  it("DeliveryFormatEnum accepts all valid formats", () => {
    for (const f of ["In-Person", "Online", "Blended", "Self-Paced"]) {
      expect(DeliveryFormatEnum.safeParse(f).success).toBe(true);
    }
  });

  it("EventTypeEnum accepts all valid event types", () => {
    for (const t of ["Workshop", "Webinar", "Conference", "Networking", "Training", "Roadshow"]) {
      expect(EventTypeEnum.safeParse(t).success).toBe(true);
    }
  });

  it("LocationTypeEnum accepts all valid location types", () => {
    for (const l of ["Physical", "Virtual", "Hybrid"]) {
      expect(LocationTypeEnum.safeParse(l).success).toBe(true);
    }
  });

  it("SkillCategoryEnum accepts all valid categories", () => {
    for (const c of ["Technical", "Safety", "Regulatory", "Digital", "Management"]) {
      expect(SkillCategoryEnum.safeParse(c).success).toBe(true);
    }
  });

  it("ContentStatusEnum accepts workflow statuses", () => {
    for (const s of ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]) {
      expect(ContentStatusEnum.safeParse(s).success).toBe(true);
    }
  });
});

// ── Career schemas ───────────────────────────────────────

describe("createCareerSchema", () => {
  const validCareer = {
    slug: "test-career",
    title: "Test Career",
    sector: "Electrical",
    entryLevel: "Entry",
    description: "A test career description.",
    qualifications: ["Level 6 Cert"],
    skills: ["mechanical-systems"],
  };

  it("accepts a valid career", () => {
    expect(createCareerSchema.safeParse(validCareer).success).toBe(true);
  });

  it("accepts career with optional fields", () => {
    const result = createCareerSchema.safeParse({
      ...validCareer,
      salaryRange: { min: 30000, max: 60000 },
      keyResponsibilities: ["Task 1", "Task 2"],
      workingConditions: "Offshore",
      growthOutlook: "Strong",
      pathwayConnections: [
        { to: "senior-career", type: "progression", timeframe: "3-5 years" },
      ],
      relatedCourses: ["course-1"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required slug", () => {
    const { slug, ...rest } = validCareer;
    expect(createCareerSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid slug format", () => {
    expect(
      createCareerSchema.safeParse({ ...validCareer, slug: "Has Spaces!" }).success
    ).toBe(false);
  });

  it("rejects empty qualifications array", () => {
    expect(
      createCareerSchema.safeParse({ ...validCareer, qualifications: [] }).success
    ).toBe(false);
  });

  it("rejects empty skills array", () => {
    expect(
      createCareerSchema.safeParse({ ...validCareer, skills: [] }).success
    ).toBe(false);
  });

  it("rejects invalid sector", () => {
    expect(
      createCareerSchema.safeParse({ ...validCareer, sector: "InvalidSector" }).success
    ).toBe(false);
  });

  it("rejects negative salary", () => {
    expect(
      createCareerSchema.safeParse({
        ...validCareer,
        salaryRange: { min: -1000, max: 50000 },
      }).success
    ).toBe(false);
  });
});

describe("updateCareerSchema", () => {
  it("accepts partial updates", () => {
    expect(updateCareerSchema.safeParse({ title: "Updated" }).success).toBe(true);
  });

  it("accepts empty object (no updates)", () => {
    expect(updateCareerSchema.safeParse({}).success).toBe(true);
  });

  it("rejects invalid sector in partial update", () => {
    expect(
      updateCareerSchema.safeParse({ sector: "InvalidSector" }).success
    ).toBe(false);
  });
});

// ── Course schemas ───────────────────────────────────────

describe("createCourseSchema", () => {
  const validCourse = {
    slug: "test-course",
    title: "Test Course",
    provider: "Test Provider",
    providerType: "University",
    description: "A test course.",
    deliveryFormat: "Online",
    duration: "12 weeks",
    cost: 1500,
    skills: ["data-analysis"],
    careerRelevance: ["data-analyst"],
    tags: ["data"],
  };

  it("accepts a valid course", () => {
    expect(createCourseSchema.safeParse(validCourse).success).toBe(true);
  });

  it("accepts course with cost 0 (free)", () => {
    expect(
      createCourseSchema.safeParse({ ...validCourse, cost: 0 }).success
    ).toBe(true);
  });

  it("accepts NFQ level in valid range", () => {
    expect(
      createCourseSchema.safeParse({ ...validCourse, nfqLevel: 7 }).success
    ).toBe(true);
  });

  it("rejects NFQ level out of range", () => {
    expect(
      createCourseSchema.safeParse({ ...validCourse, nfqLevel: 0 }).success
    ).toBe(false);
    expect(
      createCourseSchema.safeParse({ ...validCourse, nfqLevel: 11 }).success
    ).toBe(false);
  });

  it("rejects negative cost", () => {
    expect(
      createCourseSchema.safeParse({ ...validCourse, cost: -100 }).success
    ).toBe(false);
  });

  it("accepts ISO date format for nextStartDate", () => {
    expect(
      createCourseSchema.safeParse({
        ...validCourse,
        nextStartDate: "2025-09-01",
      }).success
    ).toBe(true);
  });

  it("rejects invalid providerType", () => {
    expect(
      createCourseSchema.safeParse({ ...validCourse, providerType: "FakeProvider" }).success
    ).toBe(false);
  });
});

// ── Event schemas ────────────────────────────────────────

describe("createEventSchema", () => {
  const validEvent = {
    slug: "test-event",
    title: "Test Event",
    type: "Workshop",
    startDate: "2025-10-01T09:00:00Z",
    locationType: "Physical",
    description: "A workshop event.",
  };

  it("accepts a valid event", () => {
    expect(createEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("accepts event with optional fields", () => {
    expect(
      createEventSchema.safeParse({
        ...validEvent,
        endDate: "2025-10-01T17:00:00Z",
        location: "Dublin, Ireland",
        capacity: 50,
      }).success
    ).toBe(true);
  });

  it("rejects invalid event type", () => {
    expect(
      createEventSchema.safeParse({ ...validEvent, type: "Party" }).success
    ).toBe(false);
  });

  it("rejects capacity of 0", () => {
    expect(
      createEventSchema.safeParse({ ...validEvent, capacity: 0 }).success
    ).toBe(false);
  });
});

// ── Research schemas ─────────────────────────────────────

describe("createResearchSchema", () => {
  const validResearch = {
    slug: "test-research",
    title: "Test Research Paper",
    author: "Dr. Test",
    organisation: "Test Institute",
    publicationDate: "2025-06-15",
    summary: "A summary of the research.",
    categories: ["policy"],
  };

  it("accepts valid research", () => {
    expect(createResearchSchema.safeParse(validResearch).success).toBe(true);
  });

  it("rejects empty categories", () => {
    expect(
      createResearchSchema.safeParse({ ...validResearch, categories: [] }).success
    ).toBe(false);
  });

  it("rejects invalid image URL", () => {
    expect(
      createResearchSchema.safeParse({
        ...validResearch,
        image: "not-a-url",
      }).success
    ).toBe(false);
  });
});

// ── News schemas ─────────────────────────────────────────

describe("createNewsSchema", () => {
  const validNews = {
    slug: "test-news",
    title: "Test News Article",
    date: "2025-06-15",
    excerpt: "A short excerpt.",
    content: "Full content here.",
    category: "Industry",
    author: "Test Author",
  };

  it("accepts valid news", () => {
    expect(createNewsSchema.safeParse(validNews).success).toBe(true);
  });

  it("rejects missing content", () => {
    const { content, ...rest } = validNews;
    expect(createNewsSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts valid image URL", () => {
    expect(
      createNewsSchema.safeParse({
        ...validNews,
        image: "https://example.com/image.jpg",
      }).success
    ).toBe(true);
  });
});

// ── Skill schema ─────────────────────────────────────────

describe("createSkillSchema", () => {
  it("accepts valid skill", () => {
    expect(
      createSkillSchema.safeParse({
        slug: "test-skill",
        name: "Test Skill",
        category: "Technical",
      }).success
    ).toBe(true);
  });

  it("rejects invalid category", () => {
    expect(
      createSkillSchema.safeParse({
        slug: "test-skill",
        name: "Test Skill",
        category: "Cooking",
      }).success
    ).toBe(false);
  });

  it("rejects name longer than 100 chars", () => {
    expect(
      createSkillSchema.safeParse({
        slug: "test-skill",
        name: "A".repeat(101),
        category: "Technical",
      }).success
    ).toBe(false);
  });
});

// ── Registration schema ──────────────────────────────────

describe("createRegistrationSchema", () => {
  const validReg = {
    type: "EVENT",
    contentId: "event-123",
    name: "John Doe",
    email: "john@example.com",
    gdprConsent: true,
  };

  it("accepts valid registration", () => {
    expect(createRegistrationSchema.safeParse(validReg).success).toBe(true);
  });

  it("rejects without GDPR consent", () => {
    expect(
      createRegistrationSchema.safeParse({ ...validReg, gdprConsent: false }).success
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createRegistrationSchema.safeParse({ ...validReg, email: "not-email" }).success
    ).toBe(false);
  });

  it("rejects invalid registration type", () => {
    expect(
      createRegistrationSchema.safeParse({ ...validReg, type: "WEBINAR" }).success
    ).toBe(false);
  });

  it("rejects additionalNotes exceeding 1000 chars", () => {
    expect(
      createRegistrationSchema.safeParse({
        ...validReg,
        additionalNotes: "A".repeat(1001),
      }).success
    ).toBe(false);
  });

  it("accepts with all optional fields", () => {
    expect(
      createRegistrationSchema.safeParse({
        ...validReg,
        phone: "+353861234567",
        organisation: "Wind Corp",
        role: "Engineer",
        dietaryRequirements: "Vegetarian",
        additionalNotes: "Looking forward to it.",
      }).success
    ).toBe(true);
  });
});

// ── Diagnostic answers schema ────────────────────────────

describe("diagnosticAnswersSchema", () => {
  it("accepts string answers", () => {
    expect(
      diagnosticAnswersSchema.safeParse({
        answers: { q1: "3", q2: "gwo" },
      }).success
    ).toBe(true);
  });

  it("accepts array answers (multiple choice)", () => {
    expect(
      diagnosticAnswersSchema.safeParse({
        answers: { q3: ["scada", "gis"] },
      }).success
    ).toBe(true);
  });

  it("accepts mixed string and array answers", () => {
    expect(
      diagnosticAnswersSchema.safeParse({
        answers: { q1: "3", q3: ["scada"] },
      }).success
    ).toBe(true);
  });

  it("rejects missing answers key", () => {
    expect(diagnosticAnswersSchema.safeParse({}).success).toBe(false);
  });
});

// ── Search schema ────────────────────────────────────────

describe("searchSchema", () => {
  it("accepts valid search query", () => {
    expect(searchSchema.safeParse({ q: "wind" }).success).toBe(true);
  });

  it("accepts search with type filter", () => {
    expect(
      searchSchema.safeParse({ q: "wind", type: "career" }).success
    ).toBe(true);
  });

  it("rejects empty query", () => {
    expect(searchSchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("rejects invalid type filter", () => {
    expect(
      searchSchema.safeParse({ q: "wind", type: "invalid" }).success
    ).toBe(false);
  });
});

// ── Pagination schema ────────────────────────────────────

describe("paginationSchema", () => {
  it("provides defaults", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("rejects page 0", () => {
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit over 100", () => {
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = paginationSchema.parse({ page: "3", limit: "50" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });
});

// ── Course filters schema ────────────────────────────────

describe("courseFiltersSchema", () => {
  it("accepts empty filters", () => {
    expect(courseFiltersSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid format filter", () => {
    expect(
      courseFiltersSchema.safeParse({ format: "Online" }).success
    ).toBe(true);
  });

  it("rejects invalid format", () => {
    expect(
      courseFiltersSchema.safeParse({ format: "Invalid" }).success
    ).toBe(false);
  });

  it("coerces freeOnly from string", () => {
    const result = courseFiltersSchema.parse({ freeOnly: "true" });
    expect(result.freeOnly).toBe(true);
  });

  it("accepts NFQ level", () => {
    expect(
      courseFiltersSchema.safeParse({ nfqLevel: "7" }).success
    ).toBe(true);
  });
});

// ── Status transition schema ─────────────────────────────

describe("statusTransitionSchema", () => {
  it("accepts valid status transition", () => {
    expect(
      statusTransitionSchema.safeParse({ status: "PUBLISHED" }).success
    ).toBe(true);
  });

  it("accepts status with publishAt", () => {
    expect(
      statusTransitionSchema.safeParse({
        status: "PUBLISHED",
        publishAt: "2025-10-01T09:00:00Z",
      }).success
    ).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(
      statusTransitionSchema.safeParse({ status: "DELETED" }).success
    ).toBe(false);
  });
});
