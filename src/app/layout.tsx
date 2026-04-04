import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "SOWA — Skillnet Offshore Wind Academy",
    template: "%s — SOWA",
  },
  description:
    "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics.",
  openGraph: {
    type: "website",
    locale: "en_IE",
    siteName: "Skillnet Offshore Wind Academy",
    title: "SOWA — Skillnet Offshore Wind Academy",
    description:
      "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics.",
  },
  metadataBase: new URL("https://sowa.skillnetireland.ie"),
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
      </body>
    </html>
  );
}
