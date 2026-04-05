"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// NOTE: this list is duplicated from `@/lib/i18n` because that module
// imports `server-only`. Keep these two in sync — if a locale is added
// there it must be added here as well.
const LOCALES = [
  { code: "en", label: "English" },
  { code: "ga", label: "Gaeilge" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
  { code: "pt", label: "Português" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

function swapLocaleInPath(pathname: string, nextLocale: LocaleCode): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && LOCALES.some((l) => l.code === segments[0])) {
    segments[0] = nextLocale;
  } else {
    segments.unshift(nextLocale);
  }
  return `/${segments.join("/")}`;
}

export function LanguageSwitcher({
  currentLocale,
  label,
}: {
  currentLocale: LocaleCode;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (next: LocaleCode) => {
    setOpen(false);
    if (next === currentLocale) return;
    router.push(swapLocaleInPath(pathname || "/", next));
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase hidden sm:inline">
          {currentLocale}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-100 bg-white shadow-lg py-1 z-50"
        >
          {LOCALES.map((l) => {
            const active = l.code === currentLocale;
            return (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => select(l.code)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-surface transition-colors cursor-pointer",
                  active && "text-primary font-semibold",
                )}
                lang={l.code}
              >
                <span>{l.label}</span>
                {active && <Check className="h-4 w-4" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
