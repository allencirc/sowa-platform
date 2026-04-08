import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { join } from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categoryMap: Record<string, string> = {
  Technical: "TECHNICAL",
  Safety: "SAFETY",
  Regulatory: "REGULATORY",
  Digital: "DIGITAL",
  Management: "MANAGEMENT",
};

interface EscoMapping {
  slug: string;
  name: string;
  category: string;
  escoUri: string;
  onetCode?: string;
  isTransferable: boolean;
  adjacentSectors: string[];
  escoLevel: number;
  escoType: string;
}

async function main() {
  const raw = readFileSync(join(__dirname, "../src/lib/data/esco-mappings.json"), "utf-8");
  const mappings: EscoMapping[] = JSON.parse(raw);

  console.log(`🔗 Upserting ${mappings.length} skills with ESCO taxonomy data...`);

  let created = 0;
  let updated = 0;

  for (const mapping of mappings) {
    const data = {
      name: mapping.name,
      category: (categoryMap[mapping.category] ?? mapping.category) as never,
      escoUri: mapping.escoUri,
      onetCode: mapping.onetCode ?? null,
      isTransferable: mapping.isTransferable,
      adjacentSectors: mapping.adjacentSectors,
      escoLevel: mapping.escoLevel,
      escoType: mapping.escoType,
    };

    const existing = await prisma.skill.findUnique({ where: { slug: mapping.slug } });

    if (existing) {
      await prisma.skill.update({
        where: { slug: mapping.slug },
        data,
      });
      updated++;
    } else {
      await prisma.skill.create({
        data: { slug: mapping.slug, ...data },
      });
      created++;
    }
  }

  console.log(`✅ ESCO seed complete: ${created} created, ${updated} updated`);
}

main()
  .catch((e) => {
    console.error("❌ ESCO seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
