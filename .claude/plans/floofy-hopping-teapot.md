# 태스크 21: 커뮤니티 목록 페이지 하이브리드 렌더링 적용

## Context

현재 `community/page.tsx`는 서버에서 전체 게시글을 한 번에 로드하여 정적 `PostList` 컴포넌트에 전달한다. 게시글이 많아질수록 초기 로드가 무거워지고 무한스크롤이 불가능하다.

이미 구현된 `PostListInfinite` (React Query + IntersectionObserver 기반)를 활용해 서버에서 첫 10개만 조회 후 `initialData`로 전달하는 하이브리드 SSR 구조로 전환한다.

## 수정 대상 파일

- `frontend/app/(main)/community/page.tsx` — 유일한 수정 파일

## 기존 구현 재사용

| 항목 | 파일 | 재사용 내용 |
|------|------|------------|
| `mapRowToPost`, `PostRow` | `frontend/lib/mappers.ts` | 이미 import 중, 그대로 유지 |
| `PaginatedResponse<T>` | `frontend/types/index.ts` | initialData 타입으로 사용 |
| `Post` | `frontend/types/post.ts` | 타입 참조 |
| `PostListInfinite` | `frontend/components/community/post-list-infinite.tsx` | props: `{ initialData, category? }` |

---

## 구현 계획

### Step 1 — [nextjs-supabase-dev] 서버 데이터 페칭 로직 수정

**담당 이유:** Supabase 쿼리 변경 + 커서 기반 페이지네이션 로직은 데이터 레이어 작업

**변경 내용 (`community/page.tsx` 상단 ~ 데이터 페칭 구간):**

1. import 추가:
   ```typescript
   import { PostListInfinite } from '@/components/community/post-list-infinite';
   import type { PaginatedResponse } from '@/types';
   ```
   - 기존 `PostList` import 제거 (PostListInfinite로 대체)

2. Supabase 쿼리를 `limit + 1` 패턴으로 변경:
   ```typescript
   const LIMIT = 10;
   const { data, error } = category
     ? await query.eq('category', category).order('created_at', { ascending: false }).limit(LIMIT + 1)
     : await query.order('created_at', { ascending: false }).limit(LIMIT + 1);

   const rows = (data ?? []) as PostRow[];
   const hasMore = rows.length > LIMIT;
   const items = hasMore ? rows.slice(0, LIMIT) : rows;
   const nextCursor = hasMore ? items[items.length - 1].created_at : null;

   const initialData: PaginatedResponse<Post> = {
     data: items.map(mapRowToPost),
     nextCursor,
     hasMore,
   };
   ```

3. 기존 `export const revalidate = 60;` 유지

### Step 2 — [nextjs-ui-markup] JSX 컴포넌트 교체

**담당 이유:** 렌더링 템플릿에서 컴포넌트 교체 및 props 연결은 프레젠테이션 레이어 작업

**변경 내용 (`community/page.tsx` JSX 구간):**

```tsx
// Before
<PostList posts={posts} />

// After
<PostListInfinite initialData={initialData} category={category} />
```

---

## 검증 방법

1. `npm run build` 빌드 성공 확인
2. 커뮤니티 페이지 초기 진입 시 SSR로 10개 렌더링 확인 (Network 탭에서 HTML에 포함 여부)
3. 스크롤 하단 도달 시 추가 10개 자동 로드 확인
4. 카테고리 탭(정보공유, 추천, 질문, 잡담) 전환 시 해당 카테고리 첫 페이지부터 재조회 확인
5. `revalidate = 60` 설정 유지 확인

---

## 참고: PostListInfinite 컴포넌트 기대 Props

```typescript
interface Props {
  initialData: PaginatedResponse<Post>;  // { data, nextCursor, hasMore }
  category?: string;
}
```
- `queryKey: ['posts', category ?? 'all']`로 카테고리별 캐시 분리
- `initialData` 구조 일치 필수
