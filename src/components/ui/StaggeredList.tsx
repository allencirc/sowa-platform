"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface StaggeredListProps {
  children: ReactNode[];
  /** Delay between each child in seconds. Default 0.06 (60ms — Emil's 30-80ms range) */
  staggerDelay?: number;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  reducedHidden: { opacity: 0 },
  reducedVisible: { opacity: 1 },
};

/**
 * Wraps children in staggered fade-in-up animations triggered on scroll.
 * Respects prefers-reduced-motion (opacity only, no y-transform).
 */
export function StaggeredList({ children, staggerDelay = 0.06, className }: StaggeredListProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ staggerChildren: staggerDelay }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: reducedMotion ? itemVariants.reducedHidden : itemVariants.hidden,
            visible: reducedMotion ? itemVariants.reducedVisible : itemVariants.visible,
          }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
