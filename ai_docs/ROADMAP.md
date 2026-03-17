# ROADMAP.md

## 프로젝트 개요

캡슐 커피 커뮤니티 v2 고도화 프로젝트. MVP v1이 완성된 상태에서 3가지 신규 기능을 추가하여 사용자 경험을 개선한다.

- **F020**: 홈 페이지에 쿠팡 평점 / 서비스 평점 Top 5 캡슐 랭킹 비교 섹션 추가
- **F021**: 커뮤니티 게시글 목록을 커서 기반 무한 스크롤로 전환
- **F022**: 캡슐 리뷰 목록을 커서 기반 "더보기" 버튼 점진적 로딩으로 전환

**기술 스택**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, React Query v5, Notion API, Supabase, Vercel

## 현재 상태 (Current State)

- MVP v1 모든 기능(F001~F012) 구현 완료 및 프로덕션 배포 상태
- Notion CMS 연동 완료 (브랜드/캡슐 데이터)
- Supabase CRUD 연동 완료 (리뷰, 게시글, 댓글)
- Cloudflare Turnstile 위젯 연동 완료
- `capsule_review_stats` Supabase 뷰 존재 (`capsule_slug`, `avg_rating`, `review_count`)
- API 라우트(`GET /api/posts`, `GET /api/reviews`)는 전체 데이터를 일괄 반환하는 방식
- `mapRowToPost()`가 `app/(main)/page.tsx`와 `app/(main)/community/page.tsx`에 각각 인라인으로 중복 정의됨
- `mapRowToReview()`가 `components/review/review-list.tsx`에 인라인으로 정의됨
- `review-form.tsx`에서 리뷰 작성 성공 후 `router.refresh()` 호출 중 (line 71)
- `getAllCapsules()` 함수 미존재 (`getCapsulesByBrandId()`, `getCapsuleBySlug()`만 존재)

## 목표 상태 (Target State)

- 홈 페이지에 쿠팡 평점 Top 5 / 서비스 평점 Top 5를 좌우 비교 표시
- 커뮤니티 게시글 목록이 무한 스크롤로 10개씩 점진적 로드
- 캡슐 리뷰 목록이 "더보기" 버튼으로 5개씩 점진적 로드
- 공통 매퍼 함수(`mapRowToPost`, `mapRowToReview`)가 `lib/mappers.ts`로 추출되어 서버 컴포넌트와 API 라우트에서 재사용
- `PaginatedResponse<T>` 공통 타입으로 API 응답 형식 통일

---

## 마일스톤 (Milestones)

### M1: 공통 인프라 (Common Infrastructure)

**기간:** 0.5일
**목표:** v2 기능 구현에 필요한 공통 타입과 유틸리티 함수를 사전 준비
**완료 기준:** `PaginatedResponse<T>` 타입이 export 되고, `mapRowToPost()` / `mapRowToReview()`가 `lib/mappers.ts`에서 정상 동작하며, 기존 코드의 인라인 매퍼를 교체해도 빌드 성공

#### Tasks

- [x] **[M1-01]** `PaginatedResponse<T>` 타입 정의
  - 파일: `frontend/types/index.ts`
  - 예상 시간: 15m
  - 의존성: 없음
  - 완료 기준: `PaginatedResponse<T>` 인터페이스가 `{ data: T[]; nextCursor: string | null; hasMore: boolean }` 형태로 export 됨

- [x] **[M1-02]** `lib/mappers.ts` 생성 및 매퍼 함수 추출
  - 파일: `frontend/lib/mappers.ts` (신규)
  - 예상 시간: 30m
  - 의존성: 없음
  - 완료 기준:
    - `mapRowToPost(row: PostRow): Post` 함수가 export 됨
    - `mapRowToReview(row: ReviewRow): Review` 함수가 export 됨
    - `PostRow`, `ReviewRow` 인터페이스가 export 됨

- [x] **[M1-03]** 기존 인라인 매퍼를 `lib/mappers.ts` import로 교체
  - 파일: `frontend/app/(main)/page.tsx`, `frontend/app/(main)/community/page.tsx`, `frontend/components/review/review-list.tsx`
  - 예상 시간: 20m
  - 의존성: M1-02
  - 완료 기준: 3개 파일에서 인라인 `PostRow`/`ReviewRow` 인터페이스와 `mapRowToPost`/`mapRowToReview` 함수가 제거되고, `lib/mappers.ts`에서 import하여 동일하게 동작. `npm run build` 성공

#### 위험 요소 (Risks)

- 없음. 순수 리팩토링 작업으로 동작 변경 없음.

---

### M2: F020 캡슐 Top 5 랭킹

**기간:** 1일
**목표:** 홈 페이지에 쿠팡 평점 Top 5 / 서비스 평점 Top 5 좌우 비교 섹션 추가
**완료 기준:** 홈 페이지에서 쿠팡 평점 Top 5와 서비스 평점 Top 5가 나란히 표시되고, 각 항목 클릭 시 캡슐 상세 페이지로 이동

#### Tasks

- [x] **[M2-01]** `getAllCapsules()` 함수 구현
  - 파일: `frontend/lib/notion.ts`
  - 예상 시간: 1.5h
  - 의존성: 없음
  - 완료 기준:
    - Notion API 페이지네이션(`has_more` + `next_cursor`) 반복 조회로 전체 캡슐 반환
    - `getBrands()` 1회 호출 후 `Map<brandId, Brand>`로 캐싱하여 N+1 방지
    - 기존 `mapNotionPageToCapsule()` 재사용
    - 브랜드 정보 없는 캡슐은 빈 문자열로 처리

- [x] **[M2-02]** `TopCapsules` 서버 컴포넌트 구현
  - 파일: `frontend/components/home/top-capsules.tsx` (신규)
  - 예상 시간: 2h
  - 의존성: M2-01
  - 완료 기준:
    - 서버 컴포넌트(async)로 구현
    - `getAllCapsules()`와 Supabase `capsule_review_stats` 뷰를 `Promise.all`로 병렬 조회
    - 좌측: 쿠팡 평점 Top 5 (coupangRating DESC, null 제외)
    - 우측: 서비스 평점 Top 5 (review_count >= 5, avg_rating DESC)
    - 서비스 Top 5가 0개이면 "아직 충분한 리뷰가 없습니다" 안내 문구 표시
    - 데스크톱 2열 그리드 / 모바일 1열 스택
    - 각 항목에 순위, 캡슐 썸네일, 캡슐명, 브랜드명, 평점 표시
    - 항목 클릭 시 `/capsules/[capsuleSlug]`로 이동
    - Notion 조회 실패 시 쿠팡 Top 5 열 숨김, Supabase 조회 실패 시 서비스 Top 5 열 숨김

- [x] **[M2-03]** 홈 페이지에 `TopCapsules` 컴포넌트 삽입
  - 파일: `frontend/app/(main)/page.tsx`
  - 예상 시간: 15m
  - 의존성: M2-02
  - 완료 기준: `BrandShowcase` 아래, `PopularPosts` 위에 `TopCapsules` 렌더링. 기존 ISR `revalidate = 3600` 유지

#### 위험 요소 (Risks)

- Risk 1: Notion 캡슐 데이터가 100건 이상일 경우 페이지네이션 반복 조회 시간 증가.
  - 완화: ISR 3600초 캐싱으로 실시간 영향 최소화. 홈 페이지 전체가 캐싱되므로 사용자 체감 없음.
- Risk 2: `capsule_review_stats` 뷰에서 `review_count >= 5` 조건을 충족하는 캡슐이 0개일 수 있음.
  - 완화: 빈 상태 UI 구현 (PRD 명세 대로 안내 문구 표시).

---

### M3: F021 게시글 무한 스크롤

**기간:** 1일
**목표:** 커뮤니티 게시글 목록을 커서 기반 무한 스크롤로 전환
**완료 기준:** 커뮤니티 목록 페이지에서 첫 10개가 SSR로 렌더링되고, 스크롤 하단 도달 시 자동으로 다음 10개가 로드되며, 카테고리 탭 전환 시 첫 페이지부터 재조회

#### Tasks

- [x] **[M3-01]** `GET /api/posts` 커서 기반 페이지네이션 로직 추가
  - 파일: `frontend/app/api/posts/route.ts`
  - 예상 시간: 1h
  - 의존성: M1-01, M1-02
  - 완료 기준:
    - `cursor`, `limit` 쿼리 파라미터 처리
    - `cursor` 있으면 `WHERE created_at < cursor` 조건 추가
    - N+1 패턴으로 `hasMore` 판별 (`limit + 1`개 조회)
    - `mapRowToPost()`로 camelCase 변환 후 `PaginatedResponse<Post>` 형식 반환
    - `cursor` 없으면 첫 페이지 반환 (하위 호환)

- [x] **[M3-02]** `lib/api.ts`의 `getPosts()` 시그니처 변경
  - 파일: `frontend/lib/api.ts`
  - 예상 시간: 20m
  - 의존성: M1-01
  - 완료 기준:
    - `getPosts(params?: { category?: string; cursor?: string; limit?: number }): Promise<PaginatedResponse<Post>>` 시그니처로 변경
    - 쿼리 파라미터를 URL에 올바르게 추가

- [x] **[M3-03]** `PostListInfinite` 클라이언트 컴포넌트 구현
  - 파일: `frontend/components/community/post-list-infinite.tsx` (신규)
  - 예상 시간: 2h
  - 의존성: M3-01, M3-02
  - 완료 기준:
    - `'use client'` 클라이언트 컴포넌트
    - `useInfiniteQuery` 사용, 쿼리 키: `['posts', category]`
    - `initialData` props로 서버 초기 데이터 수신
    - `IntersectionObserver`로 하단 감지 시 `fetchNextPage()` 호출
    - 로딩 중 스켈레톤 카드 3개 표시
    - `hasMore: false` 시 "모든 게시글을 확인했습니다" 문구 표시
    - 카테고리 전환 시 캐시 분리 및 첫 페이지부터 재조회

- [x] **[M3-04]** 커뮤니티 목록 페이지 하이브리드 렌더링 적용
  - 파일: `frontend/app/(main)/community/page.tsx`
  - 예상 시간: 30m
  - 의존성: M3-01, M3-03
  - 완료 기준:
    - 서버에서 첫 10개만 Supabase 직접 조회 (`limit + 1` 패턴으로 hasMore 판별)
    - `PostListInfinite`에 `initialData` 전달
    - 인라인 `mapRowToPost` 제거 확인 (M1-03에서 이미 처리)
    - 기존 ISR `revalidate = 60` 유지

#### 위험 요소 (Risks)

- Risk 1: `created_at` 커서 기반이므로 동일 시각 게시글 간 순서 누락 가능성.
  - 완화: PRD에서 MVP v2 범위 내 허용으로 명시. 향후 복합 커서(`created_at` + `id`)로 개선 가능.

---

### M4: F022 리뷰 더보기 로딩

**기간:** 1일
**목표:** 캡슐 리뷰 목록을 커서 기반 "더보기" 버튼 점진적 로딩으로 전환
**완료 기준:** 캡슐 상세 페이지에서 첫 5개 리뷰가 SSR로 렌더링되고, "더보기" 버튼 클릭 시 5개씩 추가 로드되며, 리뷰 작성 후 목록이 갱신됨

#### Tasks

- [x] **[M4-01]** `GET /api/reviews` 커서 기반 페이지네이션 로직 추가
  - 파일: `frontend/app/api/reviews/route.ts`
  - 예상 시간: 1h
  - 의존성: M1-01, M1-02
  - 완료 기준:
    - `cursor`, `limit` 쿼리 파라미터 처리 (기본 limit: 5, 최대 20)
    - `cursor` 있으면 `WHERE created_at < cursor` 조건 추가
    - N+1 패턴으로 `hasMore` 판별
    - `mapRowToReview()`로 camelCase 변환 후 `PaginatedResponse<Review>` 형식 반환
    - `cursor` 없으면 첫 페이지 반환 (하위 호환)

- [x] **[M4-02]** `lib/api.ts`의 `getReviews()` 시그니처 변경
  - 파일: `frontend/lib/api.ts`
  - 예상 시간: 20m
  - 의존성: M1-01
  - 완료 기준:
    - `getReviews(capsuleSlug: string, params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<Review>>` 시그니처로 변경

- [x] **[M4-03]** `ReviewListInfinite` 클라이언트 컴포넌트 구현
  - 파일: `frontend/components/review/review-list-infinite.tsx` (신규)
  - 예상 시간: 1.5h
  - 의존성: M4-01, M4-02
  - 완료 기준:
    - `'use client'` 클라이언트 컴포넌트
    - `useInfiniteQuery` 사용, 쿼리 키: `['reviews', capsuleSlug]`
    - `initialData` props로 서버 초기 데이터 수신
    - "더보기" 버튼 클릭 시 `fetchNextPage()` 호출
    - 로딩 중 버튼 비활성화 + 스피너 표시
    - `hasMore: false` 시 버튼 숨김
    - 리뷰 작성 성공 시 `queryClient.invalidateQueries(['reviews', capsuleSlug])` 호출

- [x] **[M4-04]** `review-form.tsx` onSuccess 콜백 방식 변경
  - 파일: `frontend/components/review/review-form.tsx`
  - 예상 시간: 15m
  - 의존성: 없음
  - 완료 기준:
    - line 71의 `router.refresh()` 호출 제거
    - 기존 `onSuccess` prop 콜백만 호출하도록 변경 (`onSuccess?.()` 유지)
    - `useRouter` import와 `router` 변수가 더 이상 필요 없으면 제거

- [x] **[M4-05]** 캡슐 상세 페이지 하이브리드 렌더링 적용
  - 파일: `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`
  - 예상 시간: 30m
  - 의존성: M4-01, M4-03, M4-04
  - 완료 기준:
    - 서버에서 리뷰 첫 5개를 Supabase 직접 조회 (N+1 패턴)
    - `ReviewListInfinite`에 `initialData` 및 `capsuleSlug` 전달
    - `ReviewForm`의 `onSuccess`를 `ReviewListInfinite` 내부에서 `queryClient.invalidateQueries`로 연결
    - 기존 Suspense 경계 구조 유지
    - 기존 ISR `revalidate = 3600` 유지

#### 위험 요소 (Risks)

- Risk 1: `ReviewListInfinite`와 `ReviewForm`이 서로 다른 클라이언트 컴포넌트이므로 `queryClient` 공유 방식 설계 필요.
  - 완화: `ReviewListInfinite` 내부에서 `ReviewForm`을 렌더링하고, `onSuccess` 콜백으로 `invalidateQueries` 호출.

---

## 파일 변경 영향도 요약

### 신규 파일

| 파일 | 마일스톤 | 설명 |
|------|---------|------|
| `frontend/lib/mappers.ts` | M1 | `mapRowToPost()`, `mapRowToReview()` 공통 매퍼 |
| `frontend/components/home/top-capsules.tsx` | M2 | 홈 페이지 Top 5 랭킹 서버 컴포넌트 |
| `frontend/components/community/post-list-infinite.tsx` | M3 | 무한 스크롤 게시글 목록 클라이언트 컴포넌트 |
| `frontend/components/review/review-list-infinite.tsx` | M4 | 더보기 리뷰 목록 클라이언트 컴포넌트 |

### 수정 파일

| 파일 | 마일스톤 | 변경 내용 |
|------|---------|---------|
| `frontend/types/index.ts` | M1 | `PaginatedResponse<T>` 타입 추가 |
| `frontend/app/(main)/page.tsx` | M1, M2 | 인라인 매퍼 제거 + `TopCapsules` 삽입 |
| `frontend/app/(main)/community/page.tsx` | M1, M3 | 인라인 매퍼 제거 + 첫 페이지만 조회 + `PostListInfinite` 전달 |
| `frontend/components/review/review-list.tsx` | M1 | 인라인 매퍼 제거 (서버 초기 렌더 역할 유지) |
| `frontend/lib/notion.ts` | M2 | `getAllCapsules()` 함수 추가 |
| `frontend/lib/api.ts` | M3, M4 | `getPosts()`, `getReviews()` 시그니처 변경 |
| `frontend/app/api/posts/route.ts` | M3 | 커서 기반 페이지네이션 로직 추가 |
| `frontend/app/api/reviews/route.ts` | M4 | 커서 기반 페이지네이션 로직 추가 |
| `frontend/components/review/review-form.tsx` | M4 | `router.refresh()` 제거, `onSuccess` 콜백 전용으로 변경 |
| `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` | M4 | 리뷰 첫 페이지 서버 조회 + `ReviewListInfinite`에 `initialData` 전달 |

### 변경 없는 파일

| 파일 | 이유 |
|------|------|
| `frontend/app/api/posts/[postId]/comments/route.ts` | 댓글 페이지네이션 미적용 |
| `frontend/lib/supabase.ts` | 기존 함수 유지, Top 5는 별도 쿼리 사용 |
| `frontend/lib/validations.ts` | 입력 스키마 변경 없음 |
| `frontend/components/community/post-list.tsx` | 서버 초기 렌더링 역할 유지 |
| `frontend/components/review/review-list.tsx` | 서버 초기 렌더링 역할 유지 (인라인 매퍼 제거만) |

---

## 성공 지표 (Success Metrics)

| 지표 | 측정 방법 |
|------|---------|
| 홈 페이지 Top 5 정상 표시 | 쿠팡 평점 Top 5, 서비스 평점 Top 5 모두 렌더링 확인 |
| 게시글 무한 스크롤 동작 | 스크롤 하단 도달 시 추가 10개 로드, 카테고리 전환 시 리셋 확인 |
| 리뷰 더보기 동작 | "더보기" 클릭 시 5개 추가 로드, 전체 로드 후 버튼 숨김 확인 |
| 리뷰 작성 후 목록 갱신 | 리뷰 제출 후 캐시 무효화로 새 리뷰가 목록 상단에 반영 확인 |
| 빌드 성공 | `npm run build` 에러 없이 완료 |
| 하위 호환 | 기존 F001~F012 기능이 v2 변경 후에도 정상 동작 |

---

## 변경 이력 (Changelog)

| 날짜       | 버전  | 변경 내용        | 작성자               |
| ---------- | ----- | ---------------- | -------------------- |
| 2026-03-17 | 2.1.0 | M1~M4 전체 태스크 완료 체크 (코드 검증 통과) | docs:update-roadmap skill |
| 2026-03-16 | 2.0.0 | v2 로드맵 생성 (F020, F021, F022) | prd-to-roadmap agent |
