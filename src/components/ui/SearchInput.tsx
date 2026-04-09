"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="search"
          aria-label="Search"
          className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-base text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearch) {
              onSearch((e.target as HTMLInputElement).value);
            }
          }}
          {...props}
        />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
export { SearchInput };
