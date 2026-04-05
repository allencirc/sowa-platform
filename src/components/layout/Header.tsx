"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { label: "Careers", href: "/careers" },
  { label: "Training", href: "/training" },
  { label: "Events", href: "/events" },
  { label: "Research", href: "/research" },
  { label: "News", href: "/news" },
  { label: "Diagnostic", href: "/diagnostic" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <Container>
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Wind className="h-8 w-8 text-secondary-dark" />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-primary tracking-tight">
                SOWA
              </span>
              <span className="text-[10px] text-text-secondary leading-none hidden sm:block">
                Offshore Wind Academy
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-text-primary rounded-lg hover:bg-surface hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link href="/diagnostic" className="hidden sm:inline-flex">
              <Button size="sm">
                Get Involved
              </Button>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </Container>
      </header>

      {/* Mobile menu — rendered outside <header> because the header's backdrop-blur
          creates a containing block that would trap fixed-position descendants. */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} />
    </>
  );
}
