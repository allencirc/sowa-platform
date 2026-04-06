import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { defaultLocale, isLocale, localeBcp47, type Locale } from "@/lib/i18n";
import "./globals.css";

// Subsets cover every script SOWA ships: `latin` for English,
// `latin-ext` for Polish (ł, ą, ę) and European Portuguese diacritics,
// and `cyrillic` for Ukrainian. Irish uses standard Latin glyphs already
// in `latin`. See docs/adr/0001-i18n.md.
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0C2340",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sowa.skillnetireland.ie"),
  title: {
    default: "SOWA — Skillnet Offshore Wind Academy",
    template: "%s — SOWA",
  },
  description:
    "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics.",
  keywords: [
    "offshore wind",
    "wind energy careers",
    "offshore wind training",
    "Ireland wind energy",
    "offshore wind jobs",
    "renewable energy careers",
    "Skillnet Ireland",
    "wind technician",
    "marine operations",
    "offshore wind academy",
    "OWE skills",
    "wind energy courses",
    "NFQ accredited courses",
    "energy transition",
    "green jobs Ireland",
  ],
  authors: [{ name: "Skillnet Ireland" }],
  creator: "Skillnet Offshore Wind Academy",
  publisher: "Skillnet Ireland",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://sowa.skillnetireland.ie",
    siteName: "Skillnet Offshore Wind Academy",
    title: "SOWA — Skillnet Offshore Wind Academy",
    description:
      "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SOWA — Skillnet Offshore Wind Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SOWA — Skillnet Offshore Wind Academy",
    description:
      "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics.",
    images: ["/og-image.png"],
    creator: "@SkillnetIreland",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  alternates: {
    canonical: "https://sowa.skillnetireland.ie",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The proxy sets `x-sowa-locale` on every localised request (see
  // src/proxy.ts). This layout sits above `[locale]`, so we can't pull the
  // locale from route params — we read the header instead. Admin/API and
  // other non-localised surfaces get the default locale's BCP-47 tag.
  const headerList = await headers();
  const rawLocale = headerList.get("x-sowa-locale");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const htmlLang = localeBcp47[locale];

  return (
    <html lang={htmlLang} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-primary focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        {children}
        <CookieConsent />
        <SpeedInsights />
      </body>
    </html>
  );
}
