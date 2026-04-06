import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  image?: ReactNode;
  badges?: ReactNode;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, image, badges, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-card rounded-xl border border-gray-100 overflow-hidden",
        hover && "transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/5",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {image && <div className="relative">{image}</div>}
      {badges && <div className="flex flex-wrap gap-2 px-5 pt-4">{badges}</div>}
      <div className="p-5">{children}</div>
    </div>
  );
}
