import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  dark?: boolean;
  id?: string;
}

export function Section({
  children,
  className,
  containerClassName,
  dark = false,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20",
        dark ? "bg-surface-dark text-text-inverse" : "bg-surface",
        className
      )}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
