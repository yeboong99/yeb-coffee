# Task 12: PaginatedResponse<T> 공통 타입 정의

## Context

v2 기능(무한 스크롤, 더보기 로딩)에서 커서 기반 페이지네이션 응답 형식을 통일하기 위해
공통 제네릭 타입을 추가한다.

- F021 게시글 무한 스크롤
- F022 리뷰 더보기 로딩

두 기능 모두 동일한 API 응답 형식을 사용하므로, 중복 정의 없이 재사용 가능한 공통 타입이 필요하다.

## 작업 주체

**nextjs-supabase-dev agent** 가 작업을 수행한다.

## 구현 계획

### 수정 파일

- `frontend/types/index.ts`

### 변경 내용

기존 export 목록 하단에 `PaginatedResponse<T>` 인터페이스를 추가한다.

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

### 현재 index.ts 상태

현재 export 목록:
- `Brand` (from brand.ts)
- `Capsule`, `IntensityLevel`, `FlavorNote` (from capsule.ts)
- `Review`, `CreateReviewInput` (from review.ts)
- `Post`, `PostCategory`, `CreatePostInput` (from post.ts)
- `Comment`, `CreateCommentInput` (from comment.ts)

`PaginatedResponse` 타입은 아직 어디에도 존재하지 않음 → 새로 추가 필요

### 구현 방식

`index.ts` 하단에 직접 인터페이스를 정의하고 export한다.
(별도 파일 분리 불필요 - 단순한 공통 타입이므로)

## 검증

```bash
cd frontend
npm run typecheck   # 타입 에러 없음 확인
npm run build       # 빌드 성공 확인
```

추가로 PaginatedResponse<Post>, PaginatedResponse<Review> 타입이 정상 추론되는지 확인한다.
