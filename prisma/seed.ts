import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Enum mappers ─────────────────────────────────────────

const sectorMap: Record<string, string> = {
  "Operations & Maintenance": "OPERATIONS_MAINTENANCE",
  "Marine Operations": "MARINE_OPERATIONS",
  "Survey & Design": "SURVEY_DESIGN",
  "Health, Safety & Environment": "HSE",
  Electrical: "ELECTRICAL",
  "Policy & Regulation": "POLICY_REGULATION",
  "Project Management": "PROJECT_MANAGEMENT",
};

const entryLevelMap: Record<string, string> = {
  Apprentice: "APPRENTICE",
  Entry: "ENTRY",
  Mid: "MID",
  Senior: "SENIOR",
  Leadership: "LEADERSHIP",
};

const providerTypeMap: Record<string, string> = {
  University: "UNIVERSITY",
  ETB: "ETB",
  Private: "PRIVATE",
  Industry: "INDUSTRY",
  Skillnet_Network: "SKILLNET_NETWORK",
  Government: "GOVERNMENT",
};

const deliveryFormatMap: Record<string, string> = {
  "In-Person": "IN_PERSON",
  Online: "ONLINE",
  Blended: "BLENDED",
  "Self-Paced": "SELF_PACED",
};

const eventTypeMap: Record<string, string> = {
  Workshop: "WORKSHOP",
  Webinar: "WEBINAR",
  Conference: "CONFERENCE",
  Networking: "NETWORKING",
  Training: "TRAINING",
  Roadshow: "ROADSHOW",
};

const locationTypeMap: Record<string, string> = {
  Physical: "PHYSICAL",
  Virtual: "VIRTUAL",
  Hybrid: "HYBRID",
};

const skillCategoryMap: Record<string, string> = {
  Technical: "TECHNICAL",
  Safety: "SAFETY",
  Regulatory: "REGULATORY",
  Digital: "DIGITAL",
  Management: "MANAGEMENT",
};

const pathwayTypeMap: Record<string, string> = {
  progression: "PROGRESSION",
  lateral: "LATERAL",
  specialisation: "SPECIALISATION",
};

const diagnosticTypeMap: Record<string, string> = {
  single_choice: "SINGLE_CHOICE",
  multiple_choice: "MULTIPLE_CHOICE",
  scale: "SCALE",
};

// ─── Helpers ──────────────────────────────────────────────

function loadJson<T>(filename: string): T {
  const filepath = join(__dirname, "..", "src", "lib", "data", filename);
  return JSON.parse(readFileSync(filepath, "utf-8")) as T;
}

// ─── Interfaces for JSON data ─────────────────────────────

interface CareerJson {
  slug: string;
  title: string;
  sector: string;
  entryLevel: string;
  description: string;
  salaryRange?: { min: number; max: number };
  keyResponsibilities?: string[];
  qualifications: string[];
  workingConditions?: string;
  growthOutlook?: string;
  skills: string[];
  pathwayConnections: { to: string; type: string; timeframe: string }[];
  relatedCourses: string[];
}

interface CourseJson {
  slug: string;
  title: string;
  provider: string;
  providerType: string;
  description: string;
  entryRequirements?: string;
  deliveryFormat: string;
  location?: string;
  nfqLevel?: number | null;
  duration: string;
  cost: number;
  costNotes?: string;
  nextStartDate?: string;
  accredited?: boolean;
  certificationAwarded?: string;
  signupUrl?: string;
  skills: string[];
  careerRelevance: string[];
  tags: string[];
}

interface EventJson {
  slug: string;
  title: string;
  type: string;
  startDate: string;
  endDate?: string;
  locationType: string;
  location?: string;
  description: string;
  capacity?: number;
  image?: string;
}

interface ResearchJson {
  slug: string;
  title: string;
  author: string;
  organisation: string;
  publicationDate: string;
  summary: string;
  categories: string[];
  isFeatured?: boolean;
  image?: string;
}

interface NewsJson {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image?: string;
}

interface SkillJson {
  slug: string;
  name: string;
  category: string;
}

interface DiagnosticJson {
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    type: string;
    options?: unknown[];
    scaleMin?: number;
    scaleMax?: number;
    scaleLabels?: Record<string, string>;
    scoreImpact?: Record<string, number>;
  }[];
}

// ─── Seed ─────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data in dependency order
  await prisma.pathwayConnection.deleteMany();
  await prisma.courseCareer.deleteMany();
  await prisma.courseSkill.deleteMany();
  await prisma.careerSkill.deleteMany();
  await prisma.diagnosticQuestion.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.research.deleteMany();
  await prisma.event.deleteMany();
  await prisma.course.deleteMany();
  await prisma.career.deleteMany();
  await prisma.skill.deleteMany();

  // 1. Skills
  const skillsData = loadJson<SkillJson[]>("skills.json");
  console.log(`  📦 Seeding ${skillsData.length} skills...`);
  const skillIdMap = new Map<string, string>();

  for (const skill of skillsData) {
    const created = await prisma.skill.create({
      data: {
        slug: skill.slug,
        name: skill.name,
        category: skillCategoryMap[skill.category] as never,
      },
    });
    skillIdMap.set(skill.slug, created.id);
  }

  // 2. Careers (without pathway connections — those reference other careers)
  const careersData = loadJson<CareerJson[]>("careers.json");
  console.log(`  📦 Seeding ${careersData.length} careers...`);
  const careerIdMap = new Map<string, string>();

  for (const career of careersData) {
    const created = await prisma.career.create({
      data: {
        slug: career.slug,
        title: career.title,
        sector: sectorMap[career.sector] as never,
        entryLevel: entryLevelMap[career.entryLevel] as never,
        description: career.description,
        salaryMin: career.salaryRange?.min ?? null,
        salaryMax: career.salaryRange?.max ?? null,
        keyResponsibilities: career.keyResponsibilities ?? [],
        qualifications: career.qualifications,
        workingConditions: career.workingConditions ?? null,
        growthOutlook: career.growthOutlook ?? null,
        status: "PUBLISHED" as never,
      },
    });
    careerIdMap.set(career.slug, created.id);
  }

  // 3. Career ↔ Skill relations
  console.log("  🔗 Linking careers to skills...");
  for (const career of careersData) {
    const careerId = careerIdMap.get(career.slug)!;
    for (const skillSlug of career.skills) {
      const skillId = skillIdMap.get(skillSlug);
      if (skillId) {
        await prisma.careerSkill.create({
          data: { careerId, skillId },
        });
      }
    }
  }

  // 4. Pathway connections (career → career)
  console.log("  🔗 Creating pathway connections...");
  for (const career of careersData) {
    const fromId = careerIdMap.get(career.slug)!;
    for (const conn of career.pathwayConnections) {
      const toId = careerIdMap.get(conn.to);
      if (toId) {
        await prisma.pathwayConnection.create({
          data: {
            fromId,
            toId,
            type: pathwayTypeMap[conn.type] as never,
            timeframe: conn.timeframe,
          },
        });
      } else {
        console.warn(`    ⚠️  Pathway target "${conn.to}" not found for career "${career.slug}"`);
      }
    }
  }

  // 5. Courses
  const coursesData = loadJson<CourseJson[]>("courses.json");
  console.log(`  📦 Seeding ${coursesData.length} courses...`);
  const courseIdMap = new Map<string, string>();

  for (const course of coursesData) {
    const created = await prisma.course.create({
      data: {
        slug: course.slug,
        title: course.title,
        provider: course.provider,
        providerType: providerTypeMap[course.providerType] as never,
        description: course.description,
        entryRequirements: course.entryRequirements ?? null,
        deliveryFormat: deliveryFormatMap[course.deliveryFormat] as never,
        location: course.location ?? null,
        nfqLevel: course.nfqLevel ?? null,
        duration: course.duration,
        cost: course.cost,
        costNotes: course.costNotes ?? null,
        nextStartDate: course.nextStartDate ? new Date(course.nextStartDate) : null,
        accredited: course.accredited ?? false,
        certificationAwarded: course.certificationAwarded ?? null,
        signupUrl: course.signupUrl ?? null,
        tags: course.tags,
        status: "PUBLISHED" as never,
      },
    });
    courseIdMap.set(course.slug, created.id);
  }

  // 6. Course ↔ Skill relations
  console.log("  🔗 Linking courses to skills...");
  for (const course of coursesData) {
    const courseId = courseIdMap.get(course.slug)!;
    for (const skillSlug of course.skills) {
      const skillId = skillIdMap.get(skillSlug);
      if (skillId) {
        await prisma.courseSkill.create({
          data: { courseId, skillId },
        });
      }
    }
  }

  // 7. Course ↔ Career relations
  console.log("  🔗 Linking courses to careers...");
  for (const course of coursesData) {
    const courseId = courseIdMap.get(course.slug)!;
    for (const careerSlug of course.careerRelevance) {
      const careerId = careerIdMap.get(careerSlug);
      if (careerId) {
        await prisma.courseCareer.create({
          data: { courseId, careerId },
        });
      }
    }
  }

  // 8. Events
  const eventsData = loadJson<EventJson[]>("events.json");
  console.log(`  📦 Seeding ${eventsData.length} events...`);
  for (const event of eventsData) {
    await prisma.event.create({
      data: {
        slug: event.slug,
        title: event.title,
        type: eventTypeMap[event.type] as never,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        locationType: locationTypeMap[event.locationType] as never,
        location: event.location ?? null,
        description: event.description,
        capacity: event.capacity ?? null,
        image: event.image ?? null,
        status: "PUBLISHED" as never,
      },
    });
  }

  // 9. Research
  const researchData = loadJson<ResearchJson[]>("research.json");
  console.log(`  📦 Seeding ${researchData.length} research items...`);
  for (const r of researchData) {
    await prisma.research.create({
      data: {
        slug: r.slug,
        title: r.title,
        author: r.author,
        organisation: r.organisation,
        publicationDate: new Date(r.publicationDate),
        summary: r.summary,
        categories: r.categories,
        isFeatured: r.isFeatured ?? false,
        image: r.image ?? null,
        status: "PUBLISHED" as never,
      },
    });
  }

  // 10. News articles
  const newsData = loadJson<NewsJson[]>("news.json");
  console.log(`  📦 Seeding ${newsData.length} news articles...`);
  for (const n of newsData) {
    await prisma.newsArticle.create({
      data: {
        slug: n.slug,
        title: n.title,
        date: new Date(n.date),
        excerpt: n.excerpt,
        content: n.content,
        category: n.category,
        author: n.author,
        image: n.image ?? null,
        status: "PUBLISHED" as never,
      },
    });
  }

  // 11. Diagnostic questions
  const diagnosticData = loadJson<DiagnosticJson>("diagnosticQuestions.json");
  console.log(`  📦 Seeding ${diagnosticData.questions.length} diagnostic questions...`);
  for (const q of diagnosticData.questions) {
    await prisma.diagnosticQuestion.create({
      data: {
        id: q.id,
        text: q.text,
        type: diagnosticTypeMap[q.type] as never,
        options: (q.options as object[]) ?? undefined,
        scaleMin: q.scaleMin ?? null,
        scaleMax: q.scaleMax ?? null,
        scaleLabels: q.scaleLabels ?? undefined,
        scoreImpact: q.scoreImpact ?? undefined,
      },
    });
  }

  // ─── 12. Admin User ───────────────────────────────────────
  console.log("Seeding admin user...");
  const passwordHash = await bcrypt.hash("changeme123", 12);
  // Seeded with a documented default password — force rotation on first login
  // so a leaked seed DB cannot be reused verbatim against a deployed instance.
  await prisma.user.upsert({
    where: { email: "admin@sowa.ie" },
    update: { passwordHash, role: "ADMIN", mustChangePassword: true },
    create: {
      email: "admin@sowa.ie",
      name: "SOWA Admin",
      role: "ADMIN",
      passwordHash,
      mustChangePassword: true,
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
