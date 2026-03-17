"use client";

import { useState, useMemo } from "react";
import type { Capsule, IntensityLevel } from "@/types";
import type { ServiceRating } from "@/types/review";
import { CapsuleGrid } from "./capsule-grid";
import { CapsuleSearch } from "./capsule-search";
import { IntensityFilter } from "./intensity-filter";

interface Props {
  capsules: Capsule[];
  // 슬러그를 키로 하는 서비스 평점 맵 (선택적)
  serviceRatings?: Record<string, ServiceRating>;
}

export function CapsuleListWithFilters({ capsules, serviceRatings }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  // 이전 클릭 강도값 (범위 필터의 시작점)
  const [prevClick, setPrevClick] = useState<IntensityLevel | null>(null);
  // 마지막 클릭 강도값 (범위 필터의 끝점)
  const [lastClick, setLastClick] = useState<IntensityLevel | null>(null);

  // 강도 버튼 선택 핸들러
  const handleIntensitySelect = (value: IntensityLevel | null) => {
    if (value === null) {
      // "전체" 선택 시 초기화
      setPrevClick(null);
      setLastClick(null);
    } else {
      // 이전 lastClick을 prevClick으로 이동하고, 새 값을 lastClick으로 설정
      setPrevClick(lastClick);
      setLastClick(value);
    }
  };

  // 검색어 및 강도 필터를 적용한 캡슐 목록
  const filteredCapsules = useMemo(() => {
    let result = capsules;

    // 이름 검색 필터 적용
    if (searchQuery.trim()) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // 강도 범위 필터 적용
    if (lastClick === null) {
      // 선택된 강도 없음 - 필터 미적용
    } else if (prevClick === null) {
      // 단일 강도 선택 - 정확히 일치하는 캡슐만
      result = result.filter((c) => c.intensity === lastClick);
    } else {
      // 두 강도값이 모두 있으면 범위 필터 적용
      const min = Math.min(prevClick, lastClick);
      const max = Math.max(prevClick, lastClick);
      result = result.filter(
        (c) => c.intensity !== null && c.intensity >= min && c.intensity <= max,
      );
    }

    return result;
  }, [capsules, searchQuery, prevClick, lastClick]);

  return (
    <div>
      {/* 검색창이 위, 강도 필터가 아래로 항상 세로 배치 */}
      <div className="mb-6 inline-flex flex-col gap-3">
        <CapsuleSearch onSearch={setSearchQuery} />
        <IntensityFilter
          rangeStart={prevClick}
          rangeEnd={lastClick}
          onSelect={handleIntensitySelect}
        />
      </div>
      {filteredCapsules.length > 0 ? (
        <CapsuleGrid
          capsules={filteredCapsules}
          serviceRatings={serviceRatings}
        />
      ) : (
        <p className="text-center text-muted-foreground py-10">
          {searchQuery || lastClick !== null
            ? "검색 조건에 맞는 캡슐이 없습니다."
            : "등록된 캡슐이 없습니다."}
        </p>
      )}
    </div>
  );
}
