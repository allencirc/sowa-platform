import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsent } from "@/components/layout/CookieConsent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg" },
    ],
  },
  alternates: {
    canonical: "https://sowa.skillnetireland.ie",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
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
