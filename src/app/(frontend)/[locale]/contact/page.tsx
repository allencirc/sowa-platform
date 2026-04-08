import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Skillnet Offshore Wind Academy. Ask about careers, training, partnerships, or technical support for Ireland's offshore wind energy sector.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — SOWA",
    description:
      "Get in touch with the Skillnet Offshore Wind Academy for career guidance, training information, and partnership inquiries.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Us — SOWA",
    description: "Get in touch with the Skillnet Offshore Wind Academy.",
  },
};

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = await getDictionary(locale);

  return (
    <>
      {/* Hero */}
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            {dict.contact.title}
          </h1>
          <p className="text-text-secondary max-w-2xl">{dict.contact.subtitle}</p>
        </Container>
      </section>

      {/* Form + sidebar */}
      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <ContactForm dict={dict.contact} locale={locale} />
            </div>

            {/* Sidebar info */}
            <aside className="space-y-6">
              <div className="rounded-xl bg-surface p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <Mail
                    className="h-5 w-5 text-secondary-dark mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Email</h3>
                    <p className="text-sm text-text-secondary">info@sowa.ie</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin
                    className="h-5 w-5 text-secondary-dark mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Address</h3>
                    <p className="text-sm text-text-secondary">
                      Skillnet Ireland, Q House,
                      <br />
                      76 Furze Road, Sandyford,
                      <br />
                      Dublin 18, D18 E268
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock
                    className="h-5 w-5 text-secondary-dark mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Response Time</h3>
                    <p className="text-sm text-text-secondary">
                      We typically respond within 2 business days.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
