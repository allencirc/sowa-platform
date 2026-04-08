import Link from "next/link";
import { Compass, GraduationCap, Building2, HandHeart, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

const audiences = [
  {
    icon: Compass,
    title: "Explore Careers",
    description: "Discover 12 career pathways across offshore wind energy.",
    href: "/careers",
  },
  {
    icon: GraduationCap,
    title: "Find Training",
    description: "Browse accredited courses from leading Irish providers.",
    href: "/training",
  },
  {
    icon: Building2,
    title: "Enterprise Support",
    description: "Workforce planning tools and employer resources.",
    href: "/enterprise",
  },
  {
    icon: HandHeart,
    title: "Get Involved",
    description: "Join the community shaping Ireland's clean energy future.",
    href: "/events",
  },
];

export function AudienceCards() {
  return (
    <section className="py-16 sm:py-20 bg-surface">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {audiences.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col bg-surface-card rounded-xl border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark group-hover:bg-secondary group-hover:text-white transition-colors">
                <item.icon className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-1">{item.title}</h3>

              <p className="text-sm text-text-secondary flex-1">{item.description}</p>

              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-dark group-hover:text-accent-dark transition-colors">
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
