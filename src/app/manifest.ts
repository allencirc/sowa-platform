import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/queries";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  return {
    name: `${settings.siteName} — ${settings.siteFullName}`,
    short_name: settings.siteName,
    description: `Ireland's national careers platform for ${settings.sectorName}. Explore career pathways, training courses, events, and skills diagnostics.`,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F9FC",
    theme_color: "#0C2340",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
