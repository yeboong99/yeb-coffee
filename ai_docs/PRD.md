# 캡슐 커피 커뮤니티 PRD v2

> **버전**: v2.0
> **작성일**: 2026-03-16
> **기반**: MVP v1 완성 상태에서 두 가지 고도화 기능 추가
> **참조**: `ai_docs/PRD_v1.md` (MVP PRD)

---

## 핵심 정보

**목적**: 캡슐 커피 사용자가 쿠팡 평점과 커뮤니티 평점을 한눈에 비교하고, 게시글과 리뷰를 끊김 없이 탐색할 수 있도록 서비스 품질을 고도화
**사용자**: 캡슐 커피 머신을 사용 중이거나 구매를 고려 중인 국내 소비자

---

## v2 변경 범위 요약

| 구분 | 기능 ID | 내용 |
|------|---------|------|
| 신규 기능 | F020 | 캡슐 Top 5 랭킹 섹션 (홈 페이지 — 쿠팡 평점 / 서비스 평점 좌우 비교) |
| 신규 기능 | F021 | 커뮤니티 게시글 커서 기반 무한 스크롤 |
| 신규 기능 | F022 | 캡슐 리뷰 커서 기반 "더보기" 버튼 점진적 로딩 |
| 변경 없음 | F001~F012 | MVP 기능 전체 동작 방식 유지 |
| 변경 없음 | 댓글 | 전체 로드 방식 유지, 페이지네이션 미적용 |

---

## 기능 명세

### 신규 기능 (v2 추가)

| ID | 기능명 | 설명 | 추가 이유 | 관련 페이지 |
|----|--------|------|----------|------------|
| **F020** | 캡슐 Top 5 랭킹 | 홈 페이지에 쿠팡 평점 기준 Top 5와 서비스 평점 기준 Top 5를 좌우로 나란히 표시 | 서비스 신뢰도 지표 제공 및 사용자 탐색 진입점 강화 | 홈 페이지 |
| **F021** | 게시글 무한 스크롤 | 커뮤니티 게시글 목록에서 스크롤 하단 도달 시 자동으로 다음 10개 로드 | 전체 데이터 일괄 로드로 인한 초기 응답 지연 개선 | 커뮤니티 목록 페이지 |
| **F022** | 리뷰 더보기 로딩 | 캡슐 상세 페이지 리뷰 목록에서 "더보기" 버튼 클릭 시 5개씩 추가 로드 | 리뷰 다수 캡슐에서 초기 로딩 비용 절감 | 캡슐 상세 페이지 |

### 기존 MVP 기능 (v1에서 유지)

| ID | 기능명 | 관련 페이지 |
|----|--------|------------|
| **F001** | 브랜드 카탈로그 조회 | 홈 페이지, 브랜드 목록 페이지, 캡슐 목록 페이지 |
| **F002** | 캡슐 상세 정보 조회 | 캡슐 상세 페이지 |
| **F003** | 익명 캡슐 리뷰 작성 | 캡슐 상세 페이지 |
| **F004** | 커뮤니티 게시글 작성 | 커뮤니티 목록 페이지, 게시글 작성 페이지 |
| **F005** | 커뮤니티 게시글 조회 | 커뮤니티 목록 페이지, 게시글 상세 페이지 |
| **F006** | 익명 댓글 작성 | 게시글 상세 페이지 |
| **F010** | 노션 CMS 연동 | 홈 페이지, 브랜드 목록 페이지, 캡슐 목록 페이지, 캡슐 상세 페이지 |
| **F011** | 캡슐 검색 | 캡슐 목록 페이지 |
| **F012** | 스팸/어뷰징 방어 | 캡슐 상세 페이지, 게시글 작성 페이지, 게시글 상세 페이지 |

---

## 기능 상세 명세

### F020 — 캡슐 Top 5 랭킹

#### 개요

홈 페이지의 `BrandShowcase` 아래, `PopularPosts` 위에 `TopCapsules` 섹션을 삽입한다. 좌측에 쿠팡 평점 기준 Top 5, 우측에 서비스 자체 평점 기준 Top 5를 나란히 표시하여 사용자가 두 평점을 한눈에 비교할 수 있도록 한다.

#### 홈 페이지 컴포넌트 순서 변경

```
변경 전:
  HeroSection → BrandShowcase → PopularPosts

변경 후:
  HeroSection → BrandShowcase → TopCapsules (신규) → PopularPosts
```

#### 데이터 소스 및 조회 방식

**쿠팡 평점 Top 5**

| 항목 | 내용 |
|------|------|
| 데이터 소스 | Notion CMS — `Capsule.coupangRating` 필드 (노션 프로퍼티명: `AverageRating`) |
| 조회 함수 | 신규 `getAllCapsules()` 함수 — 전체 캡슐 조회 후 JS로 정렬 |
| 정렬 | `coupangRating DESC`, `null` 값은 후순위 처리 |
| 필터 | `coupangRating !== null` |
| 표시 개수 | 상위 5개 |

**서비스 평점 Top 5**

| 항목 | 내용 |
|------|------|
| 데이터 소스 | Supabase — 기존 `capsule_review_stats` 뷰 |
| 조회 방식 | `review_count >= 5` 필터 + `avg_rating DESC` 정렬 + `limit(5)` |
| 최소 리뷰 수 기준 | 5개 이상 (신뢰도 확보 목적) |
| Notion 조인 | Supabase 결과의 `capsule_slug` 목록으로 `getAllCapsules()` 결과와 메모리 내 slug 매칭 |

**병렬 조회**: `TopCapsules` 컴포넌트에서 Notion 전체 조회와 Supabase 조회를 `Promise.all`로 병렬 실행하여 응답 시간 최소화.

#### 신규 함수: `getAllCapsules()`

```typescript
// frontend/lib/notion.ts 에 추가
export async function getAllCapsules(): Promise<Capsule[]>
```

- Notion `CAPSULE_DATABASE_ID` 전체 조회
- **Notion API 페이지네이션 필수**: `databases.query()`는 한 번에 최대 100건만 반환하므로, `has_more`와 `next_cursor`를 사용한 반복 조회 로직 포함

```typescript
// Notion API는 한 번에 최대 100건 반환 — 전체 조회를 위해 페이지네이션 반복 필요
let allPages: PageObjectResponse[] = [];
let cursor: string | undefined = undefined;
do {
  const response = await notion.databases.query({
    database_id: CAPSULE_DATABASE_ID,
    start_cursor: cursor,
  });
  allPages.push(...response.results.filter(isFullPage));
  cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
} while (cursor);
```

- 브랜드 목록을 먼저 `getBrands()`로 조회하여 `Map<brandId, Brand>`로 캐싱 (N+1 방지)
- 각 캡슐 페이지의 Brand relation ID로 브랜드 맵에서 `brandName`, `brandSlug` 조회
- 브랜드 정보 없는 캡슐은 빈 문자열로 처리 (에러 방지)
- 기존 `mapNotionPageToCapsule()` 함수 재사용

#### 신규 컴포넌트: `top-capsules.tsx`

```
frontend/components/home/top-capsules.tsx
```

| 항목 | 내용 |
|------|------|
| 컴포넌트 타입 | 서버 컴포넌트 (async) |
| 레이아웃 | 데스크톱: 2열 그리드 / 모바일: 1열 스택 |
| 좌측 열 | 쿠팡 인기 Top 5 — 순위, 캡슐 썸네일, 캡슐명, 브랜드명, 쿠팡 평점 |
| 우측 열 | yeb coffee 인기 Top 5 — 순위, 캡슐 썸네일, 캡슐명, 브랜드명, 서비스 평균 평점, 리뷰 수 (예: "4.8점 (23개)") |
| 각 항목 클릭 | 해당 캡슐 상세 페이지로 이동 |
| 서비스 Top 5 빈 상태 | 리뷰 5개 이상인 캡슐이 없을 경우 "아직 충분한 리뷰가 없습니다" 안내 문구 표시 |

#### 에러 처리

- Notion 조회 실패 시 쿠팡 Top 5 열 숨김 (홈 페이지 전체 렌더링 중단하지 않음)
- Supabase 조회 실패 시 서비스 Top 5 열 숨김

#### 캐싱 전략

| 항목 | 값 |
|------|-----|
| ISR revalidate | 3600초 — 홈 페이지 `page.tsx` 기존 설정 유지 |
| 별도 캐시 레이어 | 없음 — ISR로 충분 |

---

### F021 — 커뮤니티 게시글 무한 스크롤

#### 개요

커뮤니티 목록 페이지의 게시글 로딩 방식을 전체 조회에서 커서 기반 페이지네이션으로 전환하고, 스크롤 하단 도달 시 자동으로 다음 페이지를 로드하는 무한 스크롤 UI를 적용한다.

#### 페이지당 개수

게시글: **10개**

#### API 변경 (`GET /api/posts`)

**변경 전 요청/응답**

```
GET /api/posts?category=브랜드후기
응답: Post[]  (전체 배열)
```

**변경 후 요청/응답**

```
GET /api/posts?category=브랜드후기&cursor=2026-03-01T12:00:00.000Z&limit=10
응답: PaginatedResponse<Post>
```

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| `category` | string | 선택 | - | 카테고리 필터 (기존과 동일) |
| `cursor` | string | 선택 | - | 이전 응답의 `nextCursor` 값. 없으면 첫 페이지 반환 |
| `limit` | number | 선택 | 10 | 페이지당 개수. 최대 20 |

**응답 형식**

```typescript
// frontend/types/index.ts 또는 frontend/types/pagination.ts 에 추가
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null; // 다음 페이지 커서. 마지막 페이지면 null
  hasMore: boolean;          // 추가 데이터 존재 여부
}
```

**서버 조회 로직 (`frontend/app/api/posts/route.ts`)**

```
1. cursor 있으면: WHERE created_at < cursor 조건 추가
2. ORDER BY created_at DESC
3. limit + 1 개 조회 (N+1 패턴으로 hasMore 판별)
4. 조회 결과가 limit + 1 이면: hasMore = true, 마지막 1개 제거
5. 조회 결과가 limit 이하이면: hasMore = false
6. 응답의 nextCursor = 최종 결과 배열의 마지막 항목 created_at
7. nextCursor = hasMore가 false이면 null
8. 응답 전 Supabase raw 데이터(snake_case)를 기존 `mapRowToPost()` 함수로 camelCase 변환 후 `PaginatedResponse`에 담아 반환
```

**하위 호환성**: `cursor` 파라미터 없으면 첫 페이지 반환 — 기존 동작과 동일하게 처리.

#### 프론트엔드 렌더링 전략 (하이브리드)

| 단계 | 방식 | 설명 |
|------|------|------|
| 초기 렌더링 | 서버 (ISR) | `community/page.tsx`에서 첫 10개 SSR. `revalidate = 60` 유지 |
| 추가 로딩 | 클라이언트 | React Query `useInfiniteQuery`로 2페이지 이후 동적 로드 |
| 초기 데이터 전달 | props | 서버에서 렌더된 첫 페이지를 `initialData`로 클라이언트 컴포넌트에 전달 |

#### 변경 파일 목록

| 파일 | 변경 내용 |
|------|---------|
| `frontend/app/api/posts/route.ts` | GET 핸들러에 `cursor`, `limit` 파라미터 처리 및 `PaginatedResponse` 형식 반환 추가. camelCase 변환 후 응답 |
| `frontend/lib/api.ts` | `getPosts()` 시그니처 변경 — `PaginatedResponse<Post>` 반환 및 커서 파라미터 지원 |
| `frontend/app/(main)/community/page.tsx` | 서버에서 첫 페이지만 조회 후 `InfinitePostList`에 `initialData` 전달 |
| `frontend/components/community/post-list.tsx` | 기존 서버 렌더링용 목록 유지 (초기 렌더 담당) |

#### 신규 컴포넌트: `post-list-infinite.tsx`

```
frontend/components/community/post-list-infinite.tsx
```

| 항목 | 내용 |
|------|------|
| 컴포넌트 타입 | 클라이언트 컴포넌트 (`'use client'`) |
| React Query 훅 | `useInfiniteQuery` — 쿼리 키: `['posts', category]` |
| 스크롤 감지 | `IntersectionObserver` — 목록 하단 감지 요소가 뷰포트 진입 시 `fetchNextPage()` 호출 |
| 로딩 UI | 스크롤 하단 스켈레톤 카드 3개 표시 |
| 완료 상태 | `hasMore: false` 시 "모든 게시글을 확인했습니다" 문구 표시 |
| 카테고리 전환 | 쿼리 키에 `category` 포함 — 탭 전환 시 캐시 분리 및 첫 페이지부터 재조회 |

#### `api.ts` 변경 명세

```typescript
// 변경 전
export async function getPosts(category?: string): Promise<Post[]>

// 변경 후
export async function getPosts(params?: {
  category?: string;
  cursor?: string;
  limit?: number;
}): Promise<PaginatedResponse<Post>>
```

---

### F022 — 캡슐 리뷰 더보기 로딩

#### 개요

캡슐 상세 페이지의 리뷰 목록 로딩 방식을 전체 조회에서 커서 기반 페이지네이션으로 전환하고, 명시적 "더보기" 버튼 클릭으로 추가 리뷰를 5개씩 로드한다. 무한 스크롤이 아닌 버튼 방식을 채택하는 것은 리뷰 하단의 리뷰 작성 폼 접근성을 유지하기 위함이다.

#### 페이지당 개수

리뷰: **5개**

#### API 변경 (`GET /api/reviews`)

**변경 전 요청/응답**

```
GET /api/reviews?capsuleSlug=ristretto
응답: Review[]  (전체 배열)
```

**변경 후 요청/응답**

```
GET /api/reviews?capsuleSlug=ristretto&cursor=2026-03-01T12:00:00.000Z&limit=5
응답: PaginatedResponse<Review>
```

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| `capsuleSlug` | string | 필수 | - | 캡슐 슬러그 (기존과 동일) |
| `cursor` | string | 선택 | - | 이전 응답의 `nextCursor` 값 |
| `limit` | number | 선택 | 5 | 페이지당 개수. 최대 20 |

**응답 형식**: F021과 동일한 `PaginatedResponse<Review>` 구조 사용.

**서버 조회 로직 (`frontend/app/api/reviews/route.ts`)**: F021과 동일한 N+1 패턴 적용. 응답 전 Supabase raw 데이터(snake_case)를 기존 `mapRowToReview()` 함수로 camelCase 변환 후 `PaginatedResponse`에 담아 반환.

#### 프론트엔드 렌더링 전략 (하이브리드)

| 단계 | 방식 | 설명 |
|------|------|------|
| 초기 렌더링 | 서버 (Suspense) | 캡슐 상세 페이지에서 첫 5개 SSR. 기존 Suspense 경계 유지 |
| 추가 로딩 | 클라이언트 | React Query `useInfiniteQuery`로 버튼 클릭 시 추가 로드 |
| 초기 데이터 전달 | props | 서버에서 렌더된 첫 페이지를 `initialData`로 클라이언트 컴포넌트에 전달 |

#### 변경 파일 목록

| 파일 | 변경 내용 |
|------|---------|
| `frontend/app/api/reviews/route.ts` | GET 핸들러에 `cursor`, `limit` 파라미터 처리 및 `PaginatedResponse` 형식 반환 추가. camelCase 변환 후 응답 |
| `frontend/lib/api.ts` | `getReviews()` 시그니처 변경 — `PaginatedResponse<Review>` 반환 및 커서 파라미터 지원 |
| `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` | 서버에서 첫 페이지만 조회 후 `ReviewListInfinite`에 `initialData` 전달 |
| `frontend/components/review/review-list.tsx` | 기존 서버 렌더링용 목록 유지 (초기 렌더 담당) |
| `frontend/components/review/review-form.tsx` | 리뷰 작성 성공 후 `router.refresh()` 대신 `onSuccess` 콜백을 통해 부모에서 `queryClient.invalidateQueries(['reviews', capsuleSlug])` 호출하도록 변경 |

#### 신규 컴포넌트: `review-list-infinite.tsx`

```
frontend/components/review/review-list-infinite.tsx
```

| 항목 | 내용 |
|------|------|
| 컴포넌트 타입 | 클라이언트 컴포넌트 (`'use client'`) |
| React Query 훅 | `useInfiniteQuery` — 쿼리 키: `['reviews', capsuleSlug]` |
| 더보기 트리거 | "더보기" 버튼 클릭 시 `fetchNextPage()` 호출 |
| 로딩 UI | 버튼 내 스피너 + 버튼 비활성화 |
| 완료 상태 | `hasMore: false` 시 버튼 숨김 |
| 리뷰 작성 후 갱신 | 리뷰 제출 성공 시 `queryClient.invalidateQueries(['reviews', capsuleSlug])` 호출 — 목록 캐시 무효화 및 첫 페이지부터 재조회 |

#### `api.ts` 변경 명세

```typescript
// 변경 전
export async function getReviews(capsuleSlug: string): Promise<Review[]>

// 변경 후
export async function getReviews(
  capsuleSlug: string,
  params?: { cursor?: string; limit?: number }
): Promise<PaginatedResponse<Review>>
```

---

## 페이지별 상세 기능 변경사항

### 홈 페이지 (변경)

> **구현 기능:** `F001`, `F010`, `F020` | **메뉴 위치:** 헤더 > 홈

| 항목 | 내용 |
|------|------|
| **역할** | 서비스 진입점. 브랜드 소개 + 캡슐 인기 랭킹 + 인기 게시글을 한 화면에 제공 |
| **진입 경로** | 서비스 URL 직접 접속 또는 헤더 홈 메뉴 클릭 |
| **사용자 행동** | 브랜드 카드로 탐색하거나, Top 5 랭킹을 통해 인기 캡슐을 바로 확인하거나, 인기 게시글을 통해 커뮤니티로 진입 |
| **주요 기능** | - 브랜드 카드 그리드 표시 (F001)<br>- **신규** 쿠팡 평점 Top 5 / 서비스 평점 Top 5 좌우 비교 표시 (F020)<br>- 최신 커뮤니티 인기 게시글 5개 미리보기<br>- Top 5 캡슐 항목 클릭 시 캡슐 상세 페이지로 이동 |
| **구현 기능 ID** | `F001`, `F010`, `F020` |
| **다음 이동** | 브랜드 카드 클릭 → 캡슐 목록 페이지, Top 5 캡슐 클릭 → 캡슐 상세 페이지, 게시글 미리보기 클릭 → 게시글 상세 페이지 |

---

### 커뮤니티 목록 페이지 (변경)

> **구현 기능:** `F004`, `F005`, `F021` | **메뉴 위치:** 헤더 > 커뮤니티

| 항목 | 내용 |
|------|------|
| **역할** | 사용자 작성 게시글 목록 표시 및 무한 스크롤 탐색, 새 글 작성 진입 페이지 |
| **진입 경로** | 헤더 커뮤니티 메뉴 클릭 또는 캡슐 상세 페이지 커뮤니티 링크 클릭 |
| **사용자 행동** | 게시글을 스크롤하며 탐색하고, 하단 도달 시 자동으로 추가 게시글 로드 |
| **주요 기능** | - 서버 렌더링된 첫 10개 게시글 표시 (ISR 60초, F005)<br>- **신규** 스크롤 하단 도달 시 자동으로 다음 10개 게시글 로드 (F021)<br>- 카테고리 탭 전환 시 목록 리셋 및 해당 카테고리 첫 페이지부터 재조회<br>- 글쓰기 버튼 클릭 시 게시글 작성 페이지로 이동 (F004) |
| **구현 기능 ID** | `F004`, `F005`, `F021` |
| **다음 이동** | 게시글 클릭 → 게시글 상세 페이지, 글쓰기 버튼 → 게시글 작성 페이지 |

---

### 캡슐 상세 페이지 (변경)

> **구현 기능:** `F002`, `F003`, `F010`, `F022` | **메뉴 위치:** 캡슐 목록에서 캡슐 클릭

| 항목 | 내용 |
|------|------|
| **역할** | 캡슐 상세 정보 조회, 리뷰 점진적 탐색, 리뷰 작성의 핵심 페이지 |
| **진입 경로** | 캡슐 목록 페이지에서 캡슐 카드 클릭, 또는 홈 페이지 Top 5 캡슐 항목 클릭 |
| **사용자 행동** | 캡슐 상세 정보를 확인하고, 리뷰를 읽으며 "더보기"로 추가 리뷰를 로드하거나 직접 리뷰를 작성 |
| **주요 기능** | - 노션 CMS 기반 캡슐 상세 정보 (강도, 맛, 향, 호환 머신 등, F002)<br>- 서버 렌더링된 첫 5개 리뷰 표시 (F003)<br>- **신규** "더보기" 버튼 클릭 시 리뷰 5개씩 추가 로드 (F022)<br>- 모든 리뷰 로드 완료 시 버튼 숨김<br>- 리뷰 작성 모달 (별점 + 텍스트 + Turnstile 검증, F003/F012) |
| **구현 기능 ID** | `F002`, `F003`, `F010`, `F022` |
| **다음 이동** | 리뷰 제출 → 리뷰 목록 갱신 (캐시 무효화), 커뮤니티 링크 클릭 → 커뮤니티 목록 페이지 |

---

## 공통 타입 추가

### PaginatedResponse

```typescript
// 추가 위치: frontend/types/index.ts 또는 frontend/types/pagination.ts
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null; // 마지막 페이지면 null
  hasMore: boolean;
}
```

F021(게시글)과 F022(리뷰) 모두 이 타입을 공통으로 사용한다.

---

## 영향 범위 요약

### 신규 파일

| 파일 | 설명 |
|------|------|
| `frontend/components/home/top-capsules.tsx` | 홈 페이지 Top 5 랭킹 섹션 — 서버 컴포넌트 |
| `frontend/components/community/post-list-infinite.tsx` | 무한 스크롤 게시글 목록 — 클라이언트 컴포넌트 |
| `frontend/components/review/review-list-infinite.tsx` | 더보기 방식 리뷰 목록 — 클라이언트 컴포넌트 |

### 수정 파일

| 파일 | 변경 내용 |
|------|---------|
| `frontend/lib/notion.ts` | `getAllCapsules()` 함수 추가 |
| `frontend/lib/api.ts` | `getPosts()`, `getReviews()` 시그니처 변경 (커서 파라미터 + `PaginatedResponse` 반환) |
| `frontend/app/api/posts/route.ts` | GET 핸들러 — 커서 기반 페이지네이션 로직 추가 |
| `frontend/app/api/reviews/route.ts` | GET 핸들러 — 커서 기반 페이지네이션 로직 추가 |
| `frontend/app/(main)/page.tsx` | `TopCapsules` 컴포넌트 삽입 (`BrandShowcase` 아래) |
| `frontend/app/(main)/community/page.tsx` | 첫 페이지만 서버 조회 + `InfinitePostList`에 `initialData` 전달 |
| `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` | 리뷰 첫 페이지 서버 조회 + `ReviewListInfinite`에 `initialData` 전달 |
| `frontend/components/review/review-form.tsx` | 리뷰 작성 성공 후 `router.refresh()` 제거, `onSuccess` 콜백으로 부모에서 `queryClient.invalidateQueries` 호출하도록 변경 |
| `frontend/types/index.ts` | `PaginatedResponse<T>` 타입 추가 |

### 변경 없는 파일

| 파일 | 이유 |
|------|------|
| `frontend/app/api/posts/[postId]/comments/route.ts` | 댓글 페이지네이션 미적용 |
| `frontend/lib/supabase.ts` | 기존 `getServiceRating()`, `getServiceRatings()` 함수 그대로 활용 |
| `frontend/lib/validations.ts` | 입력 스키마 변경 없음 |
| `frontend/components/community/post-list.tsx` | 서버 초기 렌더링 담당 역할 유지 |
| `frontend/components/review/review-list.tsx` | 서버 초기 렌더링 담당 역할 유지 |

---

## 구현 시 주의사항

### F020 구현 주의사항

1. `getAllCapsules()`는 브랜드 수만큼 추가 API 호출이 발생하지 않도록, `getBrands()` 1회 호출 후 `Map<brandId, Brand>`로 캐싱 후 캡슐에 조인
2. `coupangRating`이 `null`인 캡슐이 상위에 포함되지 않도록 filter 후 sort 처리
3. 서비스 Top 5: `review_count >= 5` 조건 미달 데이터가 5개 미만이면 표시 가능한 개수만큼만 표시 (0개면 빈 상태 문구)
4. Notion 조회와 Supabase 조회를 `Promise.all`로 병렬 실행

### F021 구현 주의사항

1. React Query 쿼리 키에 `category`를 포함하여 카테고리별 캐시 분리: `['posts', category ?? 'all']`
2. 서버에서 전달한 첫 페이지 데이터를 `useInfiniteQuery`의 `initialData`로 설정하여 중복 네트워크 요청 방지
3. 커서는 `created_at` ISO 문자열 사용. 동일 시각 게시글 간 순서 누락 가능성이 있으나 MVP v2 범위에서는 허용
4. 커뮤니티 페이지의 ISR(`revalidate = 60`)은 서버 초기 렌더 데이터에만 적용. 클라이언트 추가 로드는 항상 실시간 조회
5. `mapRowToPost()` 함수가 현재 서버 컴포넌트 파일에 인라인으로 정의되어 있으므로, API route에서도 재사용할 수 있도록 `lib/mappers.ts` 등 공통 모듈로 추출 필요

### F022 구현 주의사항

1. 리뷰 작성 성공 후 `queryClient.invalidateQueries(['reviews', capsuleSlug])` 호출로 캐시 무효화 필수 — 작성 직후 새 리뷰가 목록 상단에 반영되어야 함. 현재 `review-form.tsx:71`에서 `router.refresh()`를 호출하는 방식을 제거하고, 기존 `onSuccess?: () => void` prop (`review-form.tsx:29`)을 활용하여 부모 컴포넌트(`ReviewListInfinite`)에서 `queryClient.invalidateQueries`를 호출하도록 변경
2. 캡슐 상세 페이지의 기존 Suspense 경계 구조 유지. 서버 첫 페이지는 기존 서버 컴포넌트 내에서 렌더링하고, 클라이언트 더보기 컴포넌트는 Suspense 경계 바깥에서 처리
3. "더보기" 버튼은 `hasMore: true`일 때만 렌더링. 로딩 중에는 버튼 비활성화 + 스피너 표시
4. `mapRowToReview()` 함수가 현재 서버 컴포넌트 파일에 인라인으로 정의되어 있으므로, API route에서도 재사용할 수 있도록 `lib/mappers.ts` 등 공통 모듈로 추출 필요

---

## 기존 코드와의 정합성 확인

| 항목 | 기존 상태 | v2 활용 방식 |
|------|---------|------------|
| `Capsule.coupangRating` 타입 | `number \| null` (`frontend/types/capsule.ts:17`) | F020에서 그대로 사용 |
| `mapNotionPageToCapsule()`의 `AverageRating` 매핑 | 구현 완료 (`frontend/lib/notion.ts:155`) | `getAllCapsules()` 내부에서 재사용 |
| `capsule_review_stats` Supabase 뷰 | `capsule_slug`, `avg_rating`, `review_count` 컬럼 존재 | F020 서비스 Top 5 조회에서 직접 쿼리 |
| `getServiceRating()`, `getServiceRatings()` | 구현 완료 (`frontend/lib/supabase.ts:41-81`) | 기존 캡슐 상세 페이지에서 유지. Top 5는 별도 쿼리 사용 |
| `QueryProvider` 설정 | 구현 완료 (`frontend/lib/query-provider.tsx`) | `useInfiniteQuery` 추가 패키지 없이 React Query v5 기본 사용 |
| `getCapsulesByBrandId()` | 구현 완료 (`frontend/lib/notion.ts:207`) | `getAllCapsules()`는 이와 동일한 패턴으로 브랜드 필터 없이 구현 |

---

## 변경되지 않는 항목

- 댓글 시스템 (전체 로드 방식 유지, 페이지네이션 미적용)
- F001~F012 기존 MVP 기능 동작 방식
- ISR revalidate 설정 (홈: 3600초, 커뮤니티: 60초)
- Cloudflare Turnstile 검증 방식
- 노션 CMS 연동 구조 (`getBrands()`, `getCapsulesByBrandId()`, `getCapsuleBySlug()`)
- Supabase 리뷰/게시글/댓글 데이터 모델
- Zod 입력 스키마 (`reviewSchema`, `postSchema`, `commentSchema`)
- 기술 스택 전체

---

## 기술 스택 (변경 없음)

### 프론트엔드 프레임워크

- **Next.js 16** (App Router) — ISR을 통한 노션 CMS 캐싱
- **TypeScript 5.6+** — 타입 안전성 보장
- **React 19** — UI 라이브러리

### 스타일링 & UI

- **TailwindCSS v4** — 유틸리티 CSS 프레임워크
- **shadcn/ui** — 고품질 React 컴포넌트
- **Lucide React** — 아이콘 라이브러리

### 폼 & 검증

- **React Hook Form 7.x** — 폼 상태 관리
- **Zod** — 스키마 검증

### 데이터 패칭 (v2에서 역할 확대)

- **React Query v5** — `useInfiniteQuery`를 활용한 무한 스크롤(F021) 및 더보기(F022) 구현

### 외부 서비스

- **Notion API** — 캡슐 전체 조회 `getAllCapsules()` 신규 함수 추가
- **Supabase** — `capsule_review_stats` 뷰 기반 Top 5 조회, 커서 기반 페이지네이션 쿼리
- **Cloudflare Turnstile** — 기존과 동일

### 패키지 관리 & 배포

- **pnpm** — 패키지 관리
- **Vercel** — 배포 (ISR 유지)
