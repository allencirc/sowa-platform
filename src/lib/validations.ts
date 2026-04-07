import { z } from "zod";

// ─── Shared enums ────────────────────────────────────────

export const CareerSectorEnum = z.enum([
  "Operations & Maintenance",
  "Marine Operations",
  "Survey & Design",
  "Health, Safety & Environment",
  "Electrical",
  "Policy & Regulation",
  "Project Management",
]);

export const EntryLevelEnum = z.enum(["Apprentice", "Entry", "Mid", "Senior", "Leadership"]);

export const ProviderTypeEnum = z.enum([
  "University",
  "ETB",
  "Private",
  "Industry",
  "Skillnet_Network",
  "Government",
]);

export const DeliveryFormatEnum = z.enum(["In-Person", "Online", "Blended", "Self-Paced"]);

export const EventTypeEnum = z.enum([
  "Workshop",
  "Webinar",
  "Conference",
  "Networking",
  "Training",
  "Roadshow",
]);

export const LocationTypeEnum = z.enum(["Physical", "Virtual", "Hybrid"]);

export const SkillCategoryEnum = z.enum([
  "Technical",
  "Safety",
  "Regulatory",
  "Digital",
  "Management",
]);

export const PathwayTypeEnum = z.enum(["progression", "lateral", "specialisation"]);

export const DiagnosticQuestionTypeEnum = z.enum(["single_choice", "multiple_choice", "scale"]);

// ─── Content workflow enums ─────────────────────────────

export const ContentStatusEnum = z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]);

export const ContentTypeEnum = z.enum(["CAREER", "COURSE", "EVENT", "RESEARCH", "NEWS"]);

// ─── Status transition schema ───────────────────────────

export const statusTransitionSchema = z.object({
  status: ContentStatusEnum,
  publishAt: z.string().datetime().optional().nullable(),
  rejectionNote: z.string().optional().nullable(),
});

// ─── Version schemas ────────────────────────────────────

export const versionFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const restoreVersionSchema = z.object({
  versionId: z.string().min(1),
  changeNote: z.string().optional(),
});

// ─── Pagination & sorting ────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

// ─── SEO fields (shared) ────────────────────────────────

export const seoFieldsSchema = z.object({
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(500).optional(),
});

// ─── Career schemas ──────────────────────────────────────

export const pathwayConnectionSchema = z.object({
  to: z.string().min(1),
  type: PathwayTypeEnum,
  timeframe: z.string().min(1),
});

export const createCareerSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    title: z.string().min(1).max(200),
    sector: CareerSectorEnum,
    entryLevel: EntryLevelEnum,
    description: z.string().min(1),
    salaryRange: z
      .object({
        min: z.number().int().min(0),
        max: z.number().int().min(0),
      })
      .optional(),
    keyResponsibilities: z.array(z.string()).optional(),
    qualifications: z.array(z.string().min(1)).min(1),
    workingConditions: z.string().optional(),
    growthOutlook: z.string().optional(),
    skills: z.array(z.string().min(1)).min(1),
    pathwayConnections: z.array(pathwayConnectionSchema).optional(),
    relatedCourses: z.array(z.string()).optional(),
  })
  .merge(seoFieldsSchema);

export const updateCareerSchema = createCareerSchema.omit({ slug: true }).partial();

export const draftCareerSchema = createCareerSchema
  .extend({
    description: z.string().optional(),
    qualifications: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    sector: CareerSectorEnum.optional(),
    entryLevel: EntryLevelEnum.optional(),
    // Empty number inputs produce NaN → null after JSON serialisation; accept that
    salaryRange: z
      .object({
        min: z.number().int().min(0).nullable().optional(),
        max: z.number().int().min(0).nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .merge(seoFieldsSchema);

export const careerFiltersSchema = paginationSchema.merge(sortSchema).extend({
  sector: CareerSectorEnum.optional(),
  entryLevel: EntryLevelEnum.optional(),
  search: z.string().optional(),
});

// ─── Course schemas ──────────────────────────────────────

export const createCourseSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/),
    title: z.string().min(1).max(300),
    provider: z.string().min(1),
    providerType: ProviderTypeEnum,
    description: z.string().min(1),
    entryRequirements: z.string().optional(),
    deliveryFormat: DeliveryFormatEnum,
    location: z.string().optional(),
    nfqLevel: z.number().int().min(1).max(10).nullable().optional(),
    duration: z.string().min(1),
    cost: z.number().min(0).default(0),
    costNotes: z.string().optional(),
    nextStartDate: z
      .string()
      .datetime()
      .optional()
      .or(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
      ),
    accredited: z.boolean().optional(),
    certificationAwarded: z.string().optional(),
    skills: z.array(z.string().min(1)),
    careerRelevance: z.array(z.string()),
    tags: z.array(z.string()),
  })
  .merge(seoFieldsSchema);

export const updateCourseSchema = createCourseSchema.omit({ slug: true }).partial();

export const draftCourseSchema = createCourseSchema
  .extend({
    provider: z.string().optional(),
    description: z.string().optional(),
    duration: z.string().optional(),
    skills: z.array(z.string()).optional(),
    careerRelevance: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    providerType: ProviderTypeEnum.optional(),
    deliveryFormat: DeliveryFormatEnum.optional(),
  })
  .merge(seoFieldsSchema);

export const courseFiltersSchema = paginationSchema.merge(sortSchema).extend({
  topic: z.string().optional(),
  format: DeliveryFormatEnum.optional(),
  costMax: z.coerce.number().min(0).optional(),
  freeOnly: z.coerce.boolean().optional(),
  provider: z.string().optional(),
  providerType: ProviderTypeEnum.optional(),
  startingSoon: z.coerce.boolean().optional(),
  nfqLevel: z.coerce.number().int().min(1).max(10).optional(),
  search: z.string().optional(),
});

// ─── Event schemas ───────────────────────────────────────

export const createEventSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/),
    title: z.string().min(1).max(300),
    type: EventTypeEnum,
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    locationType: LocationTypeEnum,
    location: z.string().optional(),
    description: z.string().min(1),
    capacity: z.number().int().min(1).optional(),
    image: z.string().url().optional(),
  })
  .merge(seoFieldsSchema);

export const updateEventSchema = createEventSchema.omit({ slug: true }).partial();

export const draftEventSchema = createEventSchema
  .extend({
    type: EventTypeEnum.optional(),
    startDate: z.string().optional(),
    locationType: LocationTypeEnum.optional(),
    description: z.string().optional(),
  })
  .merge(seoFieldsSchema);

export const eventFiltersSchema = paginationSchema.merge(sortSchema).extend({
  type: EventTypeEnum.optional(),
  locationType: LocationTypeEnum.optional(),
  upcoming: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ─── Research schemas ────────────────────────────────────

export const createResearchSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/),
    title: z.string().min(1).max(300),
    author: z.string().min(1),
    organisation: z.string().min(1),
    publicationDate: z.string().min(1),
    summary: z.string().min(1),
    categories: z.array(z.string().min(1)).min(1),
    isFeatured: z.boolean().optional(),
    image: z.string().url().optional(),
  })
  .merge(seoFieldsSchema);

export const updateResearchSchema = createResearchSchema.omit({ slug: true }).partial();

export const draftResearchSchema = createResearchSchema
  .extend({
    author: z.string().optional(),
    organisation: z.string().optional(),
    publicationDate: z.string().optional(),
    summary: z.string().optional(),
    categories: z.array(z.string()).optional(),
  })
  .merge(seoFieldsSchema);

export const researchFiltersSchema = paginationSchema.merge(sortSchema).extend({
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ─── News schemas ────────────────────────────────────────

export const createNewsSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/),
    title: z.string().min(1).max(300),
    date: z.string().min(1),
    excerpt: z.string().min(1),
    content: z.string().min(1),
    category: z.string().min(1),
    author: z.string().min(1),
    image: z.string().url().optional(),
  })
  .merge(seoFieldsSchema);

export const updateNewsSchema = createNewsSchema.omit({ slug: true }).partial();

export const draftNewsSchema = createNewsSchema
  .extend({
    date: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    category: z.string().optional(),
    author: z.string().optional(),
  })
  .merge(seoFieldsSchema);

export const newsFiltersSchema = paginationSchema.merge(sortSchema).extend({
  category: z.string().optional(),
  search: z.string().optional(),
});

// ─── Skill schemas ───────────────────────────────────────

export const createSkillSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  category: SkillCategoryEnum,
});

export const skillFiltersSchema = paginationSchema.merge(sortSchema).extend({
  category: SkillCategoryEnum.optional(),
  search: z.string().optional(),
});

// ─── Diagnostic schemas ──────────────────────────────────

export const diagnosticAnswersSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  // Optional contact info for HubSpot sync (only sent if user consents)
  contact: z
    .object({
      email: z.string().email(),
      name: z.string().min(1),
      consent: z.literal(true),
    })
    .optional(),
});

// ─── Registration schemas ───────────���───────────────────

export const RegistrationTypeEnum = z.enum(["EVENT", "COURSE"]);

export const RegistrationStatusEnum = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);

export const createRegistrationSchema = z.object({
  type: RegistrationTypeEnum,
  contentId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  organisation: z.string().optional(),
  role: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  additionalNotes: z.string().max(1000).optional(),
  gdprConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing to register",
  }),
});

export const updateRegistrationStatusSchema = z.object({
  status: RegistrationStatusEnum,
});

export const registrationFiltersSchema = paginationSchema.merge(sortSchema).extend({
  type: RegistrationTypeEnum.optional(),
  contentId: z.string().optional(),
  status: RegistrationStatusEnum.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

// ─── Search schema ─────���─────────────────────────��───────

export const searchSchema = paginationSchema.extend({
  q: z.string().min(1),
  type: z.enum(["career", "course", "event", "research", "news"]).optional(),
});
