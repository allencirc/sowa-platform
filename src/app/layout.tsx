import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { NonceProvider } from "@/components/NonceProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { defaultLocale, isLocale, localeBcp47, type Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/queries";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Subsets cover every script the platform ships: `latin` for English,
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl();
  const siteTitle = `${settings.siteName} — ${settings.siteFullName}`;
  const description = `Ireland's national careers platform for ${settings.sectorName}. Explore career pathways, training courses, events, and skills diagnostics.`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: `%s — ${settings.siteName}`,
    },
    description,
    keywords: [
      settings.sectorName,
      `${settings.sectorName} careers`,
      `${settings.sectorName} training`,
      `${settings.sectorName} jobs`,
      "career pathways",
      "skills diagnostic",
      "NFQ accredited courses",
      "Skillnet Ireland",
      "green jobs Ireland",
    ],
    authors: [{ name: settings.siteFullName }],
    creator: settings.siteFullName,
    publisher: settings.siteFullName,
    formatDetection: {
      email: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_IE",
      url: siteUrl,
      siteName: settings.siteFullName,
      title: siteTitle,
      description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description,
      images: ["/og-image.png"],
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
      canonical: siteUrl,
    },
  };
}

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
  const nonce = headerList.get("x-nonce") ?? "";

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
        <ThemeProvider />
        <NonceProvider nonce={nonce}>
          {children}
          <CookieConsent />
        </NonceProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
