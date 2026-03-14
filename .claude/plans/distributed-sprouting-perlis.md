# Task 6: 리뷰 CRUD 기능 Supabase 실데이터 연동

## Context

현재 캡슐 상세 페이지(`[capsuleSlug]/page.tsx`)의 리뷰 목록은 placeholder 빈 배열을 사용 중이며,
`ReviewList` 컴포넌트는 props로 `Review[]`를 받는 방식입니다.
`ReviewForm`은 Turnstile 통합까지 완성되었으나, 제출 성공 후 목록 갱신이 되지 않습니다.
이 작업은 리뷰 목록을 Supabase에서 직접 조회하고, 리뷰 작성 후 목록이 자동 갱신되도록 연동합니다.

## 현재 상태

| 파일 | 현재 방식 | 변경 필요 |
|------|---------|---------|
| `components/review/review-list.tsx` | props로 `Review[]` 받음 | Supabase 직접 조회로 전환 |
| `app/(main)/capsules/[capsuleSlug]/page.tsx` | placeholder 빈 배열 전달 | Suspense 경계로 ReviewList 감싸기 |
| `components/review/review-form.tsx` | 제출 후 목록 갱신 없음 | `router.refresh()` 추가 |

## 구현 계획

### Step 1: ReviewList를 독립적인 서버 컴포넌트로 전환

**파일:** `frontend/components/review/review-list.tsx`

- props에서 `capsuleSlug: string`만 받도록 변경
- 컴포넌트 내부에서 `createServerSupabaseClient()`로 Supabase 조회
- 에러/빈 상태 처리 유지
- `date-fns` 라이브러리로 날짜 포맷 (package.json 확인 필요, 없으면 내장 방식 사용)

```typescript
// 변경 전: props에서 reviews 배열 받음
export function ReviewList({ reviews }: { reviews: Review[] }) {...}

// 변경 후: capsuleSlug만 받아 내부에서 조회
export async function ReviewList({ capsuleSlug }: { capsuleSlug: string }) {
  const supabase = createServerSupabaseClient();
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('capsule_slug', capsuleSlug)
    .order('created_at', { ascending: false });
  ...
}
```

### Step 2: 캡슐 상세 페이지에 Suspense 경계 추가

**파일:** `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`

- `placeholderReviews` 제거
- `ReviewList`에 `capsule.slug` 전달 (배열 대신)
- `Suspense`로 감싸서 스트리밍 로딩 처리

```typescript
import { Suspense } from 'react';

// 변경 전
<ReviewList reviews={placeholderReviews} />

// 변경 후
<Suspense fallback={<p className="text-center py-6 text-muted-foreground">리뷰를 불러오는 중...</p>}>
  <ReviewList capsuleSlug={capsule.slug} />
</Suspense>
```

### Step 3: ReviewForm 제출 성공 후 router.refresh() 추가

**파일:** `frontend/components/review/review-form.tsx`

- `useRouter()` 훅 추가
- 제출 성공 후 `router.refresh()` 호출하여 서버 컴포넌트 재조회 트리거

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// onSubmit 성공 블록에서:
toast.success('리뷰가 등록되었습니다.');
reset();
setRating(0);
setTurnstileToken('');
router.refresh(); // 추가
onSuccess?.();
```

## 수정 파일 목록

1. `frontend/components/review/review-list.tsx` - 서버 컴포넌트로 전환, Supabase 직접 조회
2. `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` - Suspense 추가, props 변경
3. `frontend/components/review/review-form.tsx` - router.refresh() 추가

## 참조할 기존 유틸리티

- `frontend/lib/supabase.ts` → `createServerSupabaseClient()` (서버 컴포넌트용)
- `frontend/types/review.ts` → `Review` 타입
- `frontend/lib/api.ts` → `createReview()` (ReviewForm에서 이미 사용 중)

## 구현 담당 에이전트

**nextjs-supabase-dev 에이전트**가 아래 순서대로 구현을 수행합니다:

1. `frontend/components/review/review-list.tsx` 읽기 → Supabase 직접 조회 방식으로 수정
2. `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` 읽기 → Suspense 경계 추가 및 ReviewList props 변경
3. `frontend/components/review/review-form.tsx` 읽기 → router.refresh() 추가
4. `date-fns` 패키지 존재 여부 확인 후 날짜 포맷 방식 결정

## 검증 방법

1. `pnpm dev` 실행 후 캡슐 상세 페이지 접속
2. Supabase Table Editor에서 `reviews` 테이블 확인 (capsule_slug 컬럼 존재 여부)
3. 리뷰가 없는 캡슐: "아직 리뷰가 없습니다" 메시지 표시 확인
4. 리뷰 작성 후: 페이지 새로고침 없이 목록에 즉시 반영 확인
5. Supabase Table Editor에서 새 행이 생성되었는지 확인
