import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ZodError, type ZodIssue } from "zod";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";
import { createCourseSchema } from "@/lib/validations";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";

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

type RawRow = Record<string, unknown>;

interface RowError {
  row: number; // 1-based (excluding header)
  path: string;
  message: string;
}

interface RowResult {
  row: number;
  status: "valid" | "invalid";
  slug?: string;
  title?: string;
  errors?: { path: string; message: string }[];
}

const ARRAY_SPLIT = /[|;,]/;

function toStr(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length === 0 ? undefined : s;
}

function toNum(v: unknown): number | undefined {
  const s = toStr(v);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function toBool(v: unknown): boolean | undefined {
  const s = toStr(v);
  if (s === undefined) return undefined;
  const l = s.toLowerCase();
  if (["true", "yes", "y", "1"].includes(l)) return true;
  if (["false", "no", "n", "0"].includes(l)) return false;
  return undefined;
}

function toArr(v: unknown): string[] {
  const s = toStr(v);
  if (s === undefined) return [];
  return s
    .split(ARRAY_SPLIT)
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * Normalise a raw spreadsheet row into the shape expected by createCourseSchema.
 * Uses snake-case or camelCase headers interchangeably.
 */
function normaliseRow(raw: RawRow): Record<string, unknown> {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== "") return raw[k];
    }
    return undefined;
  };

  const nfqRaw = get("nfqLevel", "nfq_level", "nfq");
  const costRaw = get("cost");
  const accreditedRaw = get("accredited");

  return {
    slug: toStr(get("slug")),
    title: toStr(get("title")),
    provider: toStr(get("provider")),
    providerType: toStr(get("providerType", "provider_type")),
    description: toStr(get("description")),
    entryRequirements: toStr(get("entryRequirements", "entry_requirements")),
    deliveryFormat: toStr(get("deliveryFormat", "delivery_format", "format")),
    location: toStr(get("location")),
    nfqLevel: nfqRaw === undefined ? null : toNum(nfqRaw),
    duration: toStr(get("duration")),
    cost: costRaw === undefined ? 0 : toNum(costRaw),
    costNotes: toStr(get("costNotes", "cost_notes")),
    nextStartDate: toStr(get("nextStartDate", "next_start_date", "start_date")),
    accredited: accreditedRaw === undefined ? undefined : toBool(accreditedRaw),
    certificationAwarded: toStr(get("certificationAwarded", "certification_awarded")),
    skills: toArr(get("skills")),
    careerRelevance: toArr(get("careerRelevance", "career_relevance", "careers")),
    tags: toArr(get("tags")),
  };
}

function parseCsv(text: string): RawRow[] {
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return (result.data ?? []).filter((r) => Object.keys(r).length > 0);
}

function parseXlsx(buffer: ArrayBuffer): RawRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "", raw: false });
}

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    return errorResponse("Unauthorized", 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("Expected multipart/form-data body", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return errorResponse("Missing 'file' field", 400);
  }
  const dryRun = form.get("dryRun") !== "false"; // default true

  const name = file.name.toLowerCase();
  const isCsv = name.endsWith(".csv") || file.type === "text/csv";
  const isXlsx =
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("excel");

  let rows: RawRow[];
  try {
    if (isCsv) {
      rows = parseCsv(await file.text());
    } else if (isXlsx) {
      rows = parseXlsx(await file.arrayBuffer());
    } else {
      return errorResponse("Unsupported file type. Upload a .csv or .xlsx file.", 400);
    }
  } catch (err) {
    console.error("Import parse error:", err);
    return errorResponse("Failed to parse file", 400);
  }

  if (rows.length === 0) {
    return NextResponse.json({
      dryRun,
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      createdCount: 0,
      rows: [] as RowResult[],
      errors: [] as RowError[],
    });
  }

  const results: RowResult[] = [];
  const errors: RowError[] = [];
  const validRows: { rowNumber: number; data: ReturnType<typeof createCourseSchema.parse> }[] = [];

  rows.forEach((raw, i) => {
    const rowNumber = i + 1;
    const normalised = normaliseRow(raw);
    try {
      const parsed = createCourseSchema.parse(normalised);
      results.push({
        row: rowNumber,
        status: "valid",
        slug: parsed.slug,
        title: parsed.title,
      });
      validRows.push({ rowNumber, data: parsed });
    } catch (err) {
      if (err instanceof ZodError) {
        const rowErrors = err.issues.map((e: ZodIssue) => ({
          path: e.path.join(".") || "(root)",
          message: e.message,
        }));
        results.push({
          row: rowNumber,
          status: "invalid",
          slug: typeof normalised.slug === "string" ? normalised.slug : undefined,
          title: typeof normalised.title === "string" ? normalised.title : undefined,
          errors: rowErrors,
        });
        rowErrors.forEach((re) =>
          errors.push({ row: rowNumber, path: re.path, message: re.message })
        );
      } else {
        throw err;
      }
    }
  });

  const validCount = validRows.length;
  const invalidCount = results.length - validCount;

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      totalRows: rows.length,
      validCount,
      invalidCount,
      createdCount: 0,
      rows: results,
      errors,
    });
  }

  // Actual import — only create rows that validated cleanly.
  let createdCount = 0;
  for (const { rowNumber, data } of validRows) {
    try {
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
          nextStartDate: data.nextStartDate ? new Date(data.nextStartDate) : null,
          accredited: data.accredited ?? false,
          certificationAwarded: data.certificationAwarded ?? null,
          tags: data.tags,
          status: "DRAFT" as never,
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
      });

      await createContentVersion({
        contentType: "COURSE",
        contentId: row.id,
        snapshot: { slug: row.slug, title: row.title } as Record<string, unknown>,
        changedById: user.id!,
        changeNote: "Imported via batch upload",
      });

      createdCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const friendly = msg.includes("Unique constraint")
        ? "A course with this slug already exists"
        : msg.includes("connect")
          ? "Referenced skill or career slug does not exist"
          : "Failed to create course";
      errors.push({ row: rowNumber, path: "(database)", message: friendly });
      const res = results.find((r) => r.row === rowNumber);
      if (res) {
        res.status = "invalid";
        res.errors = [...(res.errors ?? []), { path: "(database)", message: friendly }];
      }
    }
  }

  return NextResponse.json({
    dryRun: false,
    totalRows: rows.length,
    validCount,
    invalidCount: invalidCount + (validCount - createdCount),
    createdCount,
    rows: results,
    errors,
  });
}
