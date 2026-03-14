# Task 7: 커뮤니티 게시글 및 댓글 CRUD Supabase 연동 계획

## 개요

커뮤니티 페이지 4개 파일을 placeholder 데이터에서 실제 Supabase 연동으로 전환합니다.

## 파일별 변경 계획

### 1. `frontend/app/(main)/community/page.tsx`

**현재 상태:**
- `placeholderPosts` 배열로 하드코딩된 데이터 사용
- 클라이언트 렌더링, searchParams 미사용
- `Tabs` 컴포넌트로 카테고리 전환 (defaultValue="전체")

**변경 사항:**
- `export const revalidate = 60` 추가 (ISR 60초)
- 함수 시그니처: `async function CommunityPage({ searchParams }: { searchParams: Promise<{ category?: string }> })`
- `searchParams`를 `await`으로 언래핑
- `createServerSupabaseClient()`로 `posts` 테이블 조회
  - 카테고리가 "전체" 또는 미지정이면 `.select("*")`
  - 카테고리가 지정되면 `.eq("category", category)`
  - `.order("created_at", { ascending: false })`
- **Tabs 처리:** 기존 `Tabs` + `TabsContent` 구조 유지하되, 각 탭 클릭 시 URL searchParams를 변경하는 방식으로 전환
  - `Tabs`의 `defaultValue`를 `currentCategory`(searchParams 값)로 설정
  - 각 `TabsTrigger`에 `asChild` + `Link href` 패턴 또는 `value` 변경 핸들러 적용
  - **핵심 고려사항:** `Tabs`는 클라이언트 상태 컴포넌트이므로 URL 기반 필터링을 위해 별도 `CategoryTabs` 클라이언트 컴포넌트를 분리하거나, 서버에서 카테고리별로 필터한 데이터를 이미 받아서 `PostList` 하나만 렌더링하는 방식 채택
  - **결정: 서버에서 필터링 후 PostList 단일 렌더링 + 탭은 클라이언트 컴포넌트로 분리**
  - `components/community/category-tabs.tsx` (새 클라이언트 컴포넌트) 생성
    - `"use client"`, `useRouter`, `useSearchParams` 사용
    - 탭 클릭 시 `router.push("/community?category=xxx")` 호출
- `placeholderPosts` 제거
- DB 에러 시 에러 UI 표시
- 데이터 없을 시 빈 상태 UI (`PostList`에 이미 구현됨)

**Supabase DB 컬럼 매핑 (snake_case → camelCase):**
- `id` → `id`
- `title` → `title`
- `content` → `content`
- `category` → `category`
- `author_nickname` → `authorNickname`
- `view_count` → `viewCount`
- `comment_count` → `commentCount`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

---

### 2. `frontend/app/(main)/community/[postId]/page.tsx`

**현재 상태:**
- `placeholderPosts`, `placeholderComments` 딕셔너리로 하드코딩
- `CommentList`에 `comments` 배열 직접 전달

**변경 사항:**
- `export const revalidate = 0` 추가 (동적 렌더링)
- `createServerSupabaseClient()`로 단일 게시글 조회
  - `.from("posts").select("*").eq("id", postId).single()`
  - error 또는 data가 null이면 `notFound()` 호출
- 조회수 증가: 조회 성공 후 `.update({ view_count: post.view_count + 1 }).eq("id", postId)` 실행
- `placeholderPosts`, `placeholderComments` 제거
- `CommentList`에 `postId`만 전달 (내부에서 Supabase 조회하도록 변경)
- 댓글 수는 `post.comment_count`로 표시
- DB 레코드 snake_case → camelCase 변환 함수 작성

---

### 3. `frontend/components/community/comment-list.tsx`

**현재 상태:**
- props: `{ comments: Comment[] }`
- 클라이언트 컴포넌트 지시어 없음 (이미 서버 컴포넌트)

**변경 사항:**
- `'use client'` 지시어 없음 유지 (서버 컴포넌트)
- props 인터페이스 변경: `{ comments: Comment[] }` → `{ postId: string }`
- 함수를 `async`로 변경
- `createServerSupabaseClient()`로 `comments` 테이블 조회
  - `.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true })`
- DB 레코드 snake_case → camelCase 변환
- 에러 처리 및 빈 상태 UI (기존 빈 상태 메시지 유지)

**Supabase DB 컬럼 매핑:**
- `id` → `id`
- `post_id` → `postId`
- `content` → `content`
- `author_nickname` → `authorNickname`
- `created_at` → `createdAt`

---

### 4. `frontend/components/community/comment-form.tsx`

**현재 상태:**
- `useRouter` import 없음
- 성공 후 `onSuccess?.()` 호출만 함 (페이지 갱신 없음)

**변경 사항:**
- `useRouter` import 추가: `import { useRouter } from "next/navigation";`
- 컴포넌트 내부에 `const router = useRouter();` 선언
- `onSubmit` 성공 후 `router.refresh()` 추가 (기존 `onSuccess?.()` 호출 앞이나 뒤에 삽입)
- 이미 `"use client"` 선언되어 있음 - 변경 불필요

---

## 새로 생성할 파일

### `frontend/components/community/category-tabs.tsx`

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostCategory } from "@/types";

const CATEGORIES: (PostCategory | "전체")[] = ["전체", "정보공유", "추천", "질문", "잡담"];

export function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "전체";

  const handleTabChange = (value: string) => {
    if (value === "전체") {
      router.push("/community");
    } else {
      router.push(`/community?category=${encodeURIComponent(value)}`);
    }
  };

  return (
    <Tabs value={currentCategory} onValueChange={handleTabChange}>
      <TabsList className="mb-6">
        {CATEGORIES.map((cat) => (
          <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
```

---

## 실행 순서

1. `category-tabs.tsx` 신규 생성
2. `comment-list.tsx` 수정 (props 변경, 서버 컴포넌트로 Supabase 조회)
3. `comment-form.tsx` 수정 (router.refresh() 추가)
4. `community/[postId]/page.tsx` 수정 (Supabase 연동, CommentList props 변경)
5. `community/page.tsx` 수정 (Supabase 연동, CategoryTabs 사용)

## 검증 포인트

- [ ] TypeScript 타입 오류 없음 (snake_case → camelCase 매핑 정확성)
- [ ] `params`, `searchParams` 모두 `await` 처리
- [ ] Supabase 에러 핸들링 (error 객체 체크)
- [ ] `notFound()` 적절한 위치에서 호출
- [ ] `revalidate` 값 올바르게 설정 (community: 60, postId: 0)
- [ ] `CommentList`가 서버 컴포넌트로서 비동기 데이터 조회
- [ ] `CommentForm`의 `router.refresh()`가 서버 컴포넌트(CommentList) 재조회 트리거
