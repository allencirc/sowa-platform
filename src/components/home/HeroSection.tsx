import { Wind } from "lucide-react";
import { AIChatInput } from "@/components/ui/ai-chat-input";

function TurbineSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 200" fill="none" className={className} aria-hidden="true">
      {/* Tower */}
      <rect x="47" y="60" width="6" height="140" fill="currentColor" opacity="0.15" rx="1" />
      {/* Nacelle */}
      <rect x="44" y="56" width="14" height="8" fill="currentColor" opacity="0.18" rx="2" />
      {/* Blades */}
      <path d="M51 56 L51 2 Q52 0 53 2 L53 56" fill="currentColor" opacity="0.12" />
      <path d="M51 60 L10 84 Q9 86 11 85 L51 62" fill="currentColor" opacity="0.12" />
      <path d="M51 60 L92 84 Q93 86 91 85 L51 62" fill="currentColor" opacity="0.12" />
      {/* Hub */}
      <circle cx="51" cy="60" r="3" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

export function HeroSection() {
  // Section has an explicit bg-primary under the image/gradient so WCAG
  // contrast holds even if the background image fails to load — axe (and
  // users with blocked images) only sees the composited gradient+colour.
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-primary bg-[url('/images/hero-wind-farm.jpg')] bg-cover bg-center text-text-inverse">
      {/* Overlay gradient — extends across most of the hero for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1c33]/90 via-[#0a1c33]/60 via-60% to-primary/20" />

      {/* Decorative turbine silhouettes */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <TurbineSVG className="absolute -right-4 bottom-0 h-[420px] w-auto text-white sm:right-8 lg:right-24" />
        <TurbineSVG className="absolute right-24 bottom-0 h-[340px] w-auto text-white opacity-60 hidden md:block lg:right-52" />
        <TurbineSVG className="absolute right-56 bottom-0 h-[280px] w-auto text-white opacity-30 hidden lg:block lg:right-80" />
        {/* Ocean wave line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-2xl lg:max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Wind className="h-5 w-5 text-secondary" />
            <span className="text-sm font-semibold tracking-widest uppercase text-secondary">
              Skillnet Offshore Wind Academy
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Your Career in <span className="text-secondary">Offshore Wind</span> Starts Here
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed max-w-xl">
            Discover pathways, training, and opportunities in Ireland&apos;s fastest-growing energy
            sector.
          </p>

          <div className="mt-10">
            <AIChatInput />
          </div>
        </div>
      </div>
    </section>
  );
}
