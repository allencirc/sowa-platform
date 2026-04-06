import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { put, del, list } from "@vercel/blob";
import path from "path";
import sharp from "sharp";

// Variants generated for every raster upload.
// SVGs, audio, and video are stored as-is (no resize needed).
const VARIANTS = [
  { suffix: "hero", width: 1200, height: 675 },
  { suffix: "inline", width: 800, height: 400 },
  { suffix: "thumb", width: 400, height: 225 },
] as const;

// ─── Accepted MIME types by category ───────────────────────────────────────
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

const VIDEO_TYPES = ["video/mp4", "video/webm"];

const AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/x-wav"];

const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES, ...AUDIO_TYPES];

// Size limits per category
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20 MB

function getMediaCategory(mime: string): "image" | "video" | "audio" {
  if (VIDEO_TYPES.includes(mime)) return "video";
  if (AUDIO_TYPES.includes(mime)) return "audio";
  return "image";
}

function getMaxSize(category: "image" | "video" | "audio"): number {
  if (category === "video") return MAX_VIDEO_SIZE;
  if (category === "audio") return MAX_AUDIO_SIZE;
  return MAX_IMAGE_SIZE;
}

function formatSizeLimit(bytes: number): string {
  return `${bytes / (1024 * 1024)}MB`;
}

function categoryFromPathname(pathname: string): "image" | "video" | "audio" {
  const ext = path.extname(pathname).toLowerCase();
  if ([".mp4", ".webm"].includes(ext)) return "video";
  if ([".mp3", ".wav"].includes(ext)) return "audio";
  return "image";
}

// ─── GET: list all media ────────────────────────────────────────────────────

export async function GET() {
  try {
    await requireAuth();

    const { blobs } = await list();

    // Exclude variant files from the listing — they are implementation details.
    const originals = blobs.filter(
      (b) => !VARIANTS.some((v) => b.pathname.includes(`-${v.suffix}.`)),
    );

    // Build a set of all blob pathnames for fast variant lookup
    const allPathnames = new Set(blobs.map((b) => b.pathname));

    const media = originals.map((blob) => {
      const filename = path.basename(blob.pathname);
      const baseName = path.parse(filename).name;
      const category = categoryFromPathname(blob.pathname);

      // Discover which variants exist for this file
      const variants: Record<string, string> = {};
      if (category === "image") {
        for (const v of VARIANTS) {
          const variantPathname = `media/${baseName}-${v.suffix}.webp`;
          if (allPathnames.has(variantPathname)) {
            const variantBlob = blobs.find((b) => b.pathname === variantPathname);
            if (variantBlob) {
              variants[v.suffix] = variantBlob.url;
            }
          }
        }
      }

      return {
        filename,
        url: blob.url,
        size: blob.size,
        createdAt: blob.uploadedAt.toISOString(),
        category,
        ...(Object.keys(variants).length > 0 && { variants }),
      };
    });

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG, MP4, WebM, MP3, WAV",
        },
        { status: 400 },
      );
    }

    // Size limit depends on media category
    const category = getMediaCategory(file.type);
    const maxSize = getMaxSize(category);
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${formatSizeLimit(maxSize)} for ${category}.` },
        { status: 400 },
      );
    }

    // Generate unique base name
    const ext = path.extname(file.name);
    const base = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();
    const timestamp = Date.now();
    const filename = `${base}-${timestamp}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // ── SVGs, audio, and video: store verbatim (no processing) ──
    if (file.type === "image/svg+xml" || category === "audio" || category === "video") {
      const blob = await put(`media/${filename}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json(
        { filename, url: blob.url, size: buffer.length, category },
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

    // Upload optimised original to Vercel Blob
    const originalBlob = await put(`media/${filename}`, optimised, {
      access: "public",
      contentType: file.type,
    });

    // Generate resized WebP variants in parallel and upload each
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
        const variantBlob = await put(`media/${variantFilename}`, variantBuf, {
          access: "public",
          contentType: "image/webp",
        });
        variantResults[v.suffix] = variantBlob.url;
      }),
    );

    return NextResponse.json(
      {
        filename,
        url: originalBlob.url,
        size: optimised.length,
        originalSize: buffer.length,
        dimensions: { width: origWidth, height: origHeight },
        variants: variantResults,
        category: "image",
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
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "No url provided" }, { status: 400 });
    }

    // Delete the original blob
    await del(url);

    // Also clean up any generated variants — find them by prefix
    const filename = path.basename(new URL(url).pathname);
    const parsed = path.parse(filename);
    const { blobs } = await list({ prefix: "media/" });
    const variantUrls = blobs
      .filter((b) => VARIANTS.some((v) => b.pathname === `media/${parsed.name}-${v.suffix}.webp`))
      .map((b) => b.url);

    if (variantUrls.length > 0) {
      await del(variantUrls);
    }

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
