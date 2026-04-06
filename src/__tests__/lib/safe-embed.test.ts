import { describe, it, expect } from "vitest";
import { parseEmbedUrl, isValidParsedEmbed, EMBED_IFRAME_SANDBOX } from "@/lib/safe-embed";

describe("parseEmbedUrl — allowlist", () => {
  it("rejects non-allowlisted hosts", () => {
    expect(parseEmbedUrl("https://evil.example.com/video/1")).toBeNull();
    expect(parseEmbedUrl("https://tiktok.com/@x/video/1")).toBeNull();
    expect(parseEmbedUrl("https://facebook.com/watch?v=1")).toBeNull();
  });

  it("rejects garbage / non-http schemes", () => {
    expect(parseEmbedUrl("")).toBeNull();
    expect(parseEmbedUrl("not a url")).toBeNull();
    expect(parseEmbedUrl("javascript:alert(1)")).toBeNull();
    expect(parseEmbedUrl("data:text/html,<script>")).toBeNull();
    expect(parseEmbedUrl("file:///etc/passwd")).toBeNull();
  });
});

describe("parseEmbedUrl — YouTube", () => {
  it("parses a canonical watch URL", () => {
    const r = parseEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(r?.provider).toBe("youtube");
    expect(r?.id).toBe("dQw4w9WgXcQ");
    expect(r?.embedUrl).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("parses a youtu.be short URL", () => {
    const r = parseEmbedUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(r?.provider).toBe("youtube");
    expect(r?.id).toBe("dQw4w9WgXcQ");
  });

  it("parses an /embed/ URL", () => {
    const r = parseEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");
    expect(r?.provider).toBe("youtube");
  });

  it("parses a /shorts/ URL", () => {
    const r = parseEmbedUrl("https://www.youtube.com/shorts/abc123XYZ_-");
    expect(r?.provider).toBe("youtube");
    expect(r?.id).toBe("abc123XYZ_-");
  });

  it("rejects a YouTube URL with no video id", () => {
    expect(parseEmbedUrl("https://www.youtube.com/")).toBeNull();
    expect(parseEmbedUrl("https://www.youtube.com/watch")).toBeNull();
  });
});

describe("parseEmbedUrl — Vimeo", () => {
  it("parses a canonical vimeo URL", () => {
    const r = parseEmbedUrl("https://vimeo.com/123456789");
    expect(r?.provider).toBe("vimeo");
    expect(r?.id).toBe("123456789");
    expect(r?.embedUrl).toBe("https://player.vimeo.com/video/123456789");
  });

  it("parses a player.vimeo.com/video URL", () => {
    const r = parseEmbedUrl("https://player.vimeo.com/video/987654");
    expect(r?.provider).toBe("vimeo");
    expect(r?.id).toBe("987654");
  });

  it("rejects a vimeo profile URL", () => {
    expect(parseEmbedUrl("https://vimeo.com/someuser")).toBeNull();
  });
});

describe("parseEmbedUrl — Twitter / X", () => {
  it("parses a twitter.com status URL", () => {
    const r = parseEmbedUrl("https://twitter.com/jack/status/20");
    // minimum id length is 5; 20 is short — should fail
    expect(r).toBeNull();
  });

  it("parses a realistic tweet id", () => {
    const r = parseEmbedUrl("https://twitter.com/elonmusk/status/1234567890123456789");
    expect(r?.provider).toBe("twitter");
    expect(r?.id).toBe("1234567890123456789");
    expect(r?.embedUrl).toContain(
      "https://platform.twitter.com/embed/Tweet.html?id=1234567890123456789",
    );
  });

  it("parses x.com as twitter", () => {
    const r = parseEmbedUrl("https://x.com/user/status/1234567890123456789");
    expect(r?.provider).toBe("twitter");
  });

  it("rejects a twitter profile URL (no status)", () => {
    expect(parseEmbedUrl("https://twitter.com/someuser")).toBeNull();
  });
});

describe("parseEmbedUrl — LinkedIn", () => {
  it("parses a linkedin embed URL", () => {
    const r = parseEmbedUrl(
      "https://www.linkedin.com/embed/feed/update/urn:li:share:7000000000000000000",
    );
    expect(r?.provider).toBe("linkedin");
    expect(r?.embedUrl).toContain("https://www.linkedin.com/embed/feed/update/");
  });

  it("rejects a linkedin feed post (non-embed) URL", () => {
    expect(
      parseEmbedUrl("https://www.linkedin.com/feed/update/urn:li:activity:7000000000000000000/"),
    ).toBeNull();
  });
});

describe("isValidParsedEmbed", () => {
  it("accepts a freshly parsed embed", () => {
    const r = parseEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(isValidParsedEmbed(r)).toBe(true);
  });

  it("rejects a tampered embed whose url no longer resolves", () => {
    expect(
      isValidParsedEmbed({
        provider: "youtube",
        url: "https://evil.example.com/",
        embedUrl: "https://www.youtube.com/embed/xxx",
        id: "xxx",
      }),
    ).toBe(false);
  });

  it("rejects a provider mismatch", () => {
    expect(
      isValidParsedEmbed({
        provider: "vimeo",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        embedUrl: "https://player.vimeo.com/video/1",
        id: "1",
      }),
    ).toBe(false);
  });

  it("rejects non-objects / missing fields", () => {
    expect(isValidParsedEmbed(null)).toBe(false);
    expect(isValidParsedEmbed("str")).toBe(false);
    expect(isValidParsedEmbed({})).toBe(false);
  });
});

describe("EMBED_IFRAME_SANDBOX", () => {
  it("does not grant top-navigation or downloads", () => {
    expect(EMBED_IFRAME_SANDBOX).not.toContain("allow-top-navigation");
    expect(EMBED_IFRAME_SANDBOX).not.toContain("allow-downloads");
  });

  it("includes allow-scripts (required for provider players)", () => {
    expect(EMBED_IFRAME_SANDBOX).toContain("allow-scripts");
  });
});
