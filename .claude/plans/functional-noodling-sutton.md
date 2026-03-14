# Task 8 (개선): 강도 필터 범위 선택 + 레이아웃 수정

## Context
`CapsuleListWithFilters` 컴포넌트가 이미 구현되어 있으나, 아래 두 가지를 개선한다:
1. **레이아웃**: 검색창과 강도 필터가 가로로 나열되는 문제 → 항상 세로 배치로 변경
2. **강도 필터 UX**: 단일 강도 선택 → "최근 두 번 클릭한 숫자 사이의 범위" 선택 방식으로 변경

---

## 범위 필터 동작 정의

| 상황 | 동작 |
|------|------|
| 아무것도 안 클릭 | 필터 없음 (전체 표시) |
| 첫 번째 클릭 (예: 2) | 강도 2만 표시 (단일값) |
| 두 번째 클릭 (예: 7) | 강도 2~7 표시 (범위) |
| 범위 적용 중 새 클릭 (예: 9) | 직전 클릭(7)과 새 클릭(9) → 강도 7~9 표시 |
| "전체" 클릭 | 초기화 (필터 없음) |

**핵심 상태:** `prevClick: IntensityLevel | null`, `lastClick: IntensityLevel | null`
- 클릭 시: `prevClick = lastClick`, `lastClick = newValue`
- 범위: `[Math.min(prevClick, lastClick), Math.max(prevClick, lastClick)]`

---

## 수정 계획

### Step 1: `capsule-list-with-filters.tsx` 수정

**경로:** `frontend/components/capsule/capsule-list-with-filters.tsx`

**변경사항:**
- 상태: `selectedIntensity: IntensityLevel | null` → `prevClick: IntensityLevel | null`, `lastClick: IntensityLevel | null`
- 핸들러 `handleIntensitySelect(value: IntensityLevel | null)`:
  - `value === null` → 두 상태 모두 null로 초기화 (전체 버튼)
  - 그 외 → `prevClick = lastClick`, `lastClick = value`
- 필터 로직:
  - 둘 다 null → 강도 필터 없음
  - `prevClick === null` → `c.intensity === lastClick` (단일 일치)
  - 둘 다 있음 → `c.intensity >= min && c.intensity <= max` (범위)
- `IntensityFilter`에 `rangeStart={prevClick}`, `rangeEnd={lastClick}`, `onSelect={handleIntensitySelect}` 전달
- **레이아웃 변경**: `flex-col sm:flex-row gap-4` → `flex-col gap-3` (항상 세로 배치)

```typescript
"use client";

import { useState, useMemo } from 'react';
import type { Capsule, IntensityLevel } from '@/types';
import type { ServiceRating } from '@/types/review';
import { CapsuleGrid } from './capsule-grid';
import { CapsuleSearch } from './capsule-search';
import { IntensityFilter } from './intensity-filter';

interface Props {
  capsules: Capsule[];
  serviceRatings?: Record<string, ServiceRating>;
}

export function CapsuleListWithFilters({ capsules, serviceRatings }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [prevClick, setPrevClick] = useState<IntensityLevel | null>(null);
  const [lastClick, setLastClick] = useState<IntensityLevel | null>(null);

  const handleIntensitySelect = (value: IntensityLevel | null) => {
    if (value === null) {
      setPrevClick(null);
      setLastClick(null);
    } else {
      setPrevClick(lastClick);
      setLastClick(value);
    }
  };

  const filteredCapsules = useMemo(() => {
    let result = capsules;
    if (searchQuery.trim()) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (lastClick !== null) {
      if (prevClick === null) {
        result = result.filter((c) => c.intensity === lastClick);
      } else {
        const min = Math.min(prevClick, lastClick);
        const max = Math.max(prevClick, lastClick);
        result = result.filter(
          (c) => c.intensity !== null && c.intensity >= min && c.intensity <= max
        );
      }
    }
    return result;
  }, [capsules, searchQuery, prevClick, lastClick]);

  const hasFilter = searchQuery.trim() || lastClick !== null;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3">
        <CapsuleSearch onSearch={setSearchQuery} />
        <IntensityFilter
          rangeStart={prevClick}
          rangeEnd={lastClick}
          onSelect={handleIntensitySelect}
        />
      </div>
      {filteredCapsules.length > 0 ? (
        <CapsuleGrid capsules={filteredCapsules} serviceRatings={serviceRatings} />
      ) : (
        <p className="text-center text-muted-foreground py-10">
          {hasFilter ? '검색 조건에 맞는 캡슐이 없습니다.' : '등록된 캡슐이 없습니다.'}
        </p>
      )}
    </div>
  );
}
```

### Step 2: `intensity-filter.tsx` 수정

**경로:** `frontend/components/capsule/intensity-filter.tsx`

**변경사항:**
- Props 인터페이스 변경: `selected: IntensityLevel | null` → `rangeStart: IntensityLevel | null`, `rangeEnd: IntensityLevel | null`
- 버튼 강조 로직: 단일 값 일치 → 범위 내 포함 여부
  - `rangeStart === null && rangeEnd === null` → 모두 비활성
  - `rangeStart === null` → `value === rangeEnd`만 활성
  - 둘 다 있음 → `value >= min && value <= max`이면 활성 (배경 강조)
- "전체" 버튼: `rangeStart === null && rangeEnd === null`일 때 활성

---

## 수정 대상 파일

| 파일 | 작업 |
|------|------|
| `frontend/components/capsule/capsule-list-with-filters.tsx` | 상태/로직/레이아웃 수정 |
| `frontend/components/capsule/intensity-filter.tsx` | props 인터페이스 + 버튼 강조 로직 수정 |

---

## 실행 방법

이 작업은 **`nextjs-supabase-dev` 서브에이전트**에 위임하여 구현한다.

서브에이전트 프롬프트:
> 아래 두 파일을 읽고, 요구사항에 맞게 직접 코드를 작성하여 수정하세요.
>
> **파일 1: `frontend/components/capsule/capsule-list-with-filters.tsx`**
> - 기존 `selectedIntensity: IntensityLevel | null` 상태를 제거하고, `prevClick: IntensityLevel | null`(초기값 null)와 `lastClick: IntensityLevel | null`(초기값 null) 두 개의 상태로 교체
> - `handleIntensitySelect(value: IntensityLevel | null)` 핸들러 작성:
>   - value가 null이면 prevClick, lastClick 모두 null로 초기화
>   - 그 외: `setPrevClick(lastClick)` 후 `setLastClick(value)`
> - `useMemo` 필터 로직 수정:
>   - `lastClick`이 null이면 강도 필터 없음
>   - `prevClick`이 null이면 `c.intensity === lastClick` (단일 일치)
>   - 둘 다 있으면 `min = Math.min(prevClick, lastClick)`, `max = Math.max(prevClick, lastClick)`로 `c.intensity >= min && c.intensity <= max` 범위 필터
> - `IntensityFilter`에 전달하는 props를 `rangeStart={prevClick}`, `rangeEnd={lastClick}`, `onSelect={handleIntensitySelect}`로 변경
> - 레이아웃: 필터 영역 `className`을 `"mb-6 flex flex-col gap-3"`으로 변경 (항상 세로 배치, 검색창이 위, 강도 필터가 아래)
> - `<div className="flex-1">` 래퍼는 제거하고 `<CapsuleSearch>`를 직접 렌더링
>
> **파일 2: `frontend/components/capsule/intensity-filter.tsx`**
> - Props 인터페이스를 `selected: IntensityLevel | null` 단일 prop 대신 `rangeStart: IntensityLevel | null`, `rangeEnd: IntensityLevel | null` 두 prop으로 교체 (onSelect prop은 유지)
> - 버튼이 활성 상태인지 판단하는 로직을 아래 규칙으로 교체:
>   - `rangeStart === null && rangeEnd === null`이면 모두 비활성
>   - `rangeStart === null`이면 `value === rangeEnd`인 버튼만 활성
>   - 둘 다 있으면 `Math.min(rangeStart, rangeEnd) <= value <= Math.max(rangeStart, rangeEnd)` 범위 내 버튼 모두 활성
> - "전체" 버튼: `rangeStart === null && rangeEnd === null`일 때 활성 스타일 적용
> - 기존 버튼 스타일(variant="default" / "outline") 방식은 그대로 유지하되, 활성 판단 기준만 위 로직으로 교체

---

## 검증 방법

1. `pnpm dev` 실행 후 브랜드 캡슐 목록 페이지 접속
2. **레이아웃**: 검색창 아래에 강도 필터가 세로로 배치되는지 확인
3. **단일 클릭**: 강도 5 클릭 → intensity=5 캡슐만 표시, 버튼 5만 강조
4. **범위 클릭**: 강도 5 → 9 순서로 클릭 → intensity 5~9 캡슐 표시, 5~9 버튼 모두 강조
5. **범위 이동**: 5~9 적용 중 3 클릭 → intensity 3~9 범위로 변경 (직전 클릭 9 기준)
6. **전체 버튼**: 클릭 시 필터 초기화
7. **검색+강도 AND 조건**: 동시 적용 확인
