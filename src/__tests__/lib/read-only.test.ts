import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isReadOnly,
  isMutatingMethod,
  readOnlyResponse,
  applyReadOnly,
  assertWritable,
  ReadOnlyModeError,
  READ_ONLY_MESSAGE,
} from "@/lib/read-only";
import type { NextRequest } from "next/server";

function makeRequest(method: string, url = "https://example.com/api/careers") {
  return new Request(url, { method }) as unknown as NextRequest;
}

describe("read-only helpers", () => {
  const original = process.env.READ_ONLY;

  beforeEach(() => {
    delete process.env.READ_ONLY;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.READ_ONLY;
    } else {
      process.env.READ_ONLY = original;
    }
  });

  describe("isReadOnly", () => {
    it("returns false when READ_ONLY is unset", () => {
      expect(isReadOnly()).toBe(false);
    });

    it("returns false for empty / falsy values", () => {
      process.env.READ_ONLY = "";
      expect(isReadOnly()).toBe(false);
      process.env.READ_ONLY = "false";
      expect(isReadOnly()).toBe(false);
      process.env.READ_ONLY = "0";
      expect(isReadOnly()).toBe(false);
    });

    it("accepts common truthy spellings", () => {
      for (const value of ["true", "TRUE", "1", "yes", "on", " true "]) {
        process.env.READ_ONLY = value;
        expect(isReadOnly()).toBe(true);
      }
    });
  });

  describe("isMutatingMethod", () => {
    it("treats GET/HEAD/OPTIONS as safe", () => {
      expect(isMutatingMethod("GET")).toBe(false);
      expect(isMutatingMethod("head")).toBe(false);
      expect(isMutatingMethod("OPTIONS")).toBe(false);
    });

    it("treats POST/PUT/PATCH/DELETE as mutating", () => {
      expect(isMutatingMethod("POST")).toBe(true);
      expect(isMutatingMethod("PUT")).toBe(true);
      expect(isMutatingMethod("PATCH")).toBe(true);
      expect(isMutatingMethod("DELETE")).toBe(true);
    });
  });

  describe("readOnlyResponse", () => {
    it("returns a 503 with Retry-After and no-store headers", async () => {
      const res = readOnlyResponse();
      expect(res.status).toBe(503);
      expect(res.headers.get("Retry-After")).toBe("300");
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      const body = await res.json();
      expect(body).toEqual({
        error: "read_only_mode",
        message: READ_ONLY_MESSAGE,
      });
    });
  });

  describe("applyReadOnly", () => {
    it("returns null when flag is off regardless of method", () => {
      expect(applyReadOnly(makeRequest("POST"))).toBeNull();
      expect(applyReadOnly(makeRequest("GET"))).toBeNull();
    });

    it("returns null for safe methods even when flag is on", () => {
      process.env.READ_ONLY = "true";
      expect(applyReadOnly(makeRequest("GET"))).toBeNull();
      expect(applyReadOnly(makeRequest("HEAD"))).toBeNull();
      expect(applyReadOnly(makeRequest("OPTIONS"))).toBeNull();
    });

    it("returns a 503 for mutating methods when flag is on", () => {
      process.env.READ_ONLY = "true";
      for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
        const res = applyReadOnly(makeRequest(method));
        expect(res).not.toBeNull();
        expect(res?.status).toBe(503);
      }
    });
  });

  describe("assertWritable", () => {
    it("is a no-op when the flag is off", () => {
      expect(() => assertWritable()).not.toThrow();
    });

    it("throws ReadOnlyModeError when the flag is on", () => {
      process.env.READ_ONLY = "true";
      expect(() => assertWritable()).toThrow(ReadOnlyModeError);
      try {
        assertWritable();
      } catch (err) {
        expect(err).toBeInstanceOf(ReadOnlyModeError);
        expect((err as ReadOnlyModeError).code).toBe("READ_ONLY_MODE");
        expect((err as Error).message).toBe(READ_ONLY_MESSAGE);
      }
    });
  });
});
