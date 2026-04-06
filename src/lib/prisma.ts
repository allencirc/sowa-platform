import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const rawConnectionString = process.env.DATABASE_URL!;

// `pg` now treats sslmode=prefer/require/verify-ca as aliases for verify-full
// and emits a deprecation warning. Strip the query param and pass an explicit
// ssl config so the warning doesn't fire at build/runtime.
function parseConnection(raw: string): { connectionString: string; ssl: boolean | { rejectUnauthorized: boolean } } {
  try {
    const url = new URL(raw);
    const sslmode = url.searchParams.get("sslmode");
    url.searchParams.delete("sslmode");
    const cleaned = url.toString();
    if (!sslmode || sslmode === "disable") {
      return { connectionString: cleaned, ssl: false };
    }
    return { connectionString: cleaned, ssl: { rejectUnauthorized: true } };
  } catch {
    return { connectionString: raw, ssl: { rejectUnauthorized: true } };
  }
}

const { connectionString, ssl } = parseConnection(rawConnectionString);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const adapter = new PrismaPg({ connectionString, ssl });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
