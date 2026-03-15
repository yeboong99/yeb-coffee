# Task 9: 에러 처리 및 빈 상태 UI 개선 계획

## Context

Task 9의 목표는 모든 페이지에서 에러 상태, 로딩 상태, 빈 상태를 적절히 처리하는 것이다.
코드베이스 탐색 결과, 대부분의 작업은 이미 완료되어 있으며 아래 3가지 항목만 실제로 구현이 필요하다.

작업은 두 에이전트로 분리하여 병렬 실행:
- **nextjs-ui-markup**: 순수 UI 마크업 (loading.tsx Skeleton)
- **nextjs-supabase-dev**: 컴포넌트 로직 및 기능 (brand-grid.tsx 빈 상태, Suspense fallback 개선)

---

## 현황 (이미 완료된 것 — 손대지 않음)

| 항목 | 파일 | 상태 |
|------|------|------|
| 에러 경계 | `app/(main)/error.tsx` | ✅ 완료 — 재시도/홈으로 버튼 포함 |
| 404 페이지 | `app/(main)/not-found.tsx` | ✅ 완료 |
| 리뷰 빈 상태 | `components/review/review-list.tsx` | ✅ 완료 |
| 댓글 빈 상태 | `components/community/comment-list.tsx` | ✅ 완료 |
| 게시글 빈 상태 | `components/community/post-list.tsx` | ✅ 완료 |
| 캡슐 빈 상태 | `components/capsule/capsule-grid.tsx` | ✅ 완료 |
| 필터 빈 상태 | `components/capsule/capsule-list-with-filters.tsx` | ✅ 완료 |
| 브랜드 쇼케이스 빈 상태 | `components/home/brand-showcase.tsx` | ✅ 완료 |

---

## [nextjs-ui-markup] 담당: loading.tsx 신규 생성

- **파일**: `frontend/app/(main)/loading.tsx`
- **역할**: Next.js `(main)` 레이아웃 하위 모든 페이지 전환 시 자동으로 표시되는 로딩 UI
- **사용 컴포넌트**: `Skeleton` (`frontend/components/ui/skeleton.tsx` — 이미 존재)
- **레이아웃**: 헤더 1개 + 카드 6개 그리드 (브랜드/캡슐 목록과 유사한 형태)

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Skeleton className="h-9 w-48 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## [nextjs-supabase-dev] 담당: 컴포넌트 빈 상태 및 Suspense fallback 개선

### 1. `brand-grid.tsx` 빈 상태 추가

- **파일**: `frontend/components/brand/brand-grid.tsx`
- **문제**: `brands` 배열이 빈 경우 빈 화면만 표시됨 (다른 컴포넌트와 일관성 없음)
- **현재 코드**: `brands.map()` 만 실행, 조건 없음
- **수정**: `brands.length === 0` 체크를 map 이전에 추가

```tsx
if (brands.length === 0) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      등록된 브랜드가 없습니다.
    </div>
  );
}
```

### 2. 캡슐 상세 페이지 Suspense fallback 개선

- **파일**: `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` (47~52줄)
- **문제**: `<p>리뷰를 불러오는 중...</p>` 텍스트 → 레이아웃 이동 발생
- **수정**: `Skeleton` 기반 fallback으로 교체 (리뷰 카드 3개 형태)

```tsx
<Suspense
  fallback={
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  }
>
  <ReviewList capsuleSlug={capsule.slug} />
</Suspense>
```

- `Skeleton` import 추가 필요: `import { Skeleton } from "@/components/ui/skeleton";`

---

## 수정 파일 요약

| 파일 | 담당 에이전트 | 작업 |
|------|------------|------|
| `frontend/app/(main)/loading.tsx` | nextjs-ui-markup | 신규 생성 |
| `frontend/components/brand/brand-grid.tsx` | nextjs-supabase-dev | 빈 상태 조건 추가 |
| `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` | nextjs-supabase-dev | Suspense fallback Skeleton으로 교체 |

---

## 검증 방법

1. `pnpm dev` 실행
2. 페이지 이동 시 Skeleton 로딩 UI 표시 확인 (loading.tsx)
3. Notion 브랜드가 없는 경우 `/brands` 에서 "등록된 브랜드가 없습니다." 표시 확인 (brand-grid.tsx)
4. 캡슐 상세 페이지 리뷰 로딩 중 Skeleton 카드 3개 표시 확인 (Suspense fallback)
5. 존재하지 않는 URL 접근 시 기존 404 페이지 정상 동작 확인
