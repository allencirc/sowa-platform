import Link from "next/link";
import { MailX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export const metadata = { title: "Unsubscribed" };

export default async function SubscriptionUnsubscribedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = await getDictionary(locale);

  return (
    <section className="py-20 sm:py-28 bg-white">
      <Container>
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 text-text-muted mb-6">
            <MailX className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            {dict.subscription.unsubscribeTitle}
          </h1>
          <p className="text-text-secondary mb-8">{dict.subscription.unsubscribeMessage}</p>
          <Link href={`/${locale}`} className="text-accent font-medium hover:underline">
            {dict.cta.back} &rarr;
          </Link>
        </div>
      </Container>
    </section>
  );
}
