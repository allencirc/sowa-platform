import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { diagnosticAnswersSchema } from "@/lib/validations";
import { calculateResults } from "@/lib/diagnostic";
import { syncDiagnosticResults } from "@/lib/hubspot";
import type { Career, Course, DiagnosticQuestion, Skill } from "@/lib/types";

// Enum display maps
const sectorDisplay: Record<string, string> = {
  OPERATIONS_MAINTENANCE: "Operations & Maintenance",
  MARINE_OPERATIONS: "Marine Operations",
  SURVEY_DESIGN: "Survey & Design",
  HSE: "Health, Safety & Environment",
  ELECTRICAL: "Electrical",
  POLICY_REGULATION: "Policy & Regulation",
  PROJECT_MANAGEMENT: "Project Management",
};
const entryLevelDisplay: Record<string, string> = {
  APPRENTICE: "Apprentice",
  ENTRY: "Entry",
  MID: "Mid",
  SENIOR: "Senior",
  LEADERSHIP: "Leadership",
};
const providerTypeDisplay: Record<string, string> = {
  UNIVERSITY: "University",
  ETB: "ETB",
  PRIVATE: "Private",
  INDUSTRY: "Industry",
  SKILLNET_NETWORK: "Skillnet_Network",
  GOVERNMENT: "Government",
};
const deliveryFormatDisplay: Record<string, string> = {
  IN_PERSON: "In-Person",
  ONLINE: "Online",
  BLENDED: "Blended",
  SELF_PACED: "Self-Paced",
};
const skillCategoryDisplay: Record<string, string> = {
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
const diagnosticTypeDisplay: Record<string, string> = {
  SINGLE_CHOICE: "single_choice",
  MULTIPLE_CHOICE: "multiple_choice",
  SCALE: "scale",
};

type AnyRecord = Record<string, unknown>;

const careerInclude = {
  skills: { include: { skill: true } },
  pathwayFrom: { include: { to: true } },
  relatedCourses: { include: { course: true } },
} as const;

const courseInclude = {
  skills: { include: { skill: true } },
  careerRelevance: { include: { career: true } },
} as const;

function mapCareer(row: AnyRecord): Career {
  return {
    slug: row.slug as string,
    title: row.title as string,
    sector: (sectorDisplay[row.sector as string] ?? row.sector) as Career["sector"],
    entryLevel: (entryLevelDisplay[row.entryLevel as string] ??
      row.entryLevel) as Career["entryLevel"],
    description: row.description as string,
    salaryRange:
      row.salaryMin != null && row.salaryMax != null
        ? { min: row.salaryMin as number, max: row.salaryMax as number }
        : undefined,
    keyResponsibilities: (row.keyResponsibilities as string[]) ?? [],
    qualifications: (row.qualifications as string[]) ?? [],
    workingConditions: (row.workingConditions as string) ?? undefined,
    growthOutlook: (row.growthOutlook as string) ?? undefined,
    skills: ((row.skills as { skill: { slug: string } }[]) ?? []).map((s) => s.skill.slug),
    pathwayConnections: (
      (row.pathwayFrom as { to: { slug: string }; type: string; timeframe: string }[]) ?? []
    ).map((p) => ({
      to: p.to.slug,
      type: (pathwayTypeDisplay[p.type] ?? p.type) as "progression" | "lateral" | "specialisation",
      timeframe: p.timeframe,
    })),
    relatedCourses: ((row.relatedCourses as { course: { slug: string } }[]) ?? []).map(
      (c) => c.course.slug,
    ),
  };
}

function mapCourse(row: AnyRecord): Course {
  return {
    slug: row.slug as string,
    title: row.title as string,
    provider: row.provider as string,
    providerType: (providerTypeDisplay[row.providerType as string] ??
      row.providerType) as Course["providerType"],
    description: row.description as string,
    entryRequirements: (row.entryRequirements as string) ?? undefined,
    deliveryFormat: (deliveryFormatDisplay[row.deliveryFormat as string] ??
      row.deliveryFormat) as Course["deliveryFormat"],
    location: (row.location as string) ?? undefined,
    nfqLevel: (row.nfqLevel as number | null) ?? undefined,
    duration: row.duration as string,
    cost: row.cost as number,
    costNotes: (row.costNotes as string) ?? undefined,
    nextStartDate: row.nextStartDate
      ? (row.nextStartDate as Date).toISOString().split("T")[0]
      : undefined,
    accredited: (row.accredited as boolean) ?? undefined,
    certificationAwarded: (row.certificationAwarded as string) ?? undefined,
    skills: ((row.skills as { skill: { slug: string } }[]) ?? []).map((s) => s.skill.slug),
    careerRelevance: ((row.careerRelevance as { career: { slug: string } }[]) ?? []).map(
      (c) => c.career.slug,
    ),
    tags: (row.tags as string[]) ?? [],
  };
}

function mapSkill(row: AnyRecord): Skill {
  return {
    slug: row.slug as string,
    name: row.name as string,
    category: (skillCategoryDisplay[row.category as string] ?? row.category) as Skill["category"],
    escoUri: (row.escoUri as string) ?? undefined,
    onetCode: (row.onetCode as string) ?? undefined,
    isTransferable: (row.isTransferable as boolean) ?? false,
    adjacentSectors: (row.adjacentSectors as string[]) ?? [],
    escoLevel: (row.escoLevel as number) ?? undefined,
    escoType: (row.escoType as string) ?? undefined,
  };
}

function mapQuestion(row: AnyRecord): DiagnosticQuestion {
  return {
    id: row.id as string,
    text: row.text as string,
    type: (diagnosticTypeDisplay[row.type as string] ?? row.type) as DiagnosticQuestion["type"],
    options: (row.options as DiagnosticQuestion["options"]) ?? undefined,
    scaleMin: (row.scaleMin as number) ?? undefined,
    scaleMax: (row.scaleMax as number) ?? undefined,
    scaleLabels: (row.scaleLabels as Record<string, string>) ?? undefined,
    scoreImpact: (row.scoreImpact as Record<string, number>) ?? undefined,
  };
}

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = await parseBody(request, diagnosticAnswersSchema);
  if (parsed.error) return parsed.error;

  const { answers, contact } = parsed.data;

  try {
    // Fetch all reference data from DB
    const [questionRows, skillRows, careerRows, courseRows] = await Promise.all([
      prisma.diagnosticQuestion.findMany(),
      prisma.skill.findMany(),
      prisma.career.findMany({ include: careerInclude }),
      prisma.course.findMany({ include: courseInclude }),
    ]);

    const questions = questionRows.map((r) => mapQuestion(r as unknown as AnyRecord));
    const allSkills = skillRows.map((r) => mapSkill(r as unknown as AnyRecord));
    const allCareers = careerRows.map((r) => mapCareer(r as unknown as AnyRecord));
    const allCourses = courseRows.map((r) => mapCourse(r as unknown as AnyRecord));

    const result = calculateResults(answers, {
      questions,
      allSkills,
      allCareers,
      allCourses,
    });

    // Persist anonymous diagnostic session (fire-and-forget)
    const locale = request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] ?? "en";
    const referrerSource =
      new URL(request.url).searchParams.get("source") ?? request.headers.get("referer") ?? null;

    prisma.diagnosticSession
      .create({
        data: {
          answers: answers as never,
          scores: result.scores,
          maxPossible: result.maxPossible,
          topRoleFamilies: result.roleFamilyFit.slice(0, 3).map((f) => f.family),
          topSkillGaps: result.gaps.slice(0, 3).map((g) => g.skill.slug),
          locale,
          referrerSource,
        },
      })
      .catch((err) => {
        console.error("[Diagnostic] Session persist failed:", err);
      });

    // If user consented, sync results to HubSpot in the background
    if (contact?.consent && contact.email) {
      syncDiagnosticResults({
        email: contact.email,
        name: contact.name,
        topGaps: result.gaps.slice(0, 3).map((g) => g.skill.name),
        recommendedCareers: result.recommendedCareers.map((c) => c.slug),
      }).catch((err) => {
        console.error("[Diagnostic] HubSpot sync failed:", err);
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/diagnostic/results error:", err);
    return errorResponse("Failed to calculate diagnostic results");
  }
}
