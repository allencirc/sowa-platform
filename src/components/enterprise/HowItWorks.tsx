import { ClipboardCheck, Route, Rocket } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n";

const stepIcons = [ClipboardCheck, Route, Rocket] as const;

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const steps = [
    dict.enterprise.howItWorks.step1,
    dict.enterprise.howItWorks.step2,
    dict.enterprise.howItWorks.step3,
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            {dict.enterprise.howItWorks.title}
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            {dict.enterprise.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={step.title} className="relative text-center">
                {/* Connector line (hidden on mobile, shown between steps on desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gray-200" />
                )}

                <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-white mb-5 relative">
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <Icon className="h-8 w-8" />
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
