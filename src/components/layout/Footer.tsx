import Link from "next/link";
import { Wind } from "lucide-react";
import { Container } from "@/components/ui/Container";

const footerColumns = [
  {
    title: "Careers",
    links: [
      { label: "Explore Careers", href: "/careers" },
      { label: "Career Pathways", href: "/careers#pathways" },
      { label: "Skills Map", href: "/careers#skills" },
    ],
  },
  {
    title: "Training",
    links: [
      { label: "Course Directory", href: "/training" },
      { label: "Providers", href: "/training#providers" },
      { label: "Certifications", href: "/training#certs" },
    ],
  },
  {
    title: "Events",
    links: [
      { label: "Upcoming Events", href: "/events" },
      { label: "Webinars", href: "/events?type=Webinar" },
      { label: "Conferences", href: "/events?type=Conference" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Research", href: "/research" },
      { label: "News", href: "/news" },
      { label: "Skills Diagnostic", href: "/diagnostic" },
    ],
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Cookie Policy", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="bg-surface-dark text-text-inverse" role="contentinfo">
      <Container>
        <div className="py-12 lg:py-16">
          {/* Top row: logo + columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Logo area */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Wind className="h-8 w-8 text-secondary-dark" />
                <span className="text-lg font-bold tracking-tight">SOWA</span>
              </Link>
              <p className="text-sm text-text-inverse/60 leading-relaxed">
                Skillnet Offshore Wind Academy — Ireland&apos;s national careers
                platform for offshore wind energy.
              </p>
            </div>

            {/* Nav columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold mb-3 text-text-inverse/80">
                  {col.title}
                </h3>
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
                &copy; {new Date().getFullYear()} Skillnet Ireland. All rights reserved.
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
