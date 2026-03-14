# Task 7: 커뮤니티 게시글 및 댓글 CRUD Supabase 연동

## Context

현재 커뮤니티 페이지들은 하드코딩된 `placeholderPosts`, `placeholderComments`를 사용하고 있음.
API 라우트(`/api/posts`, `/api/posts/[postId]/comments`)와 Supabase DB(Task 2) 및 Turnstile(Task 4)은 이미 완성되어 있어,
이제 **페이지 레이어**에서 실데이터를 불러오고 자동 갱신 로직을 추가하는 작업이 필요함.

목표: 커뮤니티 기능의 플레이스홀더를 제거하고 Supabase 실데이터로 완전 연동.

---

## 수정 대상 파일 (4개)

| 파일 | 현재 상태 | 변경 내용 |
|------|---------|---------|
| `frontend/app/(main)/community/page.tsx` | placeholderPosts 하드코딩 | 서버 컴포넌트 + Supabase 쿼리 + searchParams 카테고리 필터링 |
| `frontend/app/(main)/community/[postId]/page.tsx` | placeholderPosts/Comments 하드코딩 | 서버 컴포넌트 + Supabase 단일 조회 + 조회수 증가 |
| `frontend/components/community/comment-list.tsx` | props로 배열 받는 클라이언트 컴포넌트 | 서버 컴포넌트 + Supabase 직접 쿼리 |
| `frontend/components/community/comment-form.tsx` | router.refresh() 없음 | 댓글 제출 성공 후 router.refresh() 추가 |

> `post-form.tsx`는 성공 시 `router.push('/community/${post.id}')` 로 다른 페이지로 이동하므로 refresh 불필요.

---

## 구현 상세

### 1. `community/page.tsx` — 게시글 목록

```typescript
// 패턴 참고: app/(main)/brands/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase'

export const revalidate = 60

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  const validCategories = ['정보공유', '추천', '질문', '잡담']
  if (category && validCategories.includes(category)) {
    query = query.eq('category', category)
  }

  const { data: posts } = await query

  // 기존 Tabs UI 유지, posts 실데이터 전달
}
```

- `revalidate = 60` (1분 ISR)
- searchParams의 Promise 패턴 사용 (Next.js 15+)
- 기존 Tabs/카테고리 UI 유지, `placeholderPosts` 제거

---

### 2. `community/[postId]/page.tsx` — 게시글 상세

```typescript
export const revalidate = 0  // 동적 렌더링 (조회수 증가 때문)

export default async function PostDetailPage({ params }) {
  const { postId } = await params
  const supabase = createServerSupabaseClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (!post) notFound()

  // 조회수 증가 (fire-and-forget)
  await supabase
    .from('posts')
    .update({ view_count: post.view_count + 1 })
    .eq('id', postId)

  // CommentList에는 postId만 전달 (서버 컴포넌트가 내부에서 조회)
}
```

- `revalidate = 0`: 조회수 매번 증가해야 하므로 동적 렌더링
- `notFound()` 처리 (패턴: `brands/[brandSlug]/page.tsx` 참고)
- CommentList에는 `postId`만 props로 전달 (CommentList가 내부에서 Supabase 조회)

---

### 3. `comment-list.tsx` — 서버 컴포넌트 전환

```typescript
// 패턴 참고: components/review/review-list.tsx
import { createServerSupabaseClient } from '@/lib/supabase'

// props 변경: Comment[] → { postId: string }
interface CommentListProps {
  postId: string
}

export async function CommentList({ postId }: CommentListProps) {
  const supabase = createServerSupabaseClient()

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (!comments || comments.length === 0) {
    return <p className="text-muted-foreground">아직 댓글이 없습니다.</p>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (...))}
    </div>
  )
}
```

- `"use client"` 제거 → 서버 컴포넌트
- props 인터페이스 변경: `Comment[]` → `{ postId: string }`
- 기존 댓글 렌더링 UI 최대한 유지

---

### 4. `comment-form.tsx` — router.refresh() 추가

```typescript
// 패턴 참고: components/review/review-form.tsx
import { useRouter } from 'next/navigation'

export function CommentForm({ postId }: ...) {
  const router = useRouter()

  const onSubmit = async (values) => {
    // ... 기존 createComment 호출 로직 ...
    toast.success('댓글이 등록되었습니다.')
    router.refresh()  // 추가
    reset()
  }
}
```

---

## 재사용 참고 코드

| 참고 파일 | 재사용 패턴 |
|---------|-----------|
| `frontend/components/review/review-list.tsx` | 서버 컴포넌트 + Supabase 쿼리 패턴 |
| `frontend/components/review/review-form.tsx` | router.refresh() 패턴 |
| `frontend/app/(main)/brands/[brandSlug]/page.tsx` | notFound() + params 비동기 패턴 |
| `frontend/app/(main)/brands/page.tsx` | revalidate + 빈 상태 UI 패턴 |
| `frontend/lib/supabase.ts` | createServerSupabaseClient() |

---

## 검증 방법

1. `pnpm dev` 실행 후:
   - `/community` 접속 → 실제 게시글 목록이 표시되는지 확인
   - 카테고리 탭 클릭 → URL searchParams가 변경되고 필터링 동작 확인
   - 게시글 클릭 → 상세 페이지에서 실제 데이터 표시 확인
   - 새 게시글 작성 → `/community/write`에서 작성 후 상세 페이지로 이동 확인
   - 댓글 작성 → 폼 제출 후 댓글 목록이 즉시 갱신되는지 확인
2. Supabase 대시보드에서 `view_count` 컬럼이 증가하는지 확인
3. 빈 상태 UI: posts/comments가 없을 때 "게시글이 없습니다" 메시지 표시 확인
