---
description: TaskMaster task 진행상황과 ROADMAP.md를 동기화 (코드 검증 포함)
allowed-tools: Read, Edit, Glob, Grep, mcp__taskmaster-ai__get_tasks
---

# ROADMAP.md 동기화 커맨드

TaskMaster의 태스크 상태와 실제 코드 파일을 모두 확인한 후,
**코드 검증을 통과한 항목만** ROADMAP.md에서 `[ ]` → `[x]`로 업데이트합니다.

## 처리 순서

1. `mcp__taskmaster-ai__get_tasks`로 전체 태스크 상태 조회
2. `ai_docs/ROADMAP.md` 읽기
3. 아래 **검증 기준**에 따라 각 태스크의 실제 코드 확인
4. 검증 통과 항목만 ROADMAP.md 업데이트 (Phase 헤더 상태도 갱신)
5. 결과 보고: 업데이트 목록 + 검증 실패/불확실 항목 + TaskMaster 누락 항목

---

## 검증 기준 (TaskMaster → ROADMAP 매핑)

### Task 1 (환경 변수 설정) → TASK-P0-01~04
검증: `frontend/.env.local.example` 파일 존재 여부

### Task 2 (Supabase 테이블) → TASK-P1-01~05
검증: `frontend/lib/supabase.ts`에 `createServerSupabaseClient` 함수 존재

### Task 3 (Notion CMS 함수) → TASK-P1-06~08
검증: `frontend/lib/notion.ts`에 `getBrands`, `getCapsulesByBrandId`, `getBrandBySlug` 함수 존재

### Task 4 (Turnstile 위젯) → TASK-P1-09, P3-03, P3-06, P3-09
검증:
- `frontend/components/ui/turnstile-widget.tsx` 파일 존재
- `review-form`, `post-form`, `comment-form` 컴포넌트에서 `TurnstileWidget` import 존재

### Task 5 (브랜드/캡슐 연동) → TASK-P2-01~04
검증:
- P2-01: `frontend/app/(main)/brands/page.tsx`에 `getBrands()` 호출 존재
- P2-02: `frontend/app/(main)/brands/[brandSlug]/page.tsx`에 `getCapsulesByBrandId()` 호출 존재
- P2-03: `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`에 `getCapsuleBySlug()` 호출 존재
- P2-04: `frontend/app/(main)/page.tsx`에 `getBrands()` 호출 존재

### Task 6 (리뷰 CRUD) → TASK-P3-01, P3-02, P3-10
검증:
- P3-01: `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`에 `ReviewList` 컴포넌트 사용 존재
- P3-02: `frontend/app/api/reviews/route.ts`에 Supabase INSERT 로직 존재
- P3-10: `frontend/app/api/reviews/route.ts`에 Turnstile 검증 로직 존재

### Task 7 (게시글/댓글 CRUD) → TASK-P3-04, P3-05, P3-07, P3-08, P3-11
검증:
- P3-04: `frontend/app/(main)/community/page.tsx`에 Supabase `from("posts")` 쿼리 존재
- P3-05: `frontend/app/api/posts/route.ts`에 Supabase INSERT 로직 존재
- P3-07: `frontend/app/(main)/community/[postId]/page.tsx`에 Supabase 직접 쿼리 존재
- P3-08: `frontend/app/api/posts/[postId]/comments/route.ts`에 Supabase INSERT 존재
- P3-11: `frontend/app/(main)/community/[postId]/page.tsx`에 `view_count` UPDATE 로직 존재

### Task 8 (검색/필터) → TASK-P4-01, P4-02
검증:
- P4-01: `frontend/app/(main)/brands/[brandSlug]/page.tsx`에 `CapsuleSearch` 또는 `IntensityFilter` import/사용 존재
- P4-02: `frontend/app/(main)/community/page.tsx`에 `category` searchParams 기반 필터링 존재

### Task 9 (에러/빈 상태) → TASK-P4-03, P4-04
검증:
- P4-03: `capsule-grid`, `review-list`, `post-list`, `comment-list` 컴포넌트에 빈 상태 메시지 존재
- P4-04: `frontend/app/(main)/error.tsx` 파일 존재 및 내용 비어있지 않음

### Task 10 (SEO) → TASK-P4-05
검증: `[brandSlug]/page.tsx` 또는 `[capsuleSlug]/page.tsx`에 `generateMetadata` 함수 존재

### Task 11 (Vercel 배포) → TASK-P5-01~04
검증: pnpm build 성공 여부는 코드로 확인 불가 → pending 상태 유지, 보고

---

## TaskMaster에 없는 ROADMAP 항목 (누락 보고 대상)
- **TASK-P1-10**: snake_case ↔ camelCase 매핑 유틸리티 — 대응하는 TaskMaster 태스크 없음
  검증: `frontend/lib/` 디렉토리에 변환 유틸리티 함수(예: `toCamelCase`, `toSnakeCase`) 존재 여부

---

## 결과 보고 형식

완료 후 다음 형식으로 보고해주세요:

```
## ROADMAP.md 동기화 결과

### ✅ 체크 완료 항목
- TASK-P2-01: 브랜드 목록 Notion 연동 (코드 검증 통과)
- ...

### ⚠️ 검증 불확실 / 미체크 항목
- TASK-P3-10: Turnstile E2E 검증 (코드 수준 확인만 가능, 실제 Secret Key 동작 미검증)
- TASK-P5-01~04: Vercel 배포 (빌드 실행 없이 코드로 확인 불가)

### ❌ 검증 실패 항목
- TASK-P4-01: CapsuleSearch 미연동 (import 없음)
- ...

### 📋 TaskMaster 누락 항목
- TASK-P1-10: snake_case ↔ camelCase 매핑 유틸리티 (TaskMaster 태스크 없음)
```
