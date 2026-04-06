import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-text-inverse hover:bg-primary-light active:bg-primary-dark",
  // Navy text on green bg (6.1:1) — white on #00A878 only reaches 3.05:1 and fails WCAG AA.
  secondary:
    "bg-secondary text-primary hover:bg-secondary-light active:bg-secondary-dark",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-text-inverse",
  ghost: "text-primary hover:bg-primary/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

/**
 * Returns the class string for a Button visual style. Use this to style a
 * `<Link>` or other anchor so the interactive target is the anchor itself.
 * Nesting `<button>` inside `<a>` is invalid HTML and collapses the anchor's
 * target-size hit area to ~4px, which fails WCAG 2.2 target-size (2.5.8).
 */
export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
): string {
  return cn(BUTTON_BASE, variantStyles[variant], sizeStyles[size], className);
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonClassName(variant, size, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button, type ButtonProps };
