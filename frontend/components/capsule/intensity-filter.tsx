"use client";

import { Button } from "@/components/ui/button";
import type { IntensityLevel } from "@/types";

const intensityOptions: (IntensityLevel | null)[] = [
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
];

interface IntensityFilterProps {
  rangeStart: IntensityLevel | null;
  rangeEnd: IntensityLevel | null;
  onSelect: (value: IntensityLevel | null) => void;
}

export function IntensityFilter({
  rangeStart,
  rangeEnd,
  onSelect,
}: IntensityFilterProps) {
  // 특정 강도값 버튼이 활성 상태인지 판단
  const isActive = (value: IntensityLevel): boolean => {
    if (rangeStart === null && rangeEnd === null) {
      // 선택된 값이 없으면 모두 비활성
      return false;
    }
    if (rangeStart === null) {
      // 단일 선택 상태 - rangeEnd와 일치하는 버튼만 활성
      return value === rangeEnd;
    }
    // 범위 선택 상태 - min ~ max 범위 내 버튼 모두 활성
    const min = Math.min(rangeStart, rangeEnd!);
    const max = Math.max(rangeStart, rangeEnd!);
    return value >= min && value <= max;
  };

  // "전체" 버튼 활성 여부: 두 값 모두 null일 때
  const isAllActive = rangeStart === null && rangeEnd === null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">강도 필터</p>
      <div className="flex flex-wrap gap-1.5">
        {intensityOptions.map((level) => (
          <Button
            key={level ?? "all"}
            variant={
              level === null
                ? isAllActive
                  ? "default"
                  : "outline"
                : isActive(level)
                  ? "default"
                  : "outline"
            }
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
