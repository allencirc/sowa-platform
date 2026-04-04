import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-colors duration-200",
            "focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none",
            error && "border-status-error focus:border-status-error focus:ring-status-error/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
