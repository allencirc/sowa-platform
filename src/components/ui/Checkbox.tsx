"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ id, label, checked = false, onChange, className }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn("flex items-center gap-3 cursor-pointer group", className)}>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={cn(
            "h-5 w-5 rounded border-2 border-gray-300 transition-colors duration-150",
            "peer-checked:bg-secondary peer-checked:border-secondary",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-accent/20 peer-focus-visible:ring-offset-2",
          )}
        >
          {checked && <Check className="h-full w-full text-white p-0.5" strokeWidth={3} />}
        </div>
      </div>
      <span className="text-sm text-text-primary group-hover:text-text-secondary transition-colors">
        {label}
      </span>
    </label>
  );
}
