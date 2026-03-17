# Task 19: lib/api.ts getPosts() 시그니처 변경

## Context

API 라우트(`/api/posts`)는 이미 커서 기반 페이지네이션과 `PaginatedResponse<Post>` 형태로 응답을 반환하고 있다. 그러나 클라이언트 fetch 함수인 `getPosts()`는 여전히 `Post[]`를 반환하는 구형 시그니처를 유지 중이라 불일치 상태다. 향후 클라이언트 사이드 무한 스크롤/페이지네이션 구현 시 이 함수를 사용하려면 시그니처를 API 응답 형식에 맞게 선(先) 정렬해야 한다.

## 작업 주체

`nextjs-supabase-dev` 서브에이전트

## 수정 대상 파일

- `frontend/lib/api.ts` (단일 파일만 수정)

## 구현 계획

### 1. PaginatedResponse import 추가

`frontend/types/index.ts`에 이미 정의된 `PaginatedResponse<T>` 타입을 import한다.

```typescript
import type { PaginatedResponse } from '@/types';
```

### 2. getPosts() 함수 교체

기존:
```typescript
export async function getPosts(category?: string): Promise<Post[]> {
  const url = category
    ? `${BASE_URL}/api/posts?category=${encodeURIComponent(category)}`
    : `${BASE_URL}/api/posts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('게시글을 불러오지 못했습니다.');
  return res.json();
}
```

변경 후:
```typescript
export async function getPosts(params?: {
  category?: string;
  cursor?: string;
  limit?: number;
}): Promise<PaginatedResponse<Post>> {
  const urlParams = new URLSearchParams();
  if (params?.category) urlParams.set('category', params.category);
  if (params?.cursor) urlParams.set('cursor', params.cursor);
  if (params?.limit) urlParams.set('limit', String(params.limit));

  const query = urlParams.toString();
  const url = query
    ? `${BASE_URL}/api/posts?${query}`
    : `${BASE_URL}/api/posts`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('게시글을 불러오지 못했습니다.');
  return res.json();
}
```

### 3. 소비 코드 점검

탐색 결과 `getPosts()`는 현재 **어느 파일에서도 호출되지 않음** → 소비 코드 수정 불필요.

## 검증

```bash
cd frontend
npm run typecheck   # 타입 에러 없음 확인
npm run build       # 빌드 성공 확인
```
