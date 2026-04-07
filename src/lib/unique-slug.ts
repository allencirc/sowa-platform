import { prisma } from "@/lib/prisma";

type SlugModel = "career" | "course" | "event" | "research" | "newsArticle" | "skill";

/**
 * Ensure a slug is unique within its model table.
 * If `base-slug` already exists, tries `base-slug-2`, `base-slug-3`, etc.
 * Returns the first available slug.
 */
export async function uniqueSlug(baseSlug: string, model: SlugModel): Promise<string> {
  // Strip any existing numeric suffix so we always search from the base
  const stripped = baseSlug.replace(/-\d+$/, "");

  // Find all slugs that match the pattern: base, base-2, base-3, ...
  const delegate = prisma[model] as unknown as {
    findMany: (args: {
      where: { slug: { startsWith: string } };
      select: { slug: true };
    }) => Promise<{ slug: string }[]>;
  };

  const existing = await delegate.findMany({
    where: { slug: { startsWith: stripped } },
    select: { slug: true },
  });

  const existingSlugs = new Set(existing.map((r) => r.slug));

  // If the base slug is free, use it
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  // Otherwise find the next available number
  let n = 2;
  while (existingSlugs.has(`${stripped}-${n}`)) {
    n++;
  }
  return `${stripped}-${n}`;
}
