import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock nodemailer before importing email module
const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-123" });
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

import {
  sendEmail,
  contentSubmittedForReview,
  contentApproved,
  contentRejected,
  contentPublished,
} from "@/lib/email";

describe("sendEmail", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("logs and does not send when EMAIL_ENABLED is not true", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    process.env.EMAIL_ENABLED = "false";

    await sendEmail("test@example.com", "Subject", "<p>Body</p>");

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("(disabled)"));
    consoleSpy.mockRestore();
  });

  it("sends email via nodemailer when EMAIL_ENABLED is true", async () => {
    process.env.EMAIL_ENABLED = "true";
    process.env.SMTP_FROM = "test@sowa.ie";

    await sendEmail("recipient@example.com", "Test Subject", "<p>Hello</p>");

    expect(mockSendMail).toHaveBeenCalledWith({
      from: "test@sowa.ie",
      to: "recipient@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
    });
  });

  it("catches and logs errors without throwing", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.EMAIL_ENABLED = "true";
    mockSendMail.mockRejectedValueOnce(new Error("SMTP connection failed"));

    // Should not throw
    await expect(sendEmail("test@example.com", "Subject", "<p>Body</p>")).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to send"),
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});

describe("email templates", () => {
  it("contentSubmittedForReview includes title, type and author", () => {
    const result = contentSubmittedForReview("Wind Turbine Tech", "CAREER", "Jane Doe");

    expect(result.subject).toContain("Wind Turbine Tech");
    expect(result.html).toContain("Wind Turbine Tech");
    expect(result.html).toContain("Jane Doe");
    expect(result.html).toContain("Career");
  });

  it("contentApproved includes title and type", () => {
    const result = contentApproved("Safety Workshop", "EVENT");

    expect(result.subject).toContain("approved");
    expect(result.html).toContain("Safety Workshop");
    expect(result.html).toContain("Event");
  });

  it("contentRejected includes title, type, and rejection note", () => {
    const result = contentRejected("Draft Course", "COURSE", "Needs more detail on prerequisites");

    expect(result.subject).toContain("Draft Course");
    expect(result.html).toContain("Draft Course");
    expect(result.html).toContain("Needs more detail on prerequisites");
    expect(result.html).toContain("Course");
  });

  it("contentPublished includes title and type", () => {
    const result = contentPublished("Industry Report 2026", "RESEARCH");

    expect(result.subject).toContain("Industry Report 2026");
    expect(result.html).toContain("Industry Report 2026");
    expect(result.html).toContain("Research");
  });
});
