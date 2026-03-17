# Task 25: ReviewListInfinite 클라이언트 컴포넌트 구현

## Context
현재 캡슐 상세 페이지(`/capsules/[capsuleSlug]`)의 리뷰 섹션은 서버 컴포넌트(`ReviewList`)가 모든 리뷰를 한 번에 로드한다. 커서 기반 페이지네이션을 위한 API(`GET /api/reviews`), 타입(`PaginatedResponse<T>`), 클라이언트 함수(`getReviews()`)는 이미 완전히 구현되어 있다. 이를 활용하는 클라이언트 컴포넌트 `ReviewListInfinite`를 새로 만들어 점진적 로딩 UX를 제공한다.

## 현황 파악

### 재사용 가능한 기존 요소
- `PaginatedResponse<T>` 타입 → `frontend/types/index.ts`
- `getReviews(capsuleSlug, { cursor, limit })` → `frontend/lib/api.ts`
- `ReviewForm` (onSuccess 콜백 지원) → `frontend/components/review/review-form.tsx`
- `StarRating` (size="sm") → `frontend/components/review/star-rating.tsx`
- 기존 UI 패턴(리뷰 카드 구조) → `frontend/components/review/review-list.tsx`

### 수정 대상 파일
- **신규** `frontend/components/review/review-list-infinite.tsx`
- **수정** `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`

---

## 구현 계획

### Step 1 — UI 마크업 구현 (`nextjs-ui-markup` 서브에이전트)

**파일:** `frontend/components/review/review-list-infinite.tsx` 신규 생성

task 25 details에 명시된 전체 컴포넌트 코드를 그대로 구현한다:
- `useInfiniteQuery` + `useQueryClient` import
- Props: `{ capsuleId, capsuleSlug, initialData: PaginatedResponse<Review> }`
- `queryKey: ['reviews', capsuleSlug]`, `initialPageParam: undefined`
- `getNextPageParam`: `lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined`
- `initialData`: `{ pages: [initialData], pageParams: [undefined] }`
- 리뷰 목록 렌더링: `StarRating size="sm"`, `Separator`, 날짜 `toLocaleDateString('ko-KR')`
- 더보기 버튼: `Button variant="outline"` + `Loader2` 스피너 (`isFetchingNextPage`)
- 하단 `ReviewForm` 내장 + `handleReviewSuccess`에서 `invalidateQueries` 호출

### Step 2 — 캡슐 페이지 통합 (`nextjs-supabase-dev` 서브에이전트)

**파일:** `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` 수정

1. 서버 사이드에서 initialData 프리페치:
   ```typescript
   const initialReviews = await getReviews(capsule.slug, { limit: 5 });
   ```
2. 기존 `<ReviewList capsuleSlug={...} />` → `<ReviewListInfinite capsuleId={capsule.id} capsuleSlug={capsule.slug} initialData={initialReviews} />` 교체
3. import 정리: `ReviewList` 제거, `ReviewListInfinite` 추가
4. Suspense fallback 필요 없으므로 제거 (클라이언트 컴포넌트로 교체)

---

## 검증 방법
1. `npm run typecheck` — 타입 에러 없음 확인
2. `npm run build` — 빌드 성공 확인
3. 캡슐 상세 페이지에서 초기 5개 리뷰 렌더링 확인
4. '더보기' 버튼 클릭 시 5개 추가 로드 확인
5. 마지막 페이지에서 '더보기' 버튼 숨김 확인
6. 리뷰 작성 성공 후 목록 자동 갱신 확인
