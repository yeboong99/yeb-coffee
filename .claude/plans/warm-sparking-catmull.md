# Task 23: lib/api.ts getReviews() 시그니처 변경 계획

## Context

리뷰 API(`/api/reviews`)가 커서 기반 페이지네이션을 지원하도록 변경된 상태에서, 프론트엔드 클라이언트 함수인 `getReviews()`가 아직 단순 배열 반환 방식으로 남아 있다. `getPosts()`와 동일한 패턴으로 `getReviews()`를 `PaginatedResponse<Review>` 반환 타입과 선택적 cursor/limit 파라미터를 지원하도록 변경한다.

## 변경 대상 파일

- `frontend/lib/api.ts` (단일 파일, 단일 함수)

## 현재 상태

```typescript
export async function getReviews(capsuleSlug: string): Promise<Review[]> {
  const res = await fetch(`${BASE_URL}/api/reviews?capsuleSlug=${capsuleSlug}`);
  if (!res.ok) throw new Error('리뷰를 불러오지 못했습니다.');
  return res.json();
}
```

## 변경 후 구현

```typescript
export async function getReviews(
  capsuleSlug: string,
  params?: { cursor?: string; limit?: number }
): Promise<PaginatedResponse<Review>> {
  const urlParams = new URLSearchParams({ capsuleSlug });
  if (params?.cursor) urlParams.set('cursor', params.cursor);
  if (params?.limit) urlParams.set('limit', String(params.limit));

  const res = await fetch(`${BASE_URL}/api/reviews?${urlParams.toString()}`);
  if (!res.ok) throw new Error('리뷰를 불러오지 못했습니다.');
  return res.json();
}
```

## 참고 사항

- `PaginatedResponse`는 `@/types`에서 이미 import 중 → 추가 import 불필요
- `getPosts()` 패턴(URLSearchParams 방식)과 동일하게 구현
- `capsuleSlug`는 URLSearchParams 생성자에 초기값으로 전달하여 항상 포함 보장

## 검증 방법

1. `npm run typecheck` — 타입 에러 없음 확인
2. `npm run build` — 빌드 성공 확인
3. 반환 타입이 `PaginatedResponse<Review>` (data, nextCursor, hasMore 포함)로 변경됐는지 확인

## 구현 담당

`nextjs-supabase-dev` 에이전트
