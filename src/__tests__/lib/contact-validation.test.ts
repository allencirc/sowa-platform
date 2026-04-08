import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/lib/validations";

const validData = {
  name: "Jane Doe",
  email: "jane@example.com",
  organisation: "Acme Corp",
  subject: "GENERAL" as const,
  message: "I would like to learn more about your training programmes.",
  gdprConsent: true,
};

describe("contactFormSchema", () => {
  it("accepts valid submission", () => {
    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = contactFormSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
    }
  });

  it("rejects invalid email", () => {
    const result = contactFormSchema.safeParse({ ...validData, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("rejects missing subject", () => {
    const result = contactFormSchema.safeParse({ ...validData, subject: undefined });
    expect(result.success).toBe(false);
  });

  it("rejects invalid subject value", () => {
    const result = contactFormSchema.safeParse({ ...validData, subject: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects message shorter than 10 characters", () => {
    const result = contactFormSchema.safeParse({ ...validData, message: "Hi" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("message");
    }
  });

  it("rejects message longer than 2000 characters", () => {
    const result = contactFormSchema.safeParse({ ...validData, message: "x".repeat(2001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("message");
    }
  });

  it("rejects gdprConsent set to false", () => {
    const result = contactFormSchema.safeParse({ ...validData, gdprConsent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("gdprConsent");
    }
  });

  it("accepts empty string for optional organisation", () => {
    const result = contactFormSchema.safeParse({ ...validData, organisation: "" });
    expect(result.success).toBe(true);
  });

  it("accepts omitted organisation", () => {
    const { organisation: _, ...withoutOrg } = validData;
    const result = contactFormSchema.safeParse(withoutOrg);
    expect(result.success).toBe(true);
  });

  it("accepts all valid subject values", () => {
    const subjects = ["GENERAL", "TRAINING", "PARTNERSHIP", "CAREER_GUIDANCE", "TECHNICAL_SUPPORT"];
    for (const subject of subjects) {
      const result = contactFormSchema.safeParse({ ...validData, subject });
      expect(result.success).toBe(true);
    }
  });
});
