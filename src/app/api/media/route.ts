import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { writeFile, readdir, unlink, stat, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Variants generated for every raster upload.
// SVGs are stored as-is (vector — no resize needed).
const VARIANTS = [
  { suffix: "hero", width: 1200, height: 675 },
  { suffix: "inline", width: 800, height: 400 },
  { suffix: "thumb", width: 400, height: 225 },
] as const;

// ─── GET: list all media ────────────────────────────────────────────────────

export async function GET() {
  try {
    await requireAuth();

    let files: string[] = [];
    try {
      files = await readdir(UPLOAD_DIR);
    } catch {
      return NextResponse.json({ data: [] });
    }

    // Exclude variant files from the listing — they are implementation details.
    const originals = files.filter(
      (f) => !f.startsWith(".") && !VARIANTS.some((v) => f.includes(`-${v.suffix}.`)),
    );

    const media = await Promise.all(
      originals.map(async (filename) => {
        const filePath = path.join(UPLOAD_DIR, filename);
        const stats = await stat(filePath);

        // Discover which variants exist for this file
        const baseName = path.parse(filename).name;
        const variants: Record<string, string> = {};
        for (const v of VARIANTS) {
          // Variants are always .webp for raster originals
          const variantName = `${baseName}-${v.suffix}.webp`;
          if (files.includes(variantName)) {
            variants[v.suffix] = `/uploads/${variantName}`;
          }
        }

        return {
          filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          ...(Object.keys(variants).length > 0 && { variants }),
        };
      }),
    );

    media.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ data: media });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/media error:", err);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}

// ─── POST: upload + auto-resize ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG" },
        { status: 400 },
      );
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique base name
    const ext = path.extname(file.name);
    const base = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();
    const timestamp = Date.now();
    const filename = `${base}-${timestamp}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // ── SVGs: store verbatim (vector, nothing to resize) ──
    if (file.type === "image/svg+xml") {
      await writeFile(path.join(UPLOAD_DIR, filename), buffer);
      return NextResponse.json(
        { filename, url: `/uploads/${filename}`, size: buffer.length },
        { status: 201 },
      );
    }

    // ── Raster images: compress original + generate sized variants ──
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const origWidth = metadata.width ?? 0;
    const origHeight = metadata.height ?? 0;

    // Compress/optimise the original — cap at 2400 px wide to prevent huge
    // source files from being stored unmodified.
    const MAX_ORIGINAL_WIDTH = 2400;
    let pipeline = sharp(buffer);
    if (origWidth > MAX_ORIGINAL_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_ORIGINAL_WIDTH, withoutEnlargement: true });
    }

    // Keep original format but apply reasonable quality
    const formatOpts = formatOptions(file.type);
    const optimised = await pipeline.toFormat(formatOpts.format, formatOpts.options).toBuffer();
    await writeFile(path.join(UPLOAD_DIR, filename), optimised);

    // Generate resized WebP variants in parallel
    const baseName = `${base}-${timestamp}`;
    const variantResults: Record<string, string> = {};

    await Promise.all(
      VARIANTS.map(async (v) => {
        // Only downscale — don't enlarge small images
        if (origWidth < v.width && origHeight < v.height) return;

        const variantBuf = await sharp(buffer)
          .resize({
            width: v.width,
            height: v.height,
            fit: "cover",
            position: "centre",
          })
          .webp({ quality: 80 })
          .toBuffer();

        const variantFilename = `${baseName}-${v.suffix}.webp`;
        await writeFile(path.join(UPLOAD_DIR, variantFilename), variantBuf);
        variantResults[v.suffix] = `/uploads/${variantFilename}`;
      }),
    );

    return NextResponse.json(
      {
        filename,
        url: `/uploads/${filename}`,
        size: optimised.length,
        originalSize: buffer.length,
        dimensions: { width: origWidth, height: origHeight },
        variants: variantResults,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/media error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// ─── DELETE: remove original + all variants ─────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 });
    }

    // Prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);

    try {
      await unlink(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Also clean up any generated variants
    const parsed = path.parse(safeName);
    await Promise.allSettled(
      VARIANTS.map((v) => unlink(path.join(UPLOAD_DIR, `${parsed.name}-${v.suffix}.webp`))),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /api/media error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatOptions(mime: string) {
  switch (mime) {
    case "image/png":
      return { format: "png" as const, options: { quality: 85, compressionLevel: 8 } };
    case "image/webp":
      return { format: "webp" as const, options: { quality: 82 } };
    case "image/gif":
      return { format: "gif" as const, options: {} };
    default: // jpeg
      return { format: "jpeg" as const, options: { quality: 82, mozjpeg: true } };
  }
}
