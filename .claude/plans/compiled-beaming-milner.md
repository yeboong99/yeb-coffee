# Task 22: GET /api/reviews 커서 기반 페이지네이션 추가

## Context

현재 `GET /api/reviews`는 `capsuleSlug`에 해당하는 모든 리뷰를 한 번에 반환한다. 리뷰가 많아질수록 응답이 느려지고 데이터 낭비가 발생한다. Task 18에서 posts API에 동일한 커서 기반 페이지네이션을 이미 구현했으므로 해당 패턴을 그대로 적용한다.

## 작업 주체

`nextjs-supabase-dev` 서브에이전트

## 수정 대상 파일

- `frontend/app/api/reviews/route.ts` — GET 핸들러만 수정

## 재사용할 기존 구현

| 요소 | 파일 |
|------|------|
| `PaginatedResponse<T>` 타입 | `frontend/types/index.ts` (이미 정의됨) |
| `ReviewRow`, `mapRowToReview` | `frontend/lib/mappers.ts` (이미 정의됨) |
| `createServerSupabaseClient` | `frontend/lib/supabase.ts` (이미 정의됨) |
| 커서 페이지네이션 패턴 참고 | `frontend/app/api/posts/route.ts` |

## 구현 계획

### GET 핸들러 수정 (`frontend/app/api/reviews/route.ts`)

현재 GET 핸들러를 아래 로직으로 교체:

```typescript
import { mapRowToReview, type ReviewRow } from '@/lib/mappers';
import type { PaginatedResponse } from '@/types';
import type { Review } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const capsuleSlug = searchParams.get('capsuleSlug');

  if (!capsuleSlug) {
    return NextResponse.json({ error: 'capsuleSlug is required' }, { status: 400 });
  }

  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '5', 10), 20);

  const supabase = createServerSupabaseClient();
  let query = supabase
    .from('reviews')
    .select('*')
    .eq('capsule_slug', capsuleSlug)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // N+1 패턴으로 hasMore 판별

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data as ReviewRow[];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  const response: PaginatedResponse<Review> = {
    data: items.map(mapRowToReview),
    nextCursor,
    hasMore,
  };

  return NextResponse.json(response);
}
```

핵심 변경 사항:
- 기본 limit = 5, 최대 20 (N+1 패턴)
- cursor 없으면 첫 페이지 반환 (하위 호환)
- cursor 있으면 `lt('created_at', cursor)` 조건 추가

POST 핸들러는 변경하지 않는다.

## 검증 방법

1. `GET /api/reviews?capsuleSlug=<slug>` → `{ data, nextCursor, hasMore }` 형식 응답 확인
2. `capsuleSlug` 누락 → 400 에러 확인
3. `cursor` 파라미터로 연속 페이지 조회 시 중복 없이 순서대로 반환되는지 확인
4. `limit=25` 요청 → 실제 20개로 제한되는지 확인
5. `npm run check-all && npm run build` 통과 확인
