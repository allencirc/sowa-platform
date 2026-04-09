"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Shared calendar-item type ─────────────────────────────── */

export interface CalendarItem {
  kind: "event" | "course";
  slug: string;
  title: string;
  /** ISO date portion only – YYYY-MM-DD */
  date: string;
  href: string;
  /** Tailwind bg-* class for the colour dot / chip */
  colorClass: string;
  typeBadge: string;
}

/* ── Helpers ────────────────────────────────────────────────── */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Monday = 0 … Sunday = 6 (ISO week) */
function isoWeekday(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-IE", { month: "long", year: "numeric" });
}

function formatPopoverDate(d: Date): string {
  return d.toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Component ─────────────────────────────────────────────── */

interface CalendarViewProps {
  items: CalendarItem[];
  className?: string;
}

export function CalendarView({ items, className }: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  /* Index items by date for fast lookup */
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const key = item.date;
      const arr = map.get(key);
      if (arr) arr.push(item);
      else map.set(key, [item]);
    }
    return map;
  }, [items]);

  /* Build grid cells ────────────────────────────────────────── */
  const cells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = isoWeekday(firstDay); // blanks before 1st

    const result: { date: Date; key: string; inMonth: boolean }[] = [];

    // previous-month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      result.push({ date: d, key: toDateKey(d), inMonth: false });
    }

    // current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dt = new Date(year, month, d);
      result.push({ date: dt, key: toDateKey(dt), inMonth: true });
    }

    // next-month padding to fill the last row
    const remainder = result.length % 7;
    if (remainder > 0) {
      const pad = 7 - remainder;
      for (let i = 1; i <= pad; i++) {
        const d = new Date(year, month + 1, i);
        result.push({ date: d, key: toDateKey(d), inMonth: false });
      }
    }

    return result;
  }, [currentMonth]);

  /* Popover state — position is computed in the click handler, not during render */
  const [popover, setPopover] = useState<{
    key: string;
    date: Date;
    items: CalendarItem[];
    position: { left: number; top: number } | null;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  /* Navigation */
  const prevMonth = useCallback(() => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    setPopover(null);
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    setPopover(null);
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setPopover(null);
  }, [today]);

  const handleDayClick = useCallback(
    (key: string, date: Date, e: React.MouseEvent<HTMLButtonElement>) => {
      const dayItems = byDate.get(key);
      if (!dayItems?.length) {
        setPopover(null);
        return;
      }
      if (popover?.key === key) {
        setPopover(null);
        return;
      }
      // Compute position relative to the grid container (safe — inside event handler)
      let position: { left: number; top: number } | null = null;
      const gridEl = gridRef.current;
      if (window.innerWidth >= 640 && gridEl) {
        const gridRect = gridEl.getBoundingClientRect();
        const cellRect = e.currentTarget.getBoundingClientRect();
        const left = cellRect.left - gridRect.left;
        const top = cellRect.bottom - gridRect.top + 4;
        const adjustedLeft = left + 320 > gridRect.width ? gridRect.width - 320 : left;
        position = { left: Math.max(0, adjustedLeft), top };
      }
      setPopover({ key, date, items: dayItems, position });
    },
    [byDate, popover],
  );

  return (
    <div className={cn("relative", className)}>
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-text-secondary" />
          </button>
          <h2
            className="text-lg font-semibold text-text-primary min-w-[180px] text-center"
            aria-live="polite"
          >
            {formatMonthYear(currentMonth)}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        {!sameMonth(currentMonth, today) && (
          <button
            onClick={goToToday}
            className="text-sm font-medium text-accent-dark hover:text-accent transition-colors cursor-pointer"
          >
            Today
          </button>
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-text-muted uppercase py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-7 border-t border-l border-gray-200 rounded-lg overflow-hidden"
        role="grid"
        aria-label="Calendar"
      >
        {cells.map((cell) => {
          const dayItems = byDate.get(cell.key) ?? [];
          const isToday = cell.key === todayKey;
          const hasItems = dayItems.length > 0;
          const maxVisible = 3;
          const overflow = dayItems.length - maxVisible;

          return (
            <button
              key={cell.key}
              onClick={(e) => handleDayClick(cell.key, cell.date, e)}
              className={cn(
                "relative border-r border-b border-gray-200 p-1.5 sm:p-2 min-h-[60px] sm:min-h-[90px] lg:min-h-[100px] text-left transition-colors cursor-pointer",
                cell.inMonth ? "bg-white" : "bg-gray-50/60",
                hasItems && "hover:bg-primary/[0.02]",
                !hasItems && "cursor-default",
                popover?.key === cell.key && "bg-primary/[0.04]",
              )}
              aria-label={`${formatPopoverDate(cell.date)}${hasItems ? `, ${dayItems.length} item${dayItems.length > 1 ? "s" : ""}` : ""}`}
              role="gridcell"
            >
              {/* Day number */}
              <span
                className={cn(
                  "inline-flex items-center justify-center text-sm font-medium w-7 h-7 rounded-full",
                  !cell.inMonth && "text-text-muted/50",
                  cell.inMonth && !isToday && "text-text-primary",
                  isToday && "bg-accent text-white font-bold",
                )}
              >
                {cell.date.getDate()}
              </span>

              {/* Event chips — desktop: title, mobile: dots */}
              {dayItems.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {dayItems.slice(0, maxVisible).map((item) => (
                    <div key={`${item.kind}-${item.slug}`} className="flex items-center gap-1">
                      <span
                        className={cn("shrink-0 w-2 h-2 rounded-full", item.colorClass)}
                        aria-hidden="true"
                      />
                      <span className="hidden lg:block text-[11px] leading-tight text-text-secondary truncate">
                        {item.title}
                      </span>
                    </div>
                  ))}
                  {overflow > 0 && (
                    <span className="text-[10px] text-text-muted font-medium pl-3">
                      +{overflow} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day popover */}
      {popover && (
        <>
          {/* Backdrop — click to close */}
          <div className="fixed inset-0 z-40" onClick={() => setPopover(null)} />

          {/* Mobile: bottom sheet, Desktop: positioned popover */}
          <div
            className={cn(
              "z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4",
              // mobile: fixed bottom sheet
              "fixed inset-x-4 bottom-4 sm:bottom-auto sm:inset-x-auto",
              // desktop: absolute
              "sm:absolute sm:w-80",
            )}
            style={popover.position ?? undefined}
            role="dialog"
            aria-label={`Events for ${formatPopoverDate(popover.date)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">
                {formatPopoverDate(popover.date)}
              </h3>
              <button
                onClick={() => setPopover(null)}
                className="text-text-muted hover:text-text-primary text-lg leading-none cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="space-y-2">
              {popover.items.map((item) => (
                <Link
                  key={`${item.kind}-${item.slug}`}
                  href={item.href}
                  className="flex items-start gap-2.5 p-2 -mx-1 rounded-lg hover:bg-gray-50 transition-colors group"
                  onClick={() => setPopover(null)}
                >
                  <span className={cn("shrink-0 w-2.5 h-2.5 rounded-full mt-1", item.colorClass)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent-dark transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-muted">{item.typeBadge}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
