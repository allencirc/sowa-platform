import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../mocks/prisma";

vi.mock("@/lib/api-utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api-utils")>();
  return {
    ...original,
    applyRateLimit: vi.fn().mockReturnValue(null),
  };
});

vi.mock("@/lib/auth-utils", () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: "user-1", role: "ADMIN" }),
  requireRole: vi.fn().mockResolvedValue({ id: "user-1", role: "ADMIN" }),
  AuthError: class AuthError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "AuthError";
      this.status = status;
    }
  },
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
}));

function makeRequest(url: string, options: RequestInit = {}) {
  return new Request(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  }) as unknown as import("next/server").NextRequest;
}

describe("GET /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults when no row exists", async () => {
    (prismaMock.siteSettings.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const { GET } = await import("@/app/api/settings/route");
    const request = makeRequest("http://localhost:3000/api/settings");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.colorPrimary).toBe("#0c2340");
    expect(data.colorSecondary).toBe("#00a878");
    expect(data.colorAccent).toBe("#4a90d9");
  });

  it("returns stored values when row exists", async () => {
    (prismaMock.siteSettings.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "default",
      colorPrimary: "#ff0000",
      colorPrimaryLight: null,
      colorPrimaryDark: null,
      colorSecondary: null,
      colorSecondaryLight: null,
      colorSecondaryDark: null,
      colorAccent: null,
      colorAccentLight: null,
      colorAccentDark: null,
      headingFont: "Montserrat",
      bodyFont: null,
      logoUrl: null,
      faviconUrl: null,
      footerText: "Custom footer",
      socialLinks: { twitter: "https://twitter.com/test" },
      updatedAt: new Date(),
      updatedById: null,
    });

    const { GET } = await import("@/app/api/settings/route");
    const request = makeRequest("http://localhost:3000/api/settings");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.colorPrimary).toBe("#ff0000");
    expect(data.headingFont).toBe("Montserrat");
    expect(data.footerText).toBe("Custom footer");
    // Non-set fields fall back to defaults
    expect(data.colorSecondary).toBe("#00a878");
  });
});

describe("PUT /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts with valid data", async () => {
    const updatedRow = {
      id: "default",
      colorPrimary: "#112233",
      colorPrimaryLight: null,
      colorPrimaryDark: null,
      colorSecondary: null,
      colorSecondaryLight: null,
      colorSecondaryDark: null,
      colorAccent: null,
      colorAccentLight: null,
      colorAccentDark: null,
      headingFont: "Poppins",
      bodyFont: null,
      logoUrl: null,
      faviconUrl: null,
      footerText: null,
      socialLinks: null,
      updatedAt: new Date(),
      updatedById: "user-1",
    };
    (prismaMock.siteSettings.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(updatedRow);

    const { PUT } = await import("@/app/api/settings/route");
    const request = makeRequest("http://localhost:3000/api/settings", {
      method: "PUT",
      body: JSON.stringify({ colorPrimary: "#112233", headingFont: "Poppins" }),
    });
    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.colorPrimary).toBe("#112233");
    expect(data.headingFont).toBe("Poppins");
  });

  it("rejects invalid hex color", async () => {
    const { PUT } = await import("@/app/api/settings/route");
    const request = makeRequest("http://localhost:3000/api/settings", {
      method: "PUT",
      body: JSON.stringify({ colorPrimary: "not-a-color" }),
    });
    const response = await PUT(request);

    expect(response.status).toBe(400);
  });

  it("rejects non-admin users", async () => {
    const { requireRole } = await import("@/lib/auth-utils");
    const { AuthError } = await import("@/lib/auth-utils");
    (requireRole as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new AuthError("Forbidden", 403),
    );

    const { PUT } = await import("@/app/api/settings/route");
    const request = makeRequest("http://localhost:3000/api/settings", {
      method: "PUT",
      body: JSON.stringify({ colorPrimary: "#112233" }),
    });
    const response = await PUT(request);

    expect(response.status).toBe(403);
  });
});
