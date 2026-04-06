import type { Metadata } from "next";
import Link from "next/link";
import { User, Building2, GraduationCap, ArrowRight, Clock, Target, BarChart3 } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Skills Diagnostic",
  description:
    "Assess your offshore wind energy skills in 5 minutes and get personalised career and training recommendations.",
  alternates: { canonical: "/diagnostic" },
  openGraph: {
    title: "OWE Skills Diagnostic — Assess Your Skills",
    description:
      "Assess your offshore wind energy skills in 5 minutes and get personalised career and training recommendations.",
    url: "/diagnostic",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skills Diagnostic — SOWA",
    description: "Assess your offshore wind skills in 5 minutes. Get personalised recommendations.",
  },
};

const audiences = [
  {
    icon: User,
    title: "I'm an Individual",
    description:
      "Discover which offshore wind careers match your skills and find the training you need to get there.",
    colour: "from-secondary to-secondary-dark",
    iconBg: "bg-secondary/10 text-secondary-dark",
  },
  {
    icon: Building2,
    title: "I'm an Employer",
    description:
      "Identify skills gaps in your workforce and find targeted training programmes to upskill your team.",
    colour: "from-accent to-accent-dark",
    iconBg: "bg-accent/10 text-accent-dark",
  },
  {
    icon: GraduationCap,
    title: "I'm a Training Provider",
    description:
      "Understand sector demand and align your course offerings with the skills the industry needs most.",
    colour: "from-sector-electrical to-yellow-600",
    iconBg: "bg-sector-electrical/10 text-sector-electrical",
  },
];

const features = [
  {
    icon: Clock,
    label: "5 minutes",
    description: "Quick and easy to complete",
  },
  {
    icon: Target,
    label: "Personalised",
    description: "Tailored to your experience",
  },
  {
    icon: BarChart3,
    label: "Actionable",
    description: "Specific career & training recommendations",
  },
];

export default function DiagnosticPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary-light py-16 sm:py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <BarChart3 className="h-4 w-4" />
              Skills Assessment Tool
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Assess Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-light to-secondary">
                OWE Skills
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Answer 15 quick questions about your experience and interests. Get a personalised
              skills profile with career recommendations and targeted training pathways — all in
              under 5 minutes.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3"
                >
                  <f.icon className="h-5 w-5 text-secondary-dark" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-white/60">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Audience cards */}
      <section className="py-16 sm:py-20 bg-surface">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              Choose Your Path
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Select the option that best describes you to get started with your personalised
              assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {audiences.map((a) => (
              <Link
                key={a.title}
                href="/diagnostic/assessment"
                className="group relative bg-white rounded-2xl border border-gray-100 p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden"
              >
                {/* Top gradient bar */}
                <div
                  className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${a.colour} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                />

                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${a.iconBg} mb-5 transition-transform duration-300 group-hover:scale-110`}
                >
                  <a.icon className="h-8 w-8" />
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-3">{a.title}</h3>

                <p className="text-sm text-text-secondary mb-6 leading-relaxed">{a.description}</p>

                <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-dark group-hover:text-accent-dark transition-colors">
                  Start Assessment
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
