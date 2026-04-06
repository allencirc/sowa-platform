import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function DiagnosticCTA() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-secondary-dark via-secondary to-secondary-light text-white">
      <Container>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <ClipboardCheck className="h-8 w-8" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">Not sure where to start?</h3>
            <p className="text-lg text-white/80 max-w-xl">
              Assess your OWE skills in 5 minutes and get personalised career and training
              recommendations.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link href="/diagnostic">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-secondary-dark"
              >
                Start Assessment
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
