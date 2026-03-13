# Plan: Taskmaster 작업 목록 생성

## Context
`ai_docs/ROADMAP.md`를 기반으로 Taskmaster AI 작업 목록을 자동 생성한다.
ROADMAP에는 Phase 0~5에 걸쳐 총 26개의 명시적 태스크(TASK-P0-01 ~ TASK-P5-04)가 정의되어 있다.

## 실행 방법

`mcp__taskmaster-ai__parse_prd` 도구를 사용하여 ROADMAP.md를 파싱해 tasks.json을 생성한다.

### 파라미터
- `projectRoot`: `/Users/yeboong99/Desktop/claude-yeb-coffee`
- `input`: `/Users/yeboong99/Desktop/claude-yeb-coffee/ai_docs/ROADMAP.md`
- `numTasks`: `26` (ROADMAP에 정의된 태스크 수와 일치)
- `force`: `true` (기존 파일 덮어쓰기)

## ROADMAP 태스크 목록 요약

| Phase | Task ID | 내용 | 예상 시간 |
|-------|---------|------|-----------|
| 0 | P0-01 | Notion Integration 생성 및 권한 부여 | 30m |
| 0 | P0-02 | Supabase 프로젝트 생성 및 API 키 확보 | 20m |
| 0 | P0-03 | Cloudflare Turnstile 사이트 등록 및 키 발급 | 20m |
| 0 | P0-04 | `.env.local` 파일 생성 및 환경 변수 설정 | 20m |
| 1 | P1-01 | `reviews` 테이블 생성 SQL 실행 | 30m |
| 1 | P1-02 | `posts` 테이블 생성 SQL 실행 | 30m |
| 1 | P1-03 | `comments` 테이블 생성 SQL 실행 | 30m |
| 1 | P1-04 | `comment_count` 자동 갱신 DB 트리거 생성 | 30m |
| 1 | P1-05 | RLS 정책 설정 | 30m |
| 1 | P1-06 | `getBrands()` 함수 구현 | 2h |
| 1 | P1-07 | `getCapsulesByBrandId()` 함수 구현 | 2h |
| 1 | P1-08 | `getBrandBySlug()` 함수 구현 | 1h |
| 1 | P1-09 | Turnstile React 위젯 컴포넌트 구현 | 1.5h |
| 1 | P1-10 | snake_case ↔ camelCase 매핑 유틸리티 구현 | 1h |
| 2 | P2-01 | 브랜드 목록 페이지 Notion 연동 | 1h |
| 2 | P2-02 | 브랜드별 캡슐 목록 페이지 Notion 연동 | 1.5h |
| 2 | P2-03 | 캡슐 상세 페이지 Notion 연동 | 1.5h |
| 2 | P2-04 | 홈 페이지 BrandShowcase 연동 | 1h |
| 3 | P3-01 | 리뷰 목록 Supabase 연동 (GET) | 1h |
| 3 | P3-02 | 리뷰 작성 API 연동 검증 (POST) | 30m |
| 3 | P3-03 | ReviewForm Turnstile 위젯 연동 | 1h |
| 3 | P3-04 | 커뮤니티 게시글 목록 Supabase 연동 (GET) | 1h |
| 3 | P3-05 | 게시글 작성 API 연동 검증 (POST) | 30m |
| 3 | P3-06 | PostForm Turnstile 위젯 연동 | 1h |
| 3 | P3-07 | 게시글 상세 페이지 Supabase 연동 (GET) | 1h |
| 3 | P3-08 | 댓글 작성 API 연동 검증 (POST) | 30m |
| 3 | P3-09 | CommentForm Turnstile 위젯 연동 | 1h |
| 3 | P3-10 | Turnstile 검증 E2E 확인 | 30m |
| 3 | P3-11 | `view_count` 증가 로직 구현 | 1h |
| 4 | P4-01 | CapsuleSearch + IntensityFilter 연동 | 1.5h |
| 4 | P4-02 | 커뮤니티 카테고리 탭 필터링 개선 | 1.5h |
| 4 | P4-03 | 빈 상태(empty state) UI 전체 구현 | 1h |
| 4 | P4-04 | 에러 상태 처리 및 error.tsx 완성 | 1h |
| 4 | P4-05 | 주요 페이지 SEO 메타태그 설정 | 1h |
| 5 | P5-01 | Vercel 환경 변수 설정 | 20m |
| 5 | P5-02 | Turnstile 허용 도메인에 Vercel 도메인 추가 | 10m |
| 5 | P5-03 | TypeScript 빌드 에러 및 ESLint 점검 | 1h |
| 5 | P5-04 | Vercel 배포 및 프로덕션 E2E 검증 | 1h |

## 실행 순서

1. `parse_prd` 실행하여 tasks.json 자동 생성
2. `get_tasks`로 생성된 태스크 목록 확인
