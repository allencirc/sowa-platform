"use client";

import { X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BulkAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
}

export function BulkActionBar({ selectedCount, onClear, actions }: BulkActionBarProps) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-white">
        {selectedCount}
      </span>
      <span className="text-sm font-medium text-text-primary">
        {selectedCount === 1 ? "item" : "items"} selected
      </span>

      <div className="ml-auto flex items-center gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className={
                action.variant === "danger"
                  ? "border-status-error/30 text-status-error hover:bg-status-error/5"
                  : ""
              }
            >
              {Icon && <Icon className="h-4 w-4" />}
              {action.label}
            </Button>
          );
        })}
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
