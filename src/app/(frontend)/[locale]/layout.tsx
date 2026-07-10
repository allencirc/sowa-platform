import { notFound } from "next/navigation";
import { type ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/queries";
import { getSiteUrl } from "@/lib/site-url";
import type { SiteSettings } from "@/lib/theme-defaults";

function buildOrganizationJsonLd(settings: SiteSettings, siteUrl: string) {
  const socialUrls = Object.values(settings.socialLinks ?? {}).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: `${settings.siteFullName} (${settings.siteName})`,
    alternateName: settings.siteName,
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description: `Ireland's national careers platform for ${settings.sectorName}. Explore career pathways, training courses, events, and skills diagnostics.`,
    areaServed: {
      "@type": "Country",
      name: "Ireland",
    },
    ...(socialUrls.length > 0 ? { sameAs: socialUrls } : {}),
  };
}

function buildWebsiteJsonLd(settings: SiteSettings, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${settings.siteName} — ${settings.siteFullName}`,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FrontendLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const [dict, siteSettings] = await Promise.all([getDictionary(locale), getSiteSettings()]);
  const siteUrl = getSiteUrl();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildOrganizationJsonLd(siteSettings, siteUrl)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildWebsiteJsonLd(siteSettings, siteUrl)),
        }}
      />
      <Header locale={locale} dict={dict} />
      <main id="main-content" className="flex-1 page-enter">
        {children}
      </main>
      <Footer
        locale={locale}
        dict={dict}
        customFooterText={siteSettings.footerText}
        socialLinks={siteSettings.socialLinks}
      />
    </>
  );
}
