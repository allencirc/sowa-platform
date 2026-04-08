import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { EnterpriseHero } from "@/components/enterprise/EnterpriseHero";
import { ValueCards } from "@/components/enterprise/ValueCards";
import { HowItWorks } from "@/components/enterprise/HowItWorks";
import { TestimonialPlaceholder } from "@/components/enterprise/TestimonialPlaceholder";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Enterprise Support — SOWA",
  description:
    "Workforce planning, skills gap analysis, and training solutions for organisations building offshore wind energy teams in Ireland.",
  alternates: { canonical: "/enterprise" },
  openGraph: {
    title: "Enterprise Support — SOWA",
    description:
      "Strategic workforce development solutions for organisations entering or expanding in Ireland's offshore wind energy sector.",
    url: "/enterprise",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise Support — SOWA",
    description:
      "Build your OWE talent pipeline with SOWA's enterprise workforce development tools.",
  },
};

export default async function EnterprisePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = await getDictionary(locale);

  return (
    <>
      {/* Hero */}
      <EnterpriseHero locale={locale} dict={dict} />

      {/* Value Proposition Cards */}
      <ValueCards dict={dict} />

      {/* How It Works */}
      <HowItWorks dict={dict} />

      {/* Diagnostic CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-secondary-dark via-secondary to-secondary-light text-white">
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <ClipboardCheck className="h-8 w-8" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                {dict.enterprise.diagnosticCta.title}
              </h3>
              <p className="text-lg text-white/80 max-w-xl">
                {dict.enterprise.diagnosticCta.description}
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link href={`/${locale}/diagnostic`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-secondary-dark"
                >
                  {dict.enterprise.ctaDiagnostic}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Training Directory CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-accent-dark" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                {dict.enterprise.trainingCta.title}
              </h3>
              <p className="text-text-secondary max-w-xl">
                {dict.enterprise.trainingCta.description}
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link href={`/${locale}/training`}>
                <Button size="lg" variant="primary">
                  {dict.enterprise.trainingCta.cta}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials Placeholder */}
      <TestimonialPlaceholder dict={dict} />

      {/* Contact / Inquiry Form */}
      <section className="py-16 sm:py-20 bg-white" id="contact">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
                {dict.enterprise.contactSection.title}
              </h2>
              <p className="text-text-secondary">{dict.enterprise.contactSection.subtitle}</p>
            </div>

            <ContactForm dict={dict.contact} locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
