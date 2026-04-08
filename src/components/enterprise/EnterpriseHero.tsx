import Link from "next/link";
import { Building2 } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import type { Dictionary, Locale } from "@/lib/i18n";

export function EnterpriseHero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-primary text-text-inverse">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light/30 to-primary" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl lg:max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-5 w-5 text-secondary" />
            <span className="text-sm font-semibold tracking-widest uppercase text-secondary">
              {dict.nav.enterprise}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            {dict.enterprise.title}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed max-w-xl">
            {dict.enterprise.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={`/${locale}/diagnostic`} className={buttonClassName("secondary", "lg")}>
              {dict.enterprise.ctaDiagnostic}
            </Link>
            <Link
              href={`/${locale}/training`}
              className={buttonClassName(
                "outline",
                "lg",
                "border-white/60 text-white hover:bg-white hover:text-primary",
              )}
            >
              {dict.enterprise.ctaTraining}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
