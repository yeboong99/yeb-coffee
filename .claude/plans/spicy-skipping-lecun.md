# PRD v2 작성 계획: 평점 랭킹 + 페이지네이션

## Context

MVP가 완성된 캡슐 커피 커뮤니티 서비스에 두 가지 고도화 기능을 추가하기 위한 PRD 문서를 작성한다.
기존 PRD는 `ai_docs/PRD_v1.md`에 보존되며, 새 PRD는 `ai_docs/PRD.md`에 생성한다.

## 실행 단계

### Step 1: prd-generator 에이전트로 PRD 작성
`ai_docs/PRD.md` 파일을 생성한다. 아래 컨텍스트를 모두 전달하여 개발 로드맵으로 원활하게 변환 가능한 수준의 PRD를 작성한다.

### Step 2: 생성된 PRD 검토 및 수정
기존 코드베이스와의 정합성을 확인하고 필요시 수정한다.

---

## prd-generator에 전달할 컨텍스트

### 프로젝트 배경
- 캡슐 커피 커뮤니티 서비스 (네스프레소, 돌체구스토, 버츄오)
- 기술 스택: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, React Query v5
- 외부 서비스: Notion CMS (브랜드/캡슐), Supabase (리뷰/게시글/댓글), Cloudflare Turnstile
- 배포: Vercel, ISR 캐싱 적용 중

### 기능 1: 평균 평점 집계 + 인기 캡슐 Top 5 랭킹

**요구사항:**
- 홈 페이지에 "캡슐 Top 5" 섹션 추가
- 섹션 위치: **BrandShowcase 아래, PopularPosts 위**
- 좌측: 쿠팡 평점 기준 Top 5 (Notion DB에서 가져옴)
- 우측: yeb coffee 서비스 평점 기준 Top 5 (Supabase 리뷰 기반)
- "현재 데이터상 Top 5" — 기간 기반이 아닌 전체 데이터 기준
- 서비스 Top 5 최소 리뷰 수 기준: **5개 이상** (신뢰도 확보)

**현재 코드 상태:**
- `Capsule` 타입에 `coupangRating: number | null` 필드 존재 (`frontend/types/capsule.ts`)
- Notion `mapNotionPageToCapsule()`에서 'AverageRating' 프로퍼티를 `coupangRating`으로 매핑 (`frontend/lib/notion.ts`)
- `capsule_review_stats` Supabase 뷰 존재
- `getServiceRating()`, `getServiceRatings()` 함수 구현됨 (`frontend/lib/supabase.ts`)
- **`getAllCapsules()` 함수 없음** — 현재 `getCapsulesByBrandId()`만 존재, 전체 캡슐 조회 함수 신규 필요
- 홈 페이지 구성: `HeroSection` → `BrandShowcase`(3개) → `PopularPosts`(5개) (`frontend/app/(main)/page.tsx`)

**기술 결정사항:**
- 쿠팡 Top5: `getAllCapsules()` 신규 함수 → `coupangRating` DESC 정렬 → 상위 5개
- 서비스 Top5: `capsule_review_stats` 뷰에서 `review_count >= 5` + `avg_rating DESC` + `limit(5)` → Notion 캡슐과 slug 기반 조인
- 신규 컴포넌트: `components/home/top-capsules.tsx` (서버 컴포넌트)
- ISR revalidate: 3600 유지

### 기능 2: 무한 스크롤 + 페이지네이션

**요구사항:**
- 커뮤니티 게시글: 커서 기반 무한 스크롤
- 리뷰: "더보기" 버튼 방식 점진적 로딩
- 백엔드 주도 페이지네이션: API가 정렬된 데이터를 페이지 단위로 반환
- 댓글: 페이지네이션 미적용 (전체 로드 유지)

**현재 코드 상태:**
- 모든 API(reviews, posts, comments)에 페이지네이션 없음 — 전체 데이터 반환
- `GET /api/reviews`: capsuleSlug 필터, created_at DESC 정렬 (`frontend/app/api/reviews/route.ts`)
- `GET /api/posts`: category 필터, created_at DESC 정렬 (`frontend/app/api/posts/route.ts`)
- 프론트엔드 fetch 함수: `getReviews()`, `getPosts()` 모두 전체 배열 반환 (`frontend/lib/api.ts`)
- 커뮤니티 페이지: 서버 컴포넌트, ISR 60초 (`frontend/app/(main)/community/page.tsx`)
- 리뷰 목록: `ReviewList` 서버 컴포넌트, Suspense 경계 사용

**기술 결정사항:**
- 페이지당 개수: 게시글 10개, 리뷰 5개
- API 응답 형식: `{ data: T[], nextCursor: string | null, hasMore: boolean }`
- 커서: `created_at` 기반 (N+1 패턴으로 hasMore 판별)
- 하이브리드 렌더링: 서버에서 초기 데이터 렌더링 + 클라이언트에서 추가 로딩 (React Query `useInfiniteQuery`)
- 하위 호환성: cursor 파라미터 없으면 첫 페이지 반환

---

## 검증 방법
- `ai_docs/PRD.md` 파일이 정상 생성되었는지 확인
- 두 기능 모두 포함되었는지 확인
- 기술 스펙이 현재 코드베이스와 일관성 있는지 확인
- 로드맵 변환에 충분한 태스크 분해 가능한 수준의 명확성 확인
