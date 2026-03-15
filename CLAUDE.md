# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 사용 언어 설정

- 기본 응답 언어: 한국어(존댓말 사용)
- 코드 주석: 한국어
- 커밋 메시지: 한국어로 작성
- 문서화: 한국어로 작성 (IMPORTANT)
- 변수명/함수명: 영어, camelCase (코드 표준 준수)

## 개발 문서 참고

- PRD 문서 파일 위치: ai_docs/PRD.md
- 개발 로드맵 파일 위치: ai_docs/ROADMAP.md

## TaskMasterAi

- taskmasterai를 사용 중이라면 task의 현재 상태를 항상 최신화

---

## 프로젝트 개요

**캡슐 커피 커뮤니티** - 네스프레소, 돌체구스토, 버츄오 캡슐 정보 및 리뷰 커뮤니티.

- CMS: Notion API (브랜드, 캡슐 데이터)
- DB: Supabase (리뷰, 게시글, 댓글)
- 배포: Vercel
- 스팸 방지: Cloudflare Turnstile

## 기술 스택

- **프론트엔드:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, React Query v5, pnpm
- **외부 서비스:** @notionhq/client, @supabase/supabase-js, zod

## 프론트엔드 구조

`frontend/` 디렉토리가 프로젝트 루트입니다.

### 라우트 구조

```
app/(main)/
  page.tsx                          # 홈 (브랜드 쇼케이스 + 인기 게시글)
  brands/
    page.tsx                        # 브랜드 목록
    [brandSlug]/page.tsx            # 브랜드별 캡슐 목록
  capsules/
    [capsuleSlug]/page.tsx          # 캡슐 상세 + 리뷰
  community/
    page.tsx                        # 게시글 목록 (카테고리 탭)
    write/page.tsx                  # 게시글 작성
    [postId]/page.tsx               # 게시글 상세 + 댓글
  error.tsx                         # 에러 경계
  not-found.tsx                     # 404 페이지
app/api/
  reviews/route.ts                  # GET/POST 리뷰
  posts/route.ts                    # GET/POST 게시글
  posts/[postId]/comments/route.ts  # GET/POST 댓글
  turnstile/route.ts                # Turnstile 검증
```

### 컴포넌트 구조

```
components/
  home/       - hero-section, brand-showcase, popular-posts
  brand/      - brand-card, brand-grid
  capsule/    - capsule-card, capsule-grid, capsule-detail, capsule-search, intensity-filter
  review/     - review-list, review-form, star-rating
  community/  - post-card, post-list, post-form, comment-list, comment-form
  layout/     - navbar, footer, page-header, theme-provider, theme-toggle
  ui/         - shadcn 컴포넌트들
```

### 라이브러리

```
lib/
  notion.ts       - Notion 클라이언트 + DB ID 상수
  supabase.ts     - 브라우저/서버 Supabase 클라이언트
  api.ts          - 프론트엔드 fetch 함수 (reviews, posts, comments)
  validations.ts  - Zod 스키마 (reviewSchema, postSchema, commentSchema)
  query-provider.tsx - React Query 설정
  utils.ts        - cn() 유틸리티
types/
  brand.ts, capsule.ts, review.ts, post.ts, comment.ts, index.ts
```

## 환경 변수

`.env.local.example` 참고. 필수 변수:

```
NOTION_API_KEY, NOTION_BRAND_DATABASE_ID, NOTION_CAPSULE_DATABASE_ID
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
NEXT_PUBLIC_BASE_URL
```

## 주요 설정 파일

- `frontend/next.config.ts` - 이미지 도메인: notion.so, s3.us-west-2.amazonaws.com
- `frontend/package.json` - 의존성 및 스크립트

## 로컬 개발

```bash
cd frontend
pnpm install   # 또는 npm install
pnpm dev       # 또는 npm run dev
```

## 현재 상태 (MVP 초기화 완료)

- 모든 페이지는 placeholder 데이터로 구현됨
- 다음 단계: Notion CMS 연동 (브랜드/캡슐 실데이터), Supabase 테이블 생성 후 API 라우트 연동
- TODO: Cloudflare Turnstile 위젯 연동 (현재 "dev-bypass" 토큰 사용 중)

## 프론트엔드 작업 완료 체크리스트

```bash
npm run check-all    # 모든 검사 통과 확인
npm run build        # 빌드 성공 확인
```
