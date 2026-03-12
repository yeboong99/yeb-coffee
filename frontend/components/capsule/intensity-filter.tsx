"use client";

import { Button } from "@/components/ui/button";
import type { IntensityLevel } from "@/types";

const intensityOptions: (IntensityLevel | null)[] = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

interface IntensityFilterProps {
  selected: IntensityLevel | null;
  onSelect: (value: IntensityLevel | null) => void;
}

export function IntensityFilter({ selected, onSelect }: IntensityFilterProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">강도 필터</p>
      <div className="flex flex-wrap gap-1.5">
        {intensityOptions.map((level) => (
          <Button
            key={level ?? "all"}
            variant={selected === level ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(level)}
            className="h-7 text-xs px-2"
          >
            {level === null ? "전체" : level}
          </Button>
        ))}
      </div>
    </div>
  );
}
