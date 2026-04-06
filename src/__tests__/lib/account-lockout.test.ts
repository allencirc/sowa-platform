import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { MAX_FAILED_ATTEMPTS, LOCKOUT_DURATION_MS } from "@/lib/account-lockout";

// ---------- Prisma mock ----------
const prismaMock = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

// ---------- Stub out next-auth so importing auth.ts doesn't explode ----------
vi.mock("next-auth", () => {
  // Capture the authorize function when NextAuth is called
  let _authorize: ((creds: Record<string, unknown>) => unknown) | null = null;

  const NextAuth = (opts: { providers: { options: { authorize: typeof _authorize } }[] }) => {
    _authorize = opts.providers[0]?.options?.authorize ?? null;
    return { handlers: {}, signIn: vi.fn(), signOut: vi.fn(), auth: vi.fn() };
  };

  // Allow tests to retrieve the captured authorize fn
  (NextAuth as unknown as Record<string, unknown>).__getAuthorize = () => _authorize;

  return { default: NextAuth };
});

vi.mock("next-auth/providers/credentials", () => ({
  default: (opts: Record<string, unknown>) => ({ options: opts }),
}));

vi.mock("@/lib/auth.types", () => ({}));

// ---------- helpers ----------

const HASHED_PASSWORD = bcrypt.hashSync("correct-password", 4);

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "test@example.com",
    name: "Test",
    role: "ADMIN",
    passwordHash: HASHED_PASSWORD,
    mustChangePassword: false,
    failedLoginAttempts: 0,
    lockedUntil: null,
    ...overrides,
  };
}

// Import auth.ts AFTER mocks are wired up so NextAuth receives our stubs
let authorize: (creds: Record<string, unknown>) => Promise<unknown>;

beforeEach(async () => {
  vi.resetModules();

  // Re-apply mocks for the fresh module graph
  vi.doMock("@/lib/prisma", () => ({ prisma: prismaMock }));

  // Re-import auth.ts to get a fresh authorize function
  await import("@/lib/auth");

  const NextAuth = (await import("next-auth")).default as unknown as Record<string, unknown>;
  authorize = (NextAuth as unknown as Record<string, { __getAuthorize: () => typeof authorize }>).__getAuthorize();

  // Clear mock call history
  prismaMock.user.findUnique.mockReset();
  prismaMock.user.update.mockReset();
});

// ---------- Tests ----------

describe("Account lockout", () => {
  it("increments failedLoginAttempts on wrong password", async () => {
    prismaMock.user.findUnique.mockResolvedValue(makeUser());
    prismaMock.user.update.mockResolvedValue(makeUser({ failedLoginAttempts: 1 }));

    const result = await authorize({ email: "test@example.com", password: "wrong" });

    expect(result).toBeNull();
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({ failedLoginAttempts: 1 }),
      }),
    );
  });

  it("locks the account after MAX_FAILED_ATTEMPTS failures", async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ failedLoginAttempts: MAX_FAILED_ATTEMPTS - 1 }),
    );
    prismaMock.user.update.mockResolvedValue(makeUser({ failedLoginAttempts: MAX_FAILED_ATTEMPTS }));

    await authorize({ email: "test@example.com", password: "wrong" });

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          failedLoginAttempts: MAX_FAILED_ATTEMPTS,
          lockedUntil: expect.any(Date),
        }),
      }),
    );

    // The lockedUntil should be approximately LOCKOUT_DURATION_MS from now
    const updateCall = prismaMock.user.update.mock.calls[0][0];
    const lockDate = updateCall.data.lockedUntil as Date;
    const expectedMin = Date.now() + LOCKOUT_DURATION_MS - 5000;
    const expectedMax = Date.now() + LOCKOUT_DURATION_MS + 5000;
    expect(lockDate.getTime()).toBeGreaterThan(expectedMin);
    expect(lockDate.getTime()).toBeLessThan(expectedMax);
  });

  it("rejects login with correct password when account is locked", async () => {
    const futureDate = new Date(Date.now() + LOCKOUT_DURATION_MS);
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ lockedUntil: futureDate, failedLoginAttempts: MAX_FAILED_ATTEMPTS }),
    );

    await expect(
      authorize({ email: "test@example.com", password: "correct-password" }),
    ).rejects.toThrow("Account temporarily locked. Try again later.");
  });

  it("resets failedLoginAttempts on successful login", async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ failedLoginAttempts: 3 }),
    );
    prismaMock.user.update.mockResolvedValue(makeUser());

    const result = await authorize({ email: "test@example.com", password: "correct-password" });

    expect(result).not.toBeNull();
    expect(result).toEqual(
      expect.objectContaining({ id: "user-1", email: "test@example.com" }),
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { failedLoginAttempts: 0, lockedUntil: null },
      }),
    );
  });

  it("allows login when lockout period has expired", async () => {
    const pastDate = new Date(Date.now() - 1000); // 1 second ago
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ lockedUntil: pastDate, failedLoginAttempts: MAX_FAILED_ATTEMPTS }),
    );
    prismaMock.user.update.mockResolvedValue(makeUser());

    const result = await authorize({ email: "test@example.com", password: "correct-password" });

    expect(result).not.toBeNull();
    expect(result).toEqual(
      expect.objectContaining({ id: "user-1", email: "test@example.com" }),
    );
  });
});
