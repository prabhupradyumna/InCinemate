"use client";

import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const filters = ["Filters", "Top Selling", "Telugu", "English", "Drama", "Action", "Comedy"];

interface MobileFilterChipsProps {
  onFilterChange?: (filter: string | null) => void;
}

export function MobileFilterChips({ onFilterChange }: MobileFilterChipsProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleFilterClick = (filter: string) => {
    const newFilter = activeFilter === filter ? null : filter;
    setActiveFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        const isFilterButton = filter === "Filters";
        
        return (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {isFilterButton && <Filter className="h-3 w-3" />}
            <span className="text-sm font-medium">{filter}</span>
          </button>
        );
      })}
    </div>
  );
}
