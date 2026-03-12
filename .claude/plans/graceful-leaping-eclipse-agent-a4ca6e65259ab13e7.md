# 캡슐 커피 커뮤니티 MVP - 프로젝트 초기화 계획

## 분석 결과

### 현재 상태: Spring Boot + Next.js 풀스택 스타터킷
스타터킷은 원래 Spring Boot 백엔드 + Docker + nginx 구성을 위해 만들어졌으나,
이 프로젝트는 **노션 CMS + Supabase + Vercel 배포**로 완전히 다른 아키텍처를 사용합니다.

### 파일 분류

#### 제거 대상 (스타터킷 보일러플레이트 - 프로젝트와 무관)

**라우트:**
- `app/(main)/docs/page.tsx` - Spring Boot/Docker 문서 페이지
- `app/(main)/examples/page.tsx` - 스타터킷 예제 갤러리 페이지
- `app/(main)/status/page.tsx` - Spring Boot 백엔드 헬스체크 페이지

**컴포넌트 - docs/ (전체 삭제):**
- `components/docs/copyable-code.tsx`
- `components/docs/doc-section.tsx`
- `components/docs/doc-sidebar.tsx`

**컴포넌트 - examples/ (전체 삭제):**
- `components/examples/demos/component-showcase.tsx`
- `components/examples/demos/data-fetching-example.tsx`
- `components/examples/demos/date-formatting-example.tsx`
- `components/examples/demos/form-example.tsx`
- `components/examples/demos/hooks-example.tsx`
- `components/examples/demos/layout-example.tsx`
- `components/examples/demos/server-client-example.tsx`
- `components/examples/example-card.tsx`
- `components/examples/example-modal.tsx`

**컴포넌트 - status/ (전체 삭제):**
- `components/status/connection-test.tsx`
- `components/status/status-banner.tsx`
- `components/status/status-card.tsx`

**컴포넌트 - home/ (전체 삭제 후 프로젝트용으로 재작성):**
- `components/home/hero-section.tsx` - "Spring Boot + Next.js" 스타터킷 히어로
- `components/home/tech-stack-grid.tsx` - 스타터킷 기술 스택 그리드
- `components/home/quick-start.tsx` - Docker 명령어 퀵스타트
- `components/home/feature-highlights.tsx` - 스타터킷 기능 소개

**lib:**
- `lib/api.ts` - `/api/health`, `/api/status` (Spring Boot 전용) -> 완전 재작성

#### 수정 대상

- `app/layout.tsx` - 메타데이터 변경 ("Web Starter Kit" -> 캡슐 커피 커뮤니티)
- `app/(main)/layout.tsx` - 유지, 구조 좋음
- `app/(main)/page.tsx` - 홈페이지 내용 교체
- `components/layout/navbar.tsx` - 네비게이션 링크 변경 (홈, 브랜드, 커뮤니티, 검색)
- `components/layout/footer.tsx` - 텍스트 변경
- `components/layout/page-header.tsx` - 유지 (재사용 가능한 좋은 패턴)
- `next.config.ts` - `output: "standalone"` 제거 (Vercel 배포), 이미지 도메인 추가
- `lib/query-provider.tsx` - 유지 (구조 좋음)
- `lib/utils.ts` - 유지
- `globals.css` - sidebar 관련 변수 정리 (불필요)

#### 유지 대상

- `components/ui/*` - shadcn/ui 컴포넌트 전체 유지 (Card, Dialog, Badge 등 PRD에서 필요)
- `components/layout/theme-provider.tsx` - 다크모드 지원
- `components/layout/theme-toggle.tsx` - 다크모드 토글
- `tsconfig.json` - 좋은 설정 상태
- `package.json` - 기존 의존성 대부분 유지, 새 의존성 추가 필요

#### 신규 생성 대상

**라우트 (PRD 기반):**
- `app/(main)/brands/page.tsx` - 브랜드 목록 페이지
- `app/(main)/brands/[brandSlug]/page.tsx` - 캡슐 목록 페이지 (브랜드별)
- `app/(main)/capsules/[capsuleSlug]/page.tsx` - 캡슐 상세 페이지
- `app/(main)/community/page.tsx` - 커뮤니티 목록 페이지
- `app/(main)/community/write/page.tsx` - 게시글 작성 페이지
- `app/(main)/community/[postId]/page.tsx` - 게시글 상세 페이지

**API Routes (Route Handlers):**
- `app/api/reviews/route.ts` - 리뷰 CRUD
- `app/api/posts/route.ts` - 게시글 CRUD
- `app/api/posts/[postId]/comments/route.ts` - 댓글 CRUD
- `app/api/turnstile/route.ts` - Cloudflare Turnstile 검증

**lib (핵심 인프라):**
- `lib/notion.ts` - 노션 API 클라이언트 (브랜드/캡슐 조회)
- `lib/supabase.ts` - Supabase 클라이언트 (서버/클라이언트)
- `lib/api.ts` - 프론트엔드 API 호출 함수 (재작성)
- `lib/validations.ts` - Zod 스키마 (리뷰, 게시글, 댓글)

**types:**
- `types/brand.ts` - Brand 타입 정의
- `types/capsule.ts` - Capsule 타입 정의
- `types/review.ts` - Review 타입 정의
- `types/post.ts` - Post 타입 정의
- `types/comment.ts` - Comment 타입 정의
- `types/index.ts` - 타입 재export

**컴포넌트:**
- `components/brand/brand-card.tsx` - 브랜드 카드
- `components/brand/brand-grid.tsx` - 브랜드 그리드
- `components/capsule/capsule-card.tsx` - 캡슐 카드
- `components/capsule/capsule-grid.tsx` - 캡슐 그리드
- `components/capsule/capsule-detail.tsx` - 캡슐 상세 정보
- `components/capsule/capsule-search.tsx` - 캡슐 검색
- `components/capsule/intensity-filter.tsx` - 강도 필터
- `components/review/review-list.tsx` - 리뷰 목록
- `components/review/review-form.tsx` - 리뷰 작성 폼 (모달)
- `components/review/star-rating.tsx` - 별점 컴포넌트
- `components/community/post-list.tsx` - 게시글 목록
- `components/community/post-card.tsx` - 게시글 카드
- `components/community/post-form.tsx` - 게시글 작성 폼
- `components/community/comment-list.tsx` - 댓글 목록
- `components/community/comment-form.tsx` - 댓글 작성 폼
- `components/home/brand-showcase.tsx` - 홈 브랜드 카드 섹션
- `components/home/popular-posts.tsx` - 홈 인기 게시글 미리보기
- `components/home/hero-section.tsx` - 캡슐 커피 커뮤니티 히어로 (재작성)

**새 의존성 (pnpm install):**
- `@notionhq/client` - 노션 API
- `@supabase/supabase-js` - Supabase 클라이언트

**환경 변수:**
- `NOTION_API_KEY` - 노션 API 키
- `NOTION_BRAND_DB_ID` - 브랜드 데이터베이스 ID
- `NOTION_CAPSULE_DB_ID` - 캡슐 데이터베이스 ID
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Turnstile 사이트 키
- `TURNSTILE_SECRET_KEY` - Turnstile 시크릿 키

---

## 실행 순서

### Phase 1: 정리 (보일러플레이트 제거)
1. 스타터킷 전용 라우트 삭제 (docs, examples, status)
2. 스타터킷 전용 컴포넌트 삭제 (docs/, examples/, status/, home/)
3. `lib/api.ts` 내용 비우기
4. 사용하지 않는 shadcn/ui 컴포넌트 판별 (resizable, code-block 등)

### Phase 2: 기반 설정
5. `next.config.ts` 수정 (standalone 제거, 이미지 도메인 설정)
6. `app/layout.tsx` 메타데이터 업데이트
7. `.env.local.example` 생성
8. 새 의존성 설치 (@notionhq/client, @supabase/supabase-js)
9. `globals.css` 에서 불필요한 sidebar 변수 정리

### Phase 3: 타입 & 인프라 구축
10. `types/` 디렉토리 생성 및 타입 정의
11. `lib/notion.ts` 노션 클라이언트 작성
12. `lib/supabase.ts` Supabase 클라이언트 작성
13. `lib/validations.ts` Zod 스키마 작성
14. `lib/api.ts` 프론트엔드 API 함수 재작성

### Phase 4: 레이아웃 & 네비게이션
15. `components/layout/navbar.tsx` 네비게이션 업데이트
16. `components/layout/footer.tsx` 텍스트 업데이트
17. `app/(main)/page.tsx` 홈페이지 구조 재작성

### Phase 5: API Routes
18. `app/api/reviews/route.ts` 리뷰 API
19. `app/api/posts/route.ts` 게시글 API
20. `app/api/posts/[postId]/comments/route.ts` 댓글 API
21. `app/api/turnstile/route.ts` CAPTCHA 검증

### Phase 6: 페이지 & 컴포넌트 구축
22. 브랜드 관련 컴포넌트 + 페이지
23. 캡슐 관련 컴포넌트 + 페이지
24. 리뷰 관련 컴포넌트
25. 커뮤니티 관련 컴포넌트 + 페이지
26. 홈페이지 컴포넌트 (브랜드 쇼케이스, 인기 게시글)

### Phase 7: 마무리
27. 에러 경계 설정 (error.tsx, not-found.tsx, loading.tsx)
28. 빌드 검증 (pnpm build)
29. CLAUDE.md 업데이트
30. README.md 프로젝트 맞춤 업데이트

---

## 사용하지 않는 shadcn/ui 컴포넌트 (제거 후보)

PRD 기능에 필요 없는 컴포넌트:
- `resizable.tsx` - 리사이즈 패널 (examples 전용)
- `code-block.tsx` - 코드 블록 (docs 전용)
- `command.tsx` - 검색 기능에 활용 가능하므로 유지
- `navigation-menu.tsx` - 현재 navbar에서 직접 구현, 판단 보류
- `accordion.tsx` - FAQ나 캡슐 상세에서 활용 가능, 유지
- `collapsible.tsx` - 유지
- `switch.tsx` - 테마 토글에 유지

PRD에서 확실히 사용할 컴포넌트:
- card, dialog, badge, textarea, button, input, label, select, separator
- skeleton, tabs, tooltip, pagination, avatar, checkbox, radio-group
- dropdown-menu, sheet, scroll-area, breadcrumb, progress, table, alert, sonner
