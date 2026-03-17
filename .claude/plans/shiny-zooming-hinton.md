# 태스크 26: 캡슐 상세 페이지 하이브리드 렌더링 적용

## Context

현재 `page.tsx`는 서버에서 초기 리뷰를 가져올 때 `getReviews()` (lib/api.ts)를 호출한다.
이 함수는 내부적으로 `fetch('/api/reviews?...')` — HTTP 라운드트립이 발생한다.

태스크 26은 이 불필요한 HTTP 홉을 제거하고, `createServerSupabaseClient()`로 **Supabase를 직접 쿼리**하여 성능을 개선하는 작업이다.

## 담당 에이전트

| 역할 | 에이전트 | 이유 |
|------|----------|------|
| `page.tsx` 수정 (데이터 페치 로직) | `nextjs-supabase-dev` | UI 변경 없음, 순수 서버 사이드 Supabase 쿼리 변경 |

> UI 변경이 없으므로 `nextjs-ui-markup` 에이전트는 불필요.

## 수정 대상 파일

- `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` (단일 파일)

## 구현 계획 (`nextjs-supabase-dev` 에이전트 담당)

### 변경 전 (현재)
```typescript
import { getReviews } from "@/lib/api";
// ...
const initialReviews = await getReviews(capsule.slug, { limit: 5 });
```

### 변경 후 (목표)

**1. import 교체**
```typescript
// 제거
import { getReviews } from "@/lib/api";

// 추가
import { createServerSupabaseClient } from "@/lib/supabase";
import { mapRowToReview, type ReviewRow } from "@/lib/mappers";
import type { PaginatedResponse } from "@/types";
import type { Review } from "@/types";
```

**2. 서버 직접 쿼리 (N+1 패턴)**
```typescript
const REVIEW_LIMIT = 5;
const supabaseServer = createServerSupabaseClient();
const { data: reviewData } = await supabaseServer
  .from('reviews')
  .select('*')
  .eq('capsule_slug', capsuleSlug)
  .order('created_at', { ascending: false })
  .limit(REVIEW_LIMIT + 1); // N+1 패턴으로 hasMore 판별

const reviewRows = (reviewData ?? []) as ReviewRow[];
const hasMoreReviews = reviewRows.length > REVIEW_LIMIT;
const reviewItems = hasMoreReviews ? reviewRows.slice(0, REVIEW_LIMIT) : reviewRows;
const reviewNextCursor = hasMoreReviews
  ? reviewItems[reviewItems.length - 1].created_at
  : null;

const initialReviews: PaginatedResponse<Review> = {
  data: reviewItems.map(mapRowToReview),
  nextCursor: reviewNextCursor,
  hasMore: hasMoreReviews,
};
```

**3. JSX는 변경 없음**
```tsx
<ReviewListInfinite
  capsuleId={capsule.id}
  capsuleSlug={capsule.slug}
  initialData={initialReviews}
/>
```

**4. ISR 설정 유지**
```typescript
export const revalidate = 3600; // 변경 없음
```

## 기존 유틸리티 재사용

| 유틸리티 | 경로 | 용도 |
|----------|------|------|
| `createServerSupabaseClient` | `frontend/lib/supabase.ts` | 서버 사이드 Supabase 클라이언트 |
| `mapRowToReview` | `frontend/lib/mappers.ts` | DB row → Review 타입 변환 |
| `ReviewRow` | `frontend/lib/mappers.ts` | Supabase 레코드 타입 |
| `PaginatedResponse<T>` | `frontend/types/index.ts` | 페이지네이션 응답 타입 |

## 검증

1. `npm run build` — 빌드 성공 확인
2. 캡슐 상세 페이지 진입 시 SSR로 첫 5개 리뷰 렌더링 확인
3. "더보기" 클릭 시 5개씩 추가 로드 동작 확인
4. 리뷰 작성 후 목록 상단에 반영 확인
5. `revalidate = 3600` 유지 확인
