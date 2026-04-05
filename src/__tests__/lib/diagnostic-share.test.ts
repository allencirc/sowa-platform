import { describe, it, expect } from "vitest";
import {
  encodeAnswers,
  decodeAnswers,
  buildShareUrl,
  SCHEMA_VERSION,
  isResultsTab,
  type AnswerSet,
} from "@/lib/diagnostic-share";

describe("diagnostic-share", () => {
  describe("encodeAnswers / decodeAnswers round-trip", () => {
    it("round-trips a simple string answer", () => {
      const answers: AnswerSet = { q1: "new_entrant", q8: "technical" };
      const encoded = encodeAnswers(answers);
      const decoded = decodeAnswers(encoded);
      expect(decoded.ok).toBe(true);
      if (decoded.ok) expect(decoded.answers).toEqual(answers);
    });

    it("round-trips multi-choice array answers", () => {
      const answers: AnswerSet = {
        q3: ["gwo_bst", "bosiet"],
        q5: ["electrical", "mechanical", "marine"],
        q8: "engineering",
      };
      const decoded = decodeAnswers(encodeAnswers(answers));
      expect(decoded.ok).toBe(true);
      if (decoded.ok) expect(decoded.answers).toEqual(answers);
    });

    it("round-trips a full 12-question answer set", () => {
      const answers: AnswerSet = {
        q1: "adjacent",
        q2: "3",
        q3: ["gwo_bst"],
        q4: "level8",
        q5: ["electrical", "data"],
        q6: "other_offshore",
        q7: "4",
        q8: "engineering",
        q9: "aware",
        q10: "3",
        q11: ["scada", "python"],
        q12: "regular",
      };
      const encoded = encodeAnswers(answers);
      const decoded = decodeAnswers(encoded);
      expect(decoded.ok).toBe(true);
      if (decoded.ok) expect(decoded.answers).toEqual(answers);
    });

    it("stays under ~300 chars for a typical 12-question run", () => {
      const answers: AnswerSet = {
        q1: "adjacent",
        q2: "3",
        q3: ["gwo_bst"],
        q4: "level8",
        q5: ["electrical", "mechanical"],
        q6: "other_offshore",
        q7: "4",
        q8: "engineering",
        q9: "aware",
        q10: "3",
        q11: ["scada"],
        q12: "regular",
      };
      const encoded = encodeAnswers(answers);
      // Budget: fits comfortably in a single short URL alongside
      // /diagnostic/assessment/results?a=...&tab=gaps
      expect(encoded.length).toBeLessThan(300);
    });

    it("produces URL-safe characters only (no +, /, =)", () => {
      const answers: AnswerSet = { q1: "new_entrant" };
      const encoded = encodeAnswers(answers);
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it("drops empty string values", () => {
      const decoded = decodeAnswers(encodeAnswers({ q1: "", q2: "a" }));
      expect(decoded.ok).toBe(true);
      if (decoded.ok) {
        expect(decoded.answers.q1).toBeUndefined();
        expect(decoded.answers.q2).toBe("a");
      }
    });

    it("drops empty array values", () => {
      const decoded = decodeAnswers(encodeAnswers({ q1: [], q2: ["x"] }));
      expect(decoded.ok).toBe(true);
      if (decoded.ok) {
        expect(decoded.answers.q1).toBeUndefined();
        expect(decoded.answers.q2).toEqual(["x"]);
      }
    });

    it("preserves non-ASCII characters via UTF-8", () => {
      // Should not happen in prod but must not crash.
      const decoded = decodeAnswers(encodeAnswers({ q1: "étudiant" }));
      expect(decoded.ok).toBe(true);
      if (decoded.ok) expect(decoded.answers.q1).toBe("étudiant");
    });
  });

  describe("decodeAnswers error handling", () => {
    it("returns empty for null / undefined / empty string", () => {
      expect(decodeAnswers(null).ok).toBe(false);
      expect(decodeAnswers(undefined).ok).toBe(false);
      expect(decodeAnswers("").ok).toBe(false);
    });

    it("returns malformed for non-base64 garbage", () => {
      const result = decodeAnswers("!!!not-base64!!!");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("malformed");
    });

    it("returns malformed for valid base64 of non-JSON", () => {
      // 'hello' base64url encoded
      const result = decodeAnswers("aGVsbG8");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("malformed");
    });

    it("returns incompatible_version for old schema version", () => {
      const bogusPayload = Buffer.from(
        JSON.stringify({ v: 999, a: { q1: "x" } }),
        "utf8"
      )
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      const result = decodeAnswers(bogusPayload);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("incompatible_version");
        expect(result.version).toBe(999);
      }
    });

    it("returns malformed when version is missing", () => {
      const payload = Buffer.from(
        JSON.stringify({ a: { q1: "x" } }),
        "utf8"
      )
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      const result = decodeAnswers(payload);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("malformed");
    });

    it("returns malformed when answers is not an object", () => {
      const payload = Buffer.from(
        JSON.stringify({ v: SCHEMA_VERSION, a: "not-an-object" }),
        "utf8"
      )
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      const result = decodeAnswers(payload);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toBe("malformed");
    });
  });

  describe("buildShareUrl", () => {
    it("constructs a canonical URL with locale prefix and tab", () => {
      const url = buildShareUrl(
        "https://sowa.ie",
        "en",
        { q1: "adjacent", q8: "engineering" },
        "roles"
      );
      expect(url).toMatch(
        /^https:\/\/sowa\.ie\/en\/diagnostic\/assessment\/results\?a=[A-Za-z0-9_-]+&tab=roles$/
      );
    });

    it("defaults to the gaps tab", () => {
      const url = buildShareUrl("https://sowa.ie", "en", { q1: "x" });
      expect(url).toContain("&tab=gaps");
    });

    it("strips trailing slashes from origin", () => {
      const url = buildShareUrl("https://sowa.ie/", "en", { q1: "x" });
      expect(url.startsWith("https://sowa.ie/en/")).toBe(true);
      expect(url.startsWith("https://sowa.ie//")).toBe(false);
    });

    it("handles an empty locale prefix", () => {
      const url = buildShareUrl("https://sowa.ie", "", { q1: "x" });
      expect(url.startsWith("https://sowa.ie/diagnostic/")).toBe(true);
    });
  });

  describe("isResultsTab", () => {
    it("accepts only the known tab ids", () => {
      expect(isResultsTab("gaps")).toBe(true);
      expect(isResultsTab("roles")).toBe(true);
      expect(isResultsTab("other")).toBe(false);
      expect(isResultsTab(null)).toBe(false);
      expect(isResultsTab(undefined)).toBe(false);
    });
  });
});
