import { prisma } from "./prisma";
import type {
  Career,
  Course,
  CourseFilters,
  DiagnosticQuestion,
  Event,
  NewsArticle,
  Research,
  SearchResult,
  Skill,
} from "./types";

// ─── Reverse enum maps (Prisma enum key → display string) ─

const sectorDisplay: Record<string, Career["sector"]> = {
  OPERATIONS_MAINTENANCE: "Operations & Maintenance",
  MARINE_OPERATIONS: "Marine Operations",
  SURVEY_DESIGN: "Survey & Design",
  HSE: "Health, Safety & Environment",
  ELECTRICAL: "Electrical",
  POLICY_REGULATION: "Policy & Regulation",
  PROJECT_MANAGEMENT: "Project Management",
};

const entryLevelDisplay: Record<string, Career["entryLevel"]> = {
  APPRENTICE: "Apprentice",
  ENTRY: "Entry",
  MID: "Mid",
  SENIOR: "Senior",
  LEADERSHIP: "Leadership",
};

const providerTypeDisplay: Record<string, Course["providerType"]> = {
  UNIVERSITY: "University",
  ETB: "ETB",
  PRIVATE: "Private",
  INDUSTRY: "Industry",
  SKILLNET_NETWORK: "Skillnet_Network",
  GOVERNMENT: "Government",
};

const deliveryFormatDisplay: Record<string, Course["deliveryFormat"]> = {
  IN_PERSON: "In-Person",
  ONLINE: "Online",
  BLENDED: "Blended",
  SELF_PACED: "Self-Paced",
};

const eventTypeDisplay: Record<string, Event["type"]> = {
  WORKSHOP: "Workshop",
  WEBINAR: "Webinar",
  CONFERENCE: "Conference",
  NETWORKING: "Networking",
  TRAINING: "Training",
  ROADSHOW: "Roadshow",
};

const locationTypeDisplay: Record<string, Event["locationType"]> = {
  PHYSICAL: "Physical",
  VIRTUAL: "Virtual",
  HYBRID: "Hybrid",
};

const skillCategoryDisplay: Record<string, Skill["category"]> = {
  TECHNICAL: "Technical",
  SAFETY: "Safety",
  REGULATORY: "Regulatory",
  DIGITAL: "Digital",
  MANAGEMENT: "Management",
};

const pathwayTypeDisplay: Record<string, string> = {
  PROGRESSION: "progression",
  LATERAL: "lateral",
  SPECIALISATION: "specialisation",
};

const diagnosticTypeDisplay: Record<string, DiagnosticQuestion["type"]> = {
  SINGLE_CHOICE: "single_choice",
  MULTIPLE_CHOICE: "multiple_choice",
  SCALE: "scale",
};

// Forward maps (display string → Prisma enum key) for queries
const sectorToEnum: Record<string, string> = {
  "Operations & Maintenance": "OPERATIONS_MAINTENANCE",
  "Marine Operations": "MARINE_OPERATIONS",
  "Survey & Design": "SURVEY_DESIGN",
  "Health, Safety & Environment": "HSE",
  Electrical: "ELECTRICAL",
  "Policy & Regulation": "POLICY_REGULATION",
  "Project Management": "PROJECT_MANAGEMENT",
};

const entryLevelToEnum: Record<string, string> = {
  Apprentice: "APPRENTICE",
  Entry: "ENTRY",
  Mid: "MID",
  Senior: "SENIOR",
  Leadership: "LEADERSHIP",
};

const providerTypeToEnum: Record<string, string> = {
  University: "UNIVERSITY",
  ETB: "ETB",
  Private: "PRIVATE",
  Industry: "INDUSTRY",
  Skillnet_Network: "SKILLNET_NETWORK",
  Government: "GOVERNMENT",
};

const deliveryFormatToEnum: Record<string, string> = {
  "In-Person": "IN_PERSON",
  Online: "ONLINE",
  Blended: "BLENDED",
  "Self-Paced": "SELF_PACED",
};

const eventTypeToEnum: Record<string, string> = {
  Workshop: "WORKSHOP",
  Webinar: "WEBINAR",
  Conference: "CONFERENCE",
  Networking: "NETWORKING",
  Training: "TRAINING",
  Roadshow: "ROADSHOW",
};

const locationTypeToEnum: Record<string, string> = {
  Physical: "PHYSICAL",
  Virtual: "VIRTUAL",
  Hybrid: "HYBRID",
};

// ─── Helpers: DB row → frontend type ──────────────────────

type AnyRecord = Record<string, unknown>;

function mapCareer(row: AnyRecord): Career {
  return {
    slug: row.slug as string,
    title: row.title as string,
    sector: sectorDisplay[row.sector as string] ?? (row.sector as Career["sector"]),
    entryLevel: entryLevelDisplay[row.entryLevel as string] ?? (row.entryLevel as Career["entryLevel"]),
    description: row.description as string,
    salaryRange:
      row.salaryMin != null && row.salaryMax != null
        ? { min: row.salaryMin as number, max: row.salaryMax as number }
        : undefined,
    keyResponsibilities: (row.keyResponsibilities as string[]) ?? [],
    qualifications: (row.qualifications as string[]) ?? [],
    workingConditions: (row.workingConditions as string) ?? undefined,
    growthOutlook: (row.growthOutlook as string) ?? undefined,
    skills: ((row.skills as { skill: { slug: string } }[]) ?? []).map(
      (s) => s.skill.slug
    ),
    pathwayConnections: (
      (row.pathwayFrom as { to: { slug: string }; type: string; timeframe: string }[]) ?? []
    ).map((p) => ({
      to: p.to.slug,
      type: (pathwayTypeDisplay[p.type] ?? p.type) as "progression" | "lateral" | "specialisation",
      timeframe: p.timeframe,
    })),
    relatedCourses: (
      (row.relatedCourses as { course: { slug: string } }[]) ?? []
    ).map((c) => c.course.slug),
  };
}

function mapCourse(row: AnyRecord): Course {
  return {
    slug: row.slug as string,
    title: row.title as string,
    provider: row.provider as string,
    providerType: providerTypeDisplay[row.providerType as string] ?? (row.providerType as Course["providerType"]),
    description: row.description as string,
    entryRequirements: (row.entryRequirements as string) ?? undefined,
    deliveryFormat: deliveryFormatDisplay[row.deliveryFormat as string] ?? (row.deliveryFormat as Course["deliveryFormat"]),
    location: (row.location as string) ?? undefined,
    nfqLevel: (row.nfqLevel as number | null) ?? undefined,
    duration: row.duration as string,
    cost: row.cost as number,
    costNotes: (row.costNotes as string) ?? undefined,
    nextStartDate: row.nextStartDate
      ? (row.nextStartDate as Date).toISOString().split("T")[0]
      : undefined,
    accredited: (row.accredited as boolean) ?? undefined,
    certificationAwarded:
      (row.certificationAwarded as string) ?? undefined,
    signupUrl: (row.signupUrl as string) ?? undefined,
    skills: ((row.skills as { skill: { slug: string } }[]) ?? []).map(
      (s) => s.skill.slug
    ),
    careerRelevance: (
      (row.careerRelevance as { career: { slug: string } }[]) ?? []
    ).map((c) => c.career.slug),
    tags: (row.tags as string[]) ?? [],
  };
}

function mapEvent(row: AnyRecord): Event {
  return {
    slug: row.slug as string,
    title: row.title as string,
    type: eventTypeDisplay[row.type as string] ?? (row.type as Event["type"]),
    startDate: (row.startDate as Date).toISOString(),
    endDate: row.endDate
      ? (row.endDate as Date).toISOString()
      : undefined,
    locationType: locationTypeDisplay[row.locationType as string] ?? (row.locationType as Event["locationType"]),
    location: (row.location as string) ?? undefined,
    description: row.description as string,
    capacity: (row.capacity as number) ?? undefined,
    image: (row.image as string) ?? undefined,
  };
}

function mapResearch(row: AnyRecord): Research {
  return {
    slug: row.slug as string,
    title: row.title as string,
    author: row.author as string,
    organisation: row.organisation as string,
    publicationDate: (row.publicationDate as Date).toISOString().split("T")[0],
    summary: row.summary as string,
    categories: (row.categories as string[]) ?? [],
    isFeatured: (row.isFeatured as boolean) ?? undefined,
    image: (row.image as string) ?? undefined,
  };
}

function mapNews(row: AnyRecord): NewsArticle {
  return {
    slug: row.slug as string,
    title: row.title as string,
    date: (row.date as Date).toISOString().split("T")[0],
    excerpt: row.excerpt as string,
    content: row.content as string,
    category: row.category as string,
    author: row.author as string,
    image: (row.image as string) ?? undefined,
  };
}

function mapSkill(row: AnyRecord): Skill {
  return {
    slug: row.slug as string,
    name: row.name as string,
    category: skillCategoryDisplay[row.category as string] ?? (row.category as Skill["category"]),
  };
}

function mapDiagnosticQuestion(row: AnyRecord): DiagnosticQuestion {
  return {
    id: row.id as string,
    text: row.text as string,
    type: diagnosticTypeDisplay[row.type as string] ?? (row.type as DiagnosticQuestion["type"]),
    options: (row.options as DiagnosticQuestion["options"]) ?? undefined,
    scaleMin: (row.scaleMin as number) ?? undefined,
    scaleMax: (row.scaleMax as number) ?? undefined,
    scaleLabels:
      (row.scaleLabels as Record<string, string>) ?? undefined,
    scoreImpact:
      (row.scoreImpact as Record<string, number>) ?? undefined,
  };
}

// ─── Prisma includes for full career/course objects ───────

const careerInclude = {
  skills: { include: { skill: true } },
  pathwayFrom: { include: { to: true } },
  relatedCourses: { include: { course: true } },
} as const;

const courseInclude = {
  skills: { include: { skill: true } },
  careerRelevance: { include: { career: true } },
} as const;

// ─── Careers ──────────────────────────────────────────────

export async function getAllCareers(): Promise<Career[]> {
  const rows = await prisma.career.findMany({
    where: { status: "PUBLISHED" as never },
    include: careerInclude,
  });
  return rows.map((r) => mapCareer(r as unknown as AnyRecord));
}

export async function getCareerBySlug(
  slug: string
): Promise<Career | undefined> {
  const row = await prisma.career.findFirst({
    where: { slug, status: "PUBLISHED" as never },
    include: careerInclude,
  });
  return row ? mapCareer(row as unknown as AnyRecord) : undefined;
}

export async function getCareersBySector(
  sector: Career["sector"]
): Promise<Career[]> {
  const rows = await prisma.career.findMany({
    where: { sector: (sectorToEnum[sector] ?? sector) as never, status: "PUBLISHED" as never },
    include: careerInclude,
  });
  return rows.map((r) => mapCareer(r as unknown as AnyRecord));
}

// ─── Career CRUD ──────────────────────────────────────────

export async function createCareer(
  data: Omit<Career, "pathwayConnections" | "relatedCourses"> & {
    pathwayConnections?: Career["pathwayConnections"];
    relatedCourses?: string[];
  }
): Promise<Career> {
  const row = await prisma.career.create({
    data: {
      slug: data.slug,
      title: data.title,
      sector: (sectorToEnum[data.sector] ?? data.sector) as never,
      entryLevel: (entryLevelToEnum[data.entryLevel] ?? data.entryLevel) as never,
      description: data.description,
      salaryMin: data.salaryRange?.min ?? null,
      salaryMax: data.salaryRange?.max ?? null,
      keyResponsibilities: data.keyResponsibilities ?? [],
      qualifications: data.qualifications,
      workingConditions: data.workingConditions ?? null,
      growthOutlook: data.growthOutlook ?? null,
      skills: {
        create: data.skills.map((skillSlug) => ({
          skill: { connect: { slug: skillSlug } },
        })),
      },
    },
    include: careerInclude,
  });
  return mapCareer(row as unknown as AnyRecord);
}

export async function updateCareer(
  slug: string,
  data: Partial<Omit<Career, "slug" | "pathwayConnections" | "relatedCourses">>
): Promise<Career> {
  const row = await prisma.career.update({
    where: { slug },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.sector !== undefined && { sector: (sectorToEnum[data.sector] ?? data.sector) as never }),
      ...(data.entryLevel !== undefined && {
        entryLevel: (entryLevelToEnum[data.entryLevel] ?? data.entryLevel) as never,
      }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.salaryRange !== undefined && {
        salaryMin: data.salaryRange?.min ?? null,
        salaryMax: data.salaryRange?.max ?? null,
      }),
      ...(data.keyResponsibilities !== undefined && {
        keyResponsibilities: data.keyResponsibilities,
      }),
      ...(data.qualifications !== undefined && {
        qualifications: data.qualifications,
      }),
      ...(data.workingConditions !== undefined && {
        workingConditions: data.workingConditions ?? null,
      }),
      ...(data.growthOutlook !== undefined && {
        growthOutlook: data.growthOutlook ?? null,
      }),
    },
    include: careerInclude,
  });
  return mapCareer(row as unknown as AnyRecord);
}

export async function deleteCareer(slug: string): Promise<void> {
  await prisma.career.delete({ where: { slug } });
}

// ─── Courses ──────────────────────────────────────────────

export async function getAllCourses(): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { status: "PUBLISHED" as never },
    include: courseInclude,
  });
  return rows.map((r) => mapCourse(r as unknown as AnyRecord));
}

export async function getCourseBySlug(
  slug: string
): Promise<Course | undefined> {
  const row = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" as never },
    include: courseInclude,
  });
  return row ? mapCourse(row as unknown as AnyRecord) : undefined;
}

export async function getCoursesByCareer(
  careerSlug: string
): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: {
      status: "PUBLISHED" as never,
      careerRelevance: {
        some: { career: { slug: careerSlug } },
      },
    },
    include: courseInclude,
  });
  return rows.map((r) => mapCourse(r as unknown as AnyRecord));
}

export async function getFilteredCourses(
  filters: CourseFilters
): Promise<Course[]> {
  // Build where clause dynamically
  const where: Record<string, unknown> = {};

  // Only show published content on frontend
  where.status = "PUBLISHED" as never;

  if (filters.format) {
    where.deliveryFormat = (deliveryFormatToEnum[filters.format] ?? filters.format) as never;
  }

  if (filters.freeOnly) {
    where.cost = 0;
  } else if (filters.costMax !== undefined) {
    where.cost = { lte: filters.costMax };
  }

  if (filters.nfqLevel !== undefined) {
    where.nfqLevel = filters.nfqLevel;
  }

  if (filters.startingSoon) {
    const now = new Date();
    const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    where.nextStartDate = { gte: now, lte: threeMonths };
  }

  let rows = await prisma.course.findMany({
    where: where as never,
    include: courseInclude,
  });

  // Text-based filters done in-memory (matching original behavior)
  if (filters.topic) {
    const topic = filters.topic.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.tags.some((t: string) => t.toLowerCase().includes(topic)) ||
        c.skills.some((s: { skill: { slug: string } }) =>
          s.skill.slug.toLowerCase().includes(topic)
        )
    );
  }

  if (filters.provider) {
    const provider = filters.provider.toLowerCase();
    rows = rows.filter((c) => c.provider.toLowerCase().includes(provider));
  }

  return rows.map((r) => mapCourse(r as unknown as AnyRecord));
}

// ─── Course CRUD ──────────────────────────────────────────

export async function createCourse(data: Course): Promise<Course> {
  const row = await prisma.course.create({
    data: {
      slug: data.slug,
      title: data.title,
      provider: data.provider,
      providerType: (providerTypeToEnum[data.providerType] ?? data.providerType) as never,
      description: data.description,
      entryRequirements: data.entryRequirements ?? null,
      deliveryFormat: (deliveryFormatToEnum[data.deliveryFormat] ?? data.deliveryFormat) as never,
      location: data.location ?? null,
      nfqLevel: data.nfqLevel ?? null,
      duration: data.duration,
      cost: data.cost,
      costNotes: data.costNotes ?? null,
      nextStartDate: data.nextStartDate
        ? new Date(data.nextStartDate)
        : null,
      accredited: data.accredited ?? false,
      certificationAwarded: data.certificationAwarded ?? null,
      signupUrl: data.signupUrl ?? null,
      tags: data.tags,
      skills: {
        create: data.skills.map((skillSlug) => ({
          skill: { connect: { slug: skillSlug } },
        })),
      },
      careerRelevance: {
        create: data.careerRelevance.map((careerSlug) => ({
          career: { connect: { slug: careerSlug } },
        })),
      },
    },
    include: courseInclude,
  });
  return mapCourse(row as unknown as AnyRecord);
}

export async function updateCourse(
  slug: string,
  data: Partial<Omit<Course, "slug">>
): Promise<Course> {
  const row = await prisma.course.update({
    where: { slug },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.provider !== undefined && { provider: data.provider }),
      ...(data.providerType !== undefined && {
        providerType: (providerTypeToEnum[data.providerType] ?? data.providerType) as never,
      }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.entryRequirements !== undefined && {
        entryRequirements: data.entryRequirements ?? null,
      }),
      ...(data.deliveryFormat !== undefined && {
        deliveryFormat: (deliveryFormatToEnum[data.deliveryFormat] ?? data.deliveryFormat) as never,
      }),
      ...(data.location !== undefined && { location: data.location ?? null }),
      ...(data.nfqLevel !== undefined && { nfqLevel: data.nfqLevel ?? null }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.cost !== undefined && { cost: data.cost }),
      ...(data.costNotes !== undefined && {
        costNotes: data.costNotes ?? null,
      }),
      ...(data.nextStartDate !== undefined && {
        nextStartDate: data.nextStartDate
          ? new Date(data.nextStartDate)
          : null,
      }),
      ...(data.accredited !== undefined && { accredited: data.accredited }),
      ...(data.certificationAwarded !== undefined && {
        certificationAwarded: data.certificationAwarded ?? null,
      }),
      ...(data.signupUrl !== undefined && {
        signupUrl: data.signupUrl ?? null,
      }),
      ...(data.tags !== undefined && { tags: data.tags }),
    },
    include: courseInclude,
  });
  return mapCourse(row as unknown as AnyRecord);
}

export async function deleteCourse(slug: string): Promise<void> {
  await prisma.course.delete({ where: { slug } });
}

// ─── Events ───────────────────────────────────────────────

export async function getAllEvents(): Promise<Event[]> {
  const rows = await prisma.event.findMany({
    where: { status: "PUBLISHED" as never },
  });
  return rows.map((r) => mapEvent(r as unknown as AnyRecord));
}

export async function getEventBySlug(
  slug: string
): Promise<Event | undefined> {
  const row = await prisma.event.findFirst({
    where: { slug, status: "PUBLISHED" as never },
  });
  return row ? mapEvent(row as unknown as AnyRecord) : undefined;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const rows = await prisma.event.findMany({
    where: { status: "PUBLISHED" as never, startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
  });
  return rows.map((r) => mapEvent(r as unknown as AnyRecord));
}

// ─── Event CRUD ───────────────────────────────────────────

export async function createEvent(data: Event): Promise<Event> {
  const row = await prisma.event.create({
    data: {
      slug: data.slug,
      title: data.title,
      type: (eventTypeToEnum[data.type] ?? data.type) as never,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      locationType: (locationTypeToEnum[data.locationType] ?? data.locationType) as never,
      location: data.location ?? null,
      description: data.description,
      capacity: data.capacity ?? null,
      image: data.image ?? null,
    },
  });
  return mapEvent(row as unknown as AnyRecord);
}

export async function updateEvent(
  slug: string,
  data: Partial<Omit<Event, "slug">>
): Promise<Event> {
  const row = await prisma.event.update({
    where: { slug },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.type !== undefined && { type: (eventTypeToEnum[data.type] ?? data.type) as never }),
      ...(data.startDate !== undefined && {
        startDate: new Date(data.startDate),
      }),
      ...(data.endDate !== undefined && {
        endDate: data.endDate ? new Date(data.endDate) : null,
      }),
      ...(data.locationType !== undefined && {
        locationType: (locationTypeToEnum[data.locationType] ?? data.locationType) as never,
      }),
      ...(data.location !== undefined && { location: data.location ?? null }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.capacity !== undefined && { capacity: data.capacity ?? null }),
      ...(data.image !== undefined && { image: data.image ?? null }),
    },
  });
  return mapEvent(row as unknown as AnyRecord);
}

export async function deleteEvent(slug: string): Promise<void> {
  await prisma.event.delete({ where: { slug } });
}

// ─── Research ─────────────────────────────────────────────

export async function getAllResearch(): Promise<Research[]> {
  const rows = await prisma.research.findMany({
    where: { status: "PUBLISHED" as never },
  });
  return rows.map((r) => mapResearch(r as unknown as AnyRecord));
}

export async function getResearchBySlug(
  slug: string
): Promise<Research | undefined> {
  const row = await prisma.research.findFirst({
    where: { slug, status: "PUBLISHED" as never },
  });
  return row ? mapResearch(row as unknown as AnyRecord) : undefined;
}

export async function getFeaturedResearch(): Promise<Research | undefined> {
  const row = await prisma.research.findFirst({
    where: { isFeatured: true, status: "PUBLISHED" as never },
  });
  return row ? mapResearch(row as unknown as AnyRecord) : undefined;
}

// ─── Research CRUD ────────────────────────────────────────

export async function createResearch(data: Research): Promise<Research> {
  const row = await prisma.research.create({
    data: {
      slug: data.slug,
      title: data.title,
      author: data.author,
      organisation: data.organisation,
      publicationDate: new Date(data.publicationDate),
      summary: data.summary,
      categories: data.categories,
      isFeatured: data.isFeatured ?? false,
      image: data.image ?? null,
    },
  });
  return mapResearch(row as unknown as AnyRecord);
}

export async function updateResearch(
  slug: string,
  data: Partial<Omit<Research, "slug">>
): Promise<Research> {
  const row = await prisma.research.update({
    where: { slug },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.author !== undefined && { author: data.author }),
      ...(data.organisation !== undefined && {
        organisation: data.organisation,
      }),
      ...(data.publicationDate !== undefined && {
        publicationDate: new Date(data.publicationDate),
      }),
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.categories !== undefined && { categories: data.categories }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.image !== undefined && { image: data.image ?? null }),
    },
  });
  return mapResearch(row as unknown as AnyRecord);
}

export async function deleteResearch(slug: string): Promise<void> {
  await prisma.research.delete({ where: { slug } });
}

// ─── Skills ───────────────────────────────────────────────

export async function getAllSkills(): Promise<Skill[]> {
  const rows = await prisma.skill.findMany();
  return rows.map((r) => mapSkill(r as unknown as AnyRecord));
}

export async function getSkillBySlug(
  slug: string
): Promise<Skill | undefined> {
  const row = await prisma.skill.findUnique({ where: { slug } });
  return row ? mapSkill(row as unknown as AnyRecord) : undefined;
}

export async function getSkillsByCareer(
  careerSlug: string
): Promise<Skill[]> {
  const rows = await prisma.skill.findMany({
    where: {
      careers: { some: { career: { slug: careerSlug } } },
    },
  });
  return rows.map((r) => mapSkill(r as unknown as AnyRecord));
}

// ─── Diagnostic ───────────────────────────────────────────

export async function getDiagnosticQuestions(): Promise<DiagnosticQuestion[]> {
  const rows = await prisma.diagnosticQuestion.findMany();
  return rows.map((r) =>
    mapDiagnosticQuestion(r as unknown as AnyRecord)
  );
}

// ─── News ─────────────────────────────────────────────────

export async function getAllNews(): Promise<NewsArticle[]> {
  const rows = await prisma.newsArticle.findMany({
    where: { status: "PUBLISHED" as never },
    orderBy: { date: "desc" },
  });
  return rows.map((r) => mapNews(r as unknown as AnyRecord));
}

export async function getNewsBySlug(
  slug: string
): Promise<NewsArticle | undefined> {
  const row = await prisma.newsArticle.findFirst({
    where: { slug, status: "PUBLISHED" as never },
  });
  return row ? mapNews(row as unknown as AnyRecord) : undefined;
}

// ─── News CRUD ────────────────────────────────────────────

export async function createNews(data: NewsArticle): Promise<NewsArticle> {
  const row = await prisma.newsArticle.create({
    data: {
      slug: data.slug,
      title: data.title,
      date: new Date(data.date),
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      author: data.author,
      image: data.image ?? null,
    },
  });
  return mapNews(row as unknown as AnyRecord);
}

export async function updateNews(
  slug: string,
  data: Partial<Omit<NewsArticle, "slug">>
): Promise<NewsArticle> {
  const row = await prisma.newsArticle.update({
    where: { slug },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.author !== undefined && { author: data.author }),
      ...(data.image !== undefined && { image: data.image ?? null }),
    },
  });
  return mapNews(row as unknown as AnyRecord);
}

export async function deleteNews(slug: string): Promise<void> {
  await prisma.newsArticle.delete({ where: { slug } });
}

// ─── Global Search ────────────────────────────────────────

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Search across all PUBLISHED content types in parallel
  const publishedFilter = { status: "PUBLISHED" as never };
  const [careers, courses, events, research, news] = await Promise.all([
    prisma.career.findMany({ where: publishedFilter }),
    prisma.course.findMany({ where: publishedFilter }),
    prisma.event.findMany({ where: publishedFilter }),
    prisma.research.findMany({ where: publishedFilter }),
    prisma.newsArticle.findMany({ where: publishedFilter }),
  ]);

  for (const career of careers) {
    const displaySector = sectorDisplay[career.sector] ?? career.sector;
    if (
      career.title.toLowerCase().includes(q) ||
      career.description.toLowerCase().includes(q) ||
      displaySector.toLowerCase().includes(q)
    ) {
      results.push({
        type: "career",
        slug: career.slug,
        title: career.title,
        excerpt: career.description.slice(0, 150) + "...",
      });
    }
  }

  for (const course of courses) {
    if (
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.provider.toLowerCase().includes(q)
    ) {
      results.push({
        type: "course",
        slug: course.slug,
        title: course.title,
        excerpt: course.description.slice(0, 150) + "...",
      });
    }
  }

  for (const event of events) {
    if (
      event.title.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q)
    ) {
      results.push({
        type: "event",
        slug: event.slug,
        title: event.title,
        excerpt: event.description.slice(0, 150) + "...",
      });
    }
  }

  for (const r of research) {
    if (
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.organisation.toLowerCase().includes(q)
    ) {
      results.push({
        type: "research",
        slug: r.slug,
        title: r.title,
        excerpt: r.summary.slice(0, 150) + "...",
      });
    }
  }

  for (const article of news) {
    if (
      article.title.toLowerCase().includes(q) ||
      article.excerpt.toLowerCase().includes(q) ||
      article.content.toLowerCase().includes(q)
    ) {
      results.push({
        type: "news",
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt.slice(0, 150) + "...",
      });
    }
  }

  return results;
}
