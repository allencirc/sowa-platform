import { type ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Skillnet Offshore Wind Academy (SOWA)",
  alternateName: "SOWA",
  url: "https://sowa.skillnetireland.ie",
  logo: "https://sowa.skillnetireland.ie/icon.svg",
  description:
    "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics.",
  parentOrganization: {
    "@type": "Organization",
    name: "Skillnet Ireland",
    url: "https://www.skillnetireland.ie",
  },
  areaServed: {
    "@type": "Country",
    name: "Ireland",
  },
  sameAs: [
    "https://www.linkedin.com/company/skillnet-ireland",
    "https://twitter.com/SkillnetIreland",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SOWA — Skillnet Offshore Wind Academy",
  url: "https://sowa.skillnetireland.ie",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://sowa.skillnetireland.ie/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
