import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSubscriptionSchema,
  updatePreferencesSchema,
  tokenQuerySchema,
  SubscriptionTopicEnum,
  SubscriptionFrequencyEnum,
} from "@/lib/validations";

// ── Schema validation tests ─────────────────────────────

describe("Subscription validation schemas", () => {
  describe("SubscriptionTopicEnum", () => {
    it("accepts all valid topics", () => {
      const topics = ["CAREERS", "TRAINING", "EVENTS", "RESEARCH", "NEWS", "DIAGNOSTIC"];
      for (const t of topics) {
        expect(SubscriptionTopicEnum.safeParse(t).success).toBe(true);
      }
    });

    it("rejects invalid topic", () => {
      expect(SubscriptionTopicEnum.safeParse("POLITICS").success).toBe(false);
    });
  });

  describe("SubscriptionFrequencyEnum", () => {
    it("accepts WEEKLY and MONTHLY", () => {
      expect(SubscriptionFrequencyEnum.safeParse("WEEKLY").success).toBe(true);
      expect(SubscriptionFrequencyEnum.safeParse("MONTHLY").success).toBe(true);
    });

    it("rejects DAILY", () => {
      expect(SubscriptionFrequencyEnum.safeParse("DAILY").success).toBe(false);
    });
  });

  describe("createSubscriptionSchema", () => {
    const validData = {
      email: "test@example.com",
      topics: ["CAREERS", "TRAINING"],
      frequency: "WEEKLY",
      gdprConsent: true,
    };

    it("accepts valid subscription data", () => {
      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts subscription with optional name", () => {
      const result = createSubscriptionSchema.safeParse({
        ...validData,
        name: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty string for name", () => {
      const result = createSubscriptionSchema.safeParse({
        ...validData,
        name: "",
      });
      expect(result.success).toBe(true);
    });

    it("defaults frequency to WEEKLY", () => {
      const result = createSubscriptionSchema.safeParse({
        email: "test@example.com",
        topics: ["NEWS"],
        gdprConsent: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.frequency).toBe("WEEKLY");
      }
    });

    it("rejects invalid email", () => {
      const result = createSubscriptionSchema.safeParse({
        ...validData,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty topics array", () => {
      const result = createSubscriptionSchema.safeParse({
        ...validData,
        topics: [],
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid topic in array", () => {
      const result = createSubscriptionSchema.safeParse({
        ...validData,
        topics: ["CAREERS", "INVALID_TOPIC"],
      });
      expect(result.success).toBe(false);
    });

    it("rejects false gdprConsent", () => {
      const result = createSubscriptionSchema.safeParse({
        ...validData,
        gdprConsent: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing gdprConsent", () => {
      const { gdprConsent, ...withoutConsent } = validData;
      const result = createSubscriptionSchema.safeParse(withoutConsent);
      expect(result.success).toBe(false);
    });

    it("rejects missing email", () => {
      const { email, ...withoutEmail } = validData;
      const result = createSubscriptionSchema.safeParse(withoutEmail);
      expect(result.success).toBe(false);
    });
  });

  describe("updatePreferencesSchema", () => {
    it("accepts valid update data", () => {
      const result = updatePreferencesSchema.safeParse({
        token: "abc123",
        topics: ["EVENTS", "RESEARCH"],
        frequency: "MONTHLY",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty token", () => {
      const result = updatePreferencesSchema.safeParse({
        token: "",
        topics: ["NEWS"],
        frequency: "WEEKLY",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty topics", () => {
      const result = updatePreferencesSchema.safeParse({
        token: "abc123",
        topics: [],
        frequency: "WEEKLY",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("tokenQuerySchema", () => {
    it("accepts non-empty token", () => {
      const result = tokenQuerySchema.safeParse({ token: "some-token-value" });
      expect(result.success).toBe(true);
    });

    it("rejects empty token", () => {
      const result = tokenQuerySchema.safeParse({ token: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing token", () => {
      const result = tokenQuerySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

// ── Token generation tests ──────────────────────────────

describe("Token generation", () => {
  it("crypto.randomBytes produces 64-char hex strings", async () => {
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates unique tokens", async () => {
    const crypto = await import("crypto");
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(crypto.randomBytes(32).toString("hex"));
    }
    expect(tokens.size).toBe(100);
  });
});
