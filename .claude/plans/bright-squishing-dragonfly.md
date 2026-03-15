# 계획: update-roadmap 커스텀 커맨드 작성

## Context

TaskMaster와 ROADMAP.md가 독립적으로 관리되다 보니 동기화가 안 된 상태입니다.
단순히 TaskMaster의 `done` 상태만 믿고 ROADMAP을 업데이트하면 안 되므로,
커맨드는 **실제 코드 파일을 직접 확인**하여 완료 여부를 검증한 후에만 체크합니다.

- **검증 통과 시**: ROADMAP.md `[ ]` → `[x]` 업데이트
- **검증 불확실 시**: 체크하지 않고 응답에 보고

## 사전 탐색으로 파악한 현재 실제 코드 상태

| ROADMAP Task | 실제 코드 확인 결과 |
|---|---|
| P2-01 (브랜드 목록 Notion 연동) | ✅ `brands/page.tsx`에서 `getBrands()` 사용 확인 |
| P2-02 (브랜드별 캡슐 목록 Notion 연동) | ✅ `[brandSlug]/page.tsx`에서 `getCapsulesByBrandId()` 사용 확인 |
| P2-03 (캡슐 상세 Notion 연동) | ✅ `[capsuleSlug]/page.tsx`에서 `getCapsuleBySlug()` 사용 확인 |
| P2-04 (홈 BrandShowcase 연동) | ✅ `app/(main)/page.tsx`에서 `getBrands()` 사용 확인 |
| P3-01 (리뷰 목록 Supabase GET) | ✅ `<ReviewList>` Suspense 연동 확인 |
| P3-04 (게시글 목록 Supabase GET) | ✅ `community/page.tsx`에서 Supabase `posts` 테이블 조회 확인 |
| P3-07 (게시글 상세 Supabase GET) | ✅ `community/[postId]/page.tsx`에서 Supabase 직접 쿼리 확인 |
| P3-11 (view_count 증가) | ✅ `[postId]/page.tsx`에서 `view_count` UPDATE 로직 확인 |
| P4-02 (카테고리 탭 필터링) | ✅ `community/page.tsx`에서 URL searchParams 기반 Supabase 필터링 확인 |

### 추가 검증이 필요한 항목 (커맨드 실행 시 확인)
- **P3-02**: `api/reviews/route.ts` 실제 Supabase INSERT 로직
- **P3-05**: `api/posts/route.ts` 실제 Supabase INSERT 로직
- **P3-08**: `api/posts/[postId]/comments/route.ts` 실제 Supabase INSERT 로직
- **P3-10**: Turnstile 서버 검증 로직이 실제 Secret Key로 작동하는지 (E2E 검증이므로 코드로 확인 한계)
- **P4-01**: `[brandSlug]/page.tsx`에 CapsuleSearch + IntensityFilter 실제 연동 여부
- **P4-03**: 각 컴포넌트의 빈 상태 UI 존재 여부
- **P4-04**: `error.tsx` 완성 여부
- **P1-10**: snake_case ↔ camelCase 매핑 유틸리티 존재 여부

### TaskMaster에 없는 ROADMAP 항목 (누락)
- **TASK-P1-10**: snake_case ↔ camelCase 매핑 유틸리티 — 대응하는 TaskMaster 태스크 없음

## 커맨드 설계

### 파일 위치
`.claude/commands/docs/update-roadmap.md`

### YAML 헤더
```yaml
description: TaskMaster task 진행상황과 ROADMAP.md를 동기화 (코드 검증 포함)
allowed-tools: Read, Edit, Glob, Grep, mcp__taskmaster-ai__get_tasks
```

### 커맨드 처리 순서

1. **TaskMaster 태스크 상태 조회** (`mcp__taskmaster-ai__get_tasks`)
2. **ROADMAP.md 읽기** (`ai_docs/ROADMAP.md`)
3. **`done` 태스크에 대해 아래 검증 기준으로 실제 코드 확인**
4. **검증 통과 항목만 `[x]`로 업데이트**, Phase 헤더 상태도 업데이트
5. **결과 보고**: 업데이트 목록 + 검증 실패/불확실 항목 + TaskMaster 누락 항목

### 검증 기준 (커맨드 프롬프트에 내장)

```
# TaskMaster → ROADMAP 매핑 및 검증 기준

## Task 1 (환경 변수 설정) → TASK-P0-01~04
검증: `frontend/.env.local.example` 존재 여부

## Task 2 (Supabase 테이블) → TASK-P1-01~05
검증: `frontend/lib/supabase.ts`에 createServerSupabaseClient 함수 존재

## Task 3 (Notion CMS 함수) → TASK-P1-06~08
검증: `frontend/lib/notion.ts`에 getBrands, getCapsulesByBrandId, getBrandBySlug 함수 존재

## Task 4 (Turnstile 위젯) → TASK-P1-09, P3-03, P3-06, P3-09
검증: `frontend/components/ui/turnstile-widget.tsx` 존재
      review-form, post-form, comment-form에서 TurnstileWidget import 존재

## Task 5 (브랜드/캡슐 연동) → TASK-P2-01~04
검증:
- P2-01: brands/page.tsx에 getBrands() 호출 존재
- P2-02: [brandSlug]/page.tsx에 getCapsulesByBrandId() 호출 존재
- P2-03: [capsuleSlug]/page.tsx에 getCapsuleBySlug() 호출 존재
- P2-04: app/(main)/page.tsx에 getBrands() 호출 존재

## Task 6 (리뷰 CRUD) → TASK-P3-01, P3-02, P3-10
검증:
- P3-01: [capsuleSlug]/page.tsx에 ReviewList 컴포넌트 사용 존재
- P3-02: api/reviews/route.ts에 supabase INSERT 로직 존재
- P3-10: api/reviews/route.ts에 Turnstile 검증 로직 존재 (코드 확인 수준)

## Task 7 (게시글/댓글 CRUD) → TASK-P3-04, P3-05, P3-07, P3-08, P3-11
검증:
- P3-04: community/page.tsx에 Supabase from("posts") 쿼리 존재
- P3-05: api/posts/route.ts에 supabase INSERT 로직 존재
- P3-07: community/[postId]/page.tsx에 Supabase 직접 쿼리 존재
- P3-08: api/posts/[postId]/comments/route.ts에 supabase INSERT 존재
- P3-11: community/[postId]/page.tsx에 view_count UPDATE 로직 존재

## Task 8 (검색/필터) → TASK-P4-01, P4-02
검증:
- P4-01: [brandSlug]/page.tsx에 CapsuleSearch 또는 IntensityFilter 컴포넌트 import/사용 존재
- P4-02: community/page.tsx에 category searchParams 기반 필터링 존재

## Task 9 (에러/빈 상태) → TASK-P4-03, P4-04
검증:
- P4-03: capsule-grid, review-list, post-list, comment-list 컴포넌트에 빈 상태 메시지 존재
- P4-04: app/(main)/error.tsx 파일 존재 및 내용 비어있지 않음

## Task 10 (SEO) → TASK-P4-05
검증: [brandSlug]/page.tsx 또는 [capsuleSlug]/page.tsx에 generateMetadata 함수 존재

## Task 11 (Vercel 배포) → TASK-P5-01~04
검증: pnpm build 성공 여부는 코드로 확인 불가 → pending 상태 유지, 보고
```

## 수정 대상 파일

- **작성할 파일**: `.claude/commands/docs/update-roadmap.md`
- **런타임에 읽고 수정할 파일**: `ai_docs/ROADMAP.md`

## 검증 방법

1. 커맨드 작성 후 `/docs:update-roadmap` 실행
2. `ai_docs/ROADMAP.md`에서 Phase 2 TASK들이 `[x]`로 체크되었는지 확인
3. Phase 헤더가 "✅ 완료"로 업데이트되었는지 확인
4. TASK-P1-10이 누락 항목으로 보고되었는지 확인
5. 검증 불확실 항목(P3-10, P5-01~04)이 미체크 상태로 보고에 포함되는지 확인
