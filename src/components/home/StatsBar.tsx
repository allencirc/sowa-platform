"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";

const stats = [
  { value: 12, label: "Career Pathways" },
  { value: 15, label: "Training Courses", suffix: "+" },
  { value: 6, label: "Upcoming Events" },
  { value: 31, label: "Skills Mapped" },
];

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let start = 0;
    const increment = target / (duration / 16);
    let raf: number;

    function step() {
      start += increment;
      if (start >= target) {
        setCount(target);
        return;
      }
      setCount(Math.floor(start));
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger]);

  return count;
}

function StatItem({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(value, 1200, visible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
        {count}
        {suffix && <span>{suffix}</span>}
      </div>
      <div className="text-sm sm:text-base text-white/60 font-medium">{label}</div>
    </div>
  );
}

export function StatsBar() {
  return (
    <section className="py-14 sm:py-16 bg-surface-dark">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
