---
name: 캡슐 커피 커뮤니티 프로젝트 아키텍처 결정 사항
description: 로드맵 생성 중 파악한 핵심 아키텍처 결정 사항 및 코드베이스 패턴
type: project
---

## 아키텍처 결정 사항

### 데이터 소스 분리
- Notion API: 브랜드/캡슐 데이터 (읽기 전용, ISR revalidate: 3600초)
- Supabase: 리뷰/게시글/댓글 (CRUD, service_role 키로 서버에서만 쓰기)

### 인증 방식
- 사용자 인증 없음 (완전 익명)
- 스팸 방지: Cloudflare Turnstile CAPTCHA (클라이언트 위젯 + 서버 토큰 검증)
- `"dev-bypass"` 토큰이 현재 모든 폼에 하드코딩되어 있음 (Phase 4에서 교체 필요)

### Supabase 접근 패턴
- 읽기: anon 키 또는 service_role 키 모두 가능 (RLS로 제어)
- 쓰기: API 라우트에서 service_role 키(`createServerSupabaseClient()`)만 사용
- `SUPABASE_SERVICE_ROLE_KEY`는 `NEXT_PUBLIC_` 접두사 없이 서버 전용으로 올바르게 설정됨

### 컬럼명 규칙
- TypeScript 타입: camelCase (`authorNickname`, `capsuleSlug`)
- Supabase 테이블: snake_case (`author_nickname`, `capsule_slug`)
- API 라우트에서 INSERT 시 명시적 매핑 필요

## 파악된 미구현 항목 (2026-03-12 기준)
- `GET /api/posts/[postId]` 라우트 없음 (단건 게시글 조회)
- Turnstile React 라이브러리 미설치 (`package.json`에 없음)
- `averageRating` 데이터 소스 불명확 (Notion 저장 vs Supabase 집계)
- `CapsuleSearch`/`IntensityFilter`가 브랜드별 캡슐 목록 페이지에 미연결

## Phase 순서 결정 이유
- Phase 0 (환경 설정) → Phase 1 (DB 테이블) → Phase 2 (Notion 연동) → Phase 3 (Supabase CRUD) → Phase 4 (Turnstile) → Phase 5 (UX) → Phase 6 (배포)
- Turnstile을 Phase 4로 후순위에 배치한 이유: API 라우트에 서버 검증 로직은 이미 구현됨, 클라이언트 위젯만 연결하면 되므로 CRUD 연동 완료 후 처리해도 블로킹 없음

**Why:** MVP PRD 분석 결과 외부 서비스 3개 (Notion, Supabase, Turnstile) 모두 미연동 상태. 기반 인프라(DB 스키마) 없이는 CRUD 구현 불가하므로 Phase 순서가 중요.

**How to apply:** 향후 로드맵 업데이트 시 Phase 순서와 의존성 체인을 유지할 것.
