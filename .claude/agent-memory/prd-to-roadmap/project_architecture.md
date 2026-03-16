---
name: 캡슐 커피 커뮤니티 프로젝트 아키텍처 결정 사항
description: 로드맵 생성 중 파악한 핵심 아키텍처 결정 사항 및 코드베이스 패턴 (v2 업데이트)
type: project
---

## 아키텍처 결정 사항

### 데이터 소스 분리
- Notion API: 브랜드/캡슐 데이터 (읽기 전용, ISR revalidate: 3600초)
- Supabase: 리뷰/게시글/댓글 (CRUD, service_role 키로 서버에서만 쓰기)

### 인증 방식
- 사용자 인증 없음 (완전 익명)
- 스팸 방지: Cloudflare Turnstile CAPTCHA (클라이언트 위젯 + 서버 토큰 검증) 연동 완료

### Supabase 접근 패턴
- 읽기: anon 키 또는 service_role 키 모두 가능 (RLS로 제어)
- 쓰기: API 라우트에서 service_role 키(`createServerSupabaseClient()`)만 사용
- `capsule_review_stats` 뷰 존재 (`capsule_slug`, `avg_rating`, `review_count`)

### 컬럼명 규칙
- TypeScript 타입: camelCase (`authorNickname`, `capsuleSlug`)
- Supabase 테이블: snake_case (`author_nickname`, `capsule_slug`)
- API 라우트에서 INSERT 시 명시적 매핑 필요
- `mapRowToPost()`, `mapRowToReview()` 매퍼 함수가 여러 파일에 인라인 중복 → v2에서 `lib/mappers.ts`로 추출 예정

## 현재 상태 (2026-03-16 기준)
- MVP v1 완성 및 프로덕션 배포 완료
- v2 PRD 작성 완료: F020 (Top 5 랭킹), F021 (게시글 무한 스크롤), F022 (리뷰 더보기)
- v2 로드맵 작성 완료: 4개 마일스톤 (M1 공통 인프라, M2 Top 5, M3 무한 스크롤, M4 리뷰 더보기)

## v2 로드맵 마일스톤 구조 결정 이유
- M1 (공통 인프라) → M2 (F020) / M3 (F021) / M4 (F022) 순서
- M1을 선행한 이유: `PaginatedResponse<T>` 타입과 `mappers.ts` 추출이 M3, M4에서 공통 의존성
- M2/M3/M4는 서로 독립적이므로 병렬 진행 가능 (M1 완료 후)
- Phase 순서를 사용하지 않고 마일스톤 순서를 사용한 이유: v2는 기반 인프라가 이미 완성된 상태에서 기능 추가만 하므로 Phase 0~6 전체를 사용할 필요 없음

**Why:** v2 PRD가 3개의 독립적인 기능 추가이며 기존 인프라를 재활용하므로, 공통 인프라만 선행하면 나머지는 독립적 구현 가능.

**How to apply:** 향후 v3 등 고도화 시에도 기존 인프라 상태를 먼저 확인하고, 필요한 공통 작업만 선행 마일스톤으로 분리할 것.
