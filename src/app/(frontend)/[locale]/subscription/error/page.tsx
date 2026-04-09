import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export const metadata = { title: "Subscription Error" };

export default async function SubscriptionErrorPage({
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
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-status-error/10 text-status-error mb-6">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-3">
            {dict.subscription.errorTitle}
          </h1>
          <p className="text-text-secondary mb-8">{dict.subscription.errorMessage}</p>
          <Link href={`/${locale}`} className="text-accent font-medium hover:underline">
            {dict.cta.back} &rarr;
          </Link>
        </div>
      </Container>
    </section>
  );
}
