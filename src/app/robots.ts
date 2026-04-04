import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/diagnostic/assessment"],
    },
    sitemap: "https://sowa.skillnetireland.ie/sitemap.xml",
  };
}
