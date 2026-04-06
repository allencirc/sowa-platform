"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-colors duration-200",
          "focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none",
          "min-h-[100px] resize-y",
          error && "border-status-error focus:border-status-error focus:ring-status-error/20",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
export { Textarea };
