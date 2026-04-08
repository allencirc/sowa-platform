import Link from "next/link";
import { Wind, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { format, type Dictionary, type Locale } from "@/lib/i18n";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
  customFooterText?: string | null;
  socialLinks?: Record<string, string> | null;
}

const socialLabels: Record<string, string> = {
  twitter: "Twitter",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  instagram: "Instagram",
};

export function Footer({ locale, dict, customFooterText, socialLinks }: FooterProps) {
  const prefix = `/${locale}`;

  const footerColumns = [
    {
      title: dict.footer.columns.careers,
      links: [
        { label: dict.nav.careers, href: `${prefix}/careers` },
        { label: dict.nav.research, href: `${prefix}/careers#pathways` },
      ],
    },
    {
      title: dict.footer.columns.training,
      links: [
        { label: dict.nav.training, href: `${prefix}/training` },
        { label: dict.nav.training, href: `${prefix}/training#providers` },
      ],
    },
    {
      title: dict.footer.columns.events,
      links: [{ label: dict.nav.events, href: `${prefix}/events` }],
    },
    {
      title: dict.footer.columns.research,
      links: [
        { label: dict.nav.research, href: `${prefix}/research` },
        { label: dict.nav.news, href: `${prefix}/news` },
        { label: dict.nav.diagnostic, href: `${prefix}/diagnostic` },
        { label: dict.nav.contact, href: `${prefix}/contact` },
      ],
    },
  ];

  const legalLinks = [
    { label: dict.footer.legal.privacy, href: `${prefix}/privacy` },
    { label: dict.footer.legal.terms, href: `${prefix}/terms` },
    { label: dict.footer.legal.accessibility, href: `${prefix}/accessibility` },
    { label: dict.footer.legal.cookies, href: `${prefix}/cookies` },
  ];

  return (
    <footer className="bg-surface-dark text-text-inverse" role="contentinfo">
      <Container>
        <div className="py-12 lg:py-16">
          {/* Top row: logo + columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Logo area */}
            <div className="col-span-2 md:col-span-1">
              <Link href={prefix} className="flex items-center gap-2 mb-4">
                <Wind className="h-8 w-8 text-secondary-dark" />
                <span className="text-lg font-bold tracking-tight">SOWA</span>
              </Link>
              <p className="text-sm text-text-inverse/60 leading-relaxed">{dict.footer.tagline}</p>
              {customFooterText && (
                <p className="mt-2 text-sm text-text-inverse/60 leading-relaxed">
                  {customFooterText}
                </p>
              )}
              {socialLinks && Object.entries(socialLinks).some(([, v]) => v) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(socialLinks).map(([key, url]) => {
                    if (!url) return null;
                    const label = socialLabels[key] ?? key;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-text-inverse/50 hover:text-secondary-dark transition-colors"
                        aria-label={label}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nav columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold mb-3 text-text-inverse/80">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-inverse/50 hover:text-secondary-dark transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-text-inverse/70">
                {format(dict.footer.copyright, { year: new Date().getFullYear() })}
              </p>
              <div className="flex flex-wrap gap-4">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-text-inverse/70 hover:text-text-inverse transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
