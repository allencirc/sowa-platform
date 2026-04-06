import { vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@/generated/prisma/client";

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Mock the prisma module so all imports get the mock
vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

// Reset mocks between tests
beforeEach(() => {
  mockReset(prismaMock);
});
