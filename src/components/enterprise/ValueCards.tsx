import { Users, BarChart3, GraduationCap, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n";

const icons = [Users, BarChart3, GraduationCap, TrendingUp] as const;

export function ValueCards({ dict }: { dict: Dictionary }) {
  const cards = [
    dict.enterprise.valueCards.workforcePlanning,
    dict.enterprise.valueCards.skillsGap,
    dict.enterprise.valueCards.trainingDirectory,
    dict.enterprise.valueCards.industryIntelligence,
  ];

  return (
    <section className="py-16 sm:py-20 bg-surface">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = icons[i];
            return (
              <div
                key={card.title}
                className="flex flex-col bg-surface-card rounded-xl border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">{card.title}</h3>
                <p className="text-sm text-text-secondary flex-1">{card.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
