# 캡슐 커피 커뮤니티 MVP - 프로젝트 초기화 계획

## Context

현재 `frontend/`는 Spring Boot + Docker + nginx 풀스택 스타터킷 상태. PRD의 캡슐 커피 커뮤니티는 노션 CMS + Supabase + Vercel 아키텍처를 사용하므로 스타터킷의 상당 부분을 제거하고 PRD에 맞게 재구성해야 함.

## 사용자 결정 사항
- **URL 패턴**: `/brands/[slug]` + `/capsules/[capsuleSlug]` 분리 구조
- **다크모드**: 유지 (theme-provider, theme-toggle 활용)
- **기존 의존성**: 유지 (불필요 패키지 제거하지 않음)

---

## Phase 1: 보일러플레이트 정리 (-22개 파일)

### 제거 대상
- `app/(main)/docs/page.tsx` - Spring Boot/Docker 문서
- `app/(main)/examples/page.tsx` - 스타터킷 데모 갤러리
- `app/(main)/status/page.tsx` - Spring Boot 헬스체크
- `components/docs/*` (3개) - docs 전용
- `components/examples/*` (9개) - examples 전용
- `components/status/*` (3개) - status 전용
- `components/home/*` (4개) - 스타터킷 랜딩 콘텐츠
- `components/ui/code-block.tsx` - docs 전용
- `components/ui/resizable.tsx` - examples 전용
- `lib/api.ts` - Spring Boot 전용 API → 재작성

### 의존성
- 기존 패키지는 유지 (향후 활용 가능성)

---

## Phase 2: 기반 설정 (~5개 파일)

- `next.config.ts` - `output: "standalone"` 제거, 이미지 도메인 추가
- `app/layout.tsx` - 메타데이터 → "캡슐 커피 커뮤니티"
- `.env.local.example` 생성 (Notion, Supabase, Turnstile 키)
- 의존성 설치: `@notionhq/client`, `@supabase/supabase-js`

---

## Phase 3: 타입 & 인프라 (~10개 파일)

### 타입 정의
```
types/
  brand.ts        # Brand 노션 모델
  capsule.ts      # Capsule 노션 모델
  review.ts       # Review Supabase 모델
  post.ts         # Post Supabase 모델
  comment.ts      # Comment Supabase 모델
  index.ts        # 배럴 export
```

### 라이브러리
```
lib/
  notion.ts       # @notionhq/client 래퍼 (ISR 캐싱)
  supabase.ts     # Supabase 서버/브라우저 클라이언트
  api.ts          # 프론트엔드 fetch 함수들
  validations.ts  # Zod 스키마 (리뷰, 게시글, 댓글)
```

---

## Phase 4: 레이아웃 업데이트 (~3개 파일)

- `components/layout/navbar.tsx` - 홈/브랜드 탐색/커뮤니티/검색 메뉴
- `components/layout/footer.tsx` - 텍스트 변경
- `globals.css` - sidebar CSS 변수 정리

---

## Phase 5: API Routes (~4개 파일)

```
app/api/
  reviews/route.ts                    # POST/GET: 리뷰 CRUD
  posts/route.ts                      # POST/GET: 게시글 CRUD
  posts/[postId]/comments/route.ts    # POST/GET: 댓글 CRUD
  turnstile/route.ts                  # POST: CAPTCHA 검증
```

---

## Phase 6: 페이지 & 컴포넌트 (~24개 파일)

### 라우트 구조
```
app/(main)/
  page.tsx                            # 홈 (브랜드 카드 + 인기 게시글)
  brands/
    page.tsx                          # 브랜드 목록
    [brandSlug]/
      page.tsx                        # 캡슐 목록 (브랜드별)
  capsules/
    [capsuleSlug]/
      page.tsx                        # 캡슐 상세 + 리뷰
  community/
    page.tsx                          # 게시글 목록
    write/
      page.tsx                        # 게시글 작성
    [postId]/
      page.tsx                        # 게시글 상세 + 댓글
```

### 컴포넌트
```
components/
  brand/       brand-card.tsx, brand-grid.tsx
  capsule/     capsule-card.tsx, capsule-grid.tsx, capsule-detail.tsx,
               capsule-search.tsx, intensity-filter.tsx
  review/      review-list.tsx, review-form.tsx, star-rating.tsx
  community/   post-list.tsx, post-card.tsx, post-form.tsx,
               comment-list.tsx, comment-form.tsx
  home/        hero-section.tsx, brand-showcase.tsx, popular-posts.tsx
```

---

## Phase 7: 마무리 (~5개 파일)

- 에러 경계 (error.tsx, not-found.tsx)
- 빌드 검증 (`pnpm build`)
- CLAUDE.md 업데이트

---

## 유지 대상

- `components/ui/*` (~28개 shadcn 컴포넌트) - PRD 기능에 필요
- `components/layout/page-header.tsx` - 재사용 가능
- `components/layout/theme-provider.tsx`, `theme-toggle.tsx` - 다크모드
- `lib/query-provider.tsx` - React Query 설정
- `lib/utils.ts` - cn() 유틸리티

---

## 검증 방법

1. `pnpm build` 성공 확인
2. `pnpm dev`로 모든 페이지 라우트 접근 확인
3. TypeScript 에러 없음 확인
