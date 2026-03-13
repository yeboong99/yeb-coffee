# 계획: ROADMAP.md 재구성

## Context

`ai_docs/ROADMAP.md`의 Phase 구조가 다음 3가지 문제를 가지고 있어 개선이 필요합니다:

1. **"공통 모듈 구성" 단계 부재** — Supabase 테이블(Phase 1), Notion 함수(Phase 2), TurnstileWidget(Phase 4)이 3개 Phase에 분산되어 있어 "공통 모듈을 먼저 만들고 기능을 붙인다"는 흐름이 보이지 않음
2. **TurnstileWidget이 추가 기능 단계(Phase 4)에 배치** — 3개 폼에서 공통 사용되는 컴포넌트임에도 핵심 기능보다 뒤에 위치
3. **각 Phase 간 순서 근거 미기술** — Task별 의존성은 있으나 Phase 단위의 "왜 이 순서인가" 설명이 없음

## 수정 대상 파일

- `ai_docs/ROADMAP.md` — Phase 구조 재편 (유일한 수정 대상)

## 재구성 방안: 기존 7 Phase → 6 Phase

### 매핑 요약

| 새 Phase | 이름 | 출처 (기존 Phase) |
|----------|------|-------------------|
| Phase 0 | 프로젝트 골격 (환경 설정) | 기존 Phase 0 그대로 |
| Phase 1 | 공통 모듈 구성 | 기존 Phase 1 전체 + Phase 2의 함수 구현(P2-01~P2-03) + Phase 4의 위젯 구현(P4-01) + 신규(snake_case 매핑) |
| Phase 2 | 핵심 기능 — CMS 페이지 연동 | 기존 Phase 2의 페이지 연동(P2-04~P2-07) |
| Phase 3 | 핵심 기능 — 사용자 참여 (CRUD + 스팸 방지) | 기존 Phase 3 + Phase 4의 폼 연동(P4-02~P4-05) |
| Phase 4 | 추가 기능 | 기존 Phase 5 + 기존 P6-05(SEO 메타태그) |
| Phase 5 | 최적화 및 배포 | 기존 Phase 6 (P6-05 제외) |

### Phase 3에서 CRUD + Turnstile 통합 근거

`reviews/route.ts:32-44`에서 Turnstile 서버 검증이 이미 구현되어 있음. 실제 `TURNSTILE_SECRET_KEY`가 설정되면 `"dev-bypass"` 토큰은 검증 실패 → CRUD 자체가 작동 불가. 따라서 CRUD와 Turnstile 폼 연동을 분리하면 **테스트 불가능한 중간 상태**가 발생. 엔티티별(리뷰→게시글→댓글)로 GET → POST → Turnstile 연동을 묶는 것이 자연스러움.

### 각 Phase 도입부에 추가할 내용

모든 Phase에 다음 두 항목을 Phase 설명 직후에 추가:

- **📌 선행 Phase 완료가 필요한 이유**: 왜 이전 Phase가 먼저여야 하는지
- **📌 이 Phase에서 이 작업을 진행하는 이유**: 왜 이 작업들이 이 단계에 속하는지

구체적 문구:

**Phase 0:**
> - 선행 조건: 없음. 모든 개발의 출발점.
> - 이 Phase의 근거: 외부 서비스 계정과 API 키가 확보되지 않으면 이후 모든 Phase에서 서비스 연동 코드를 작성하거나 테스트할 수 없다. 코드 변경 없이 수행할 수 있는 순수 인프라 작업이므로 가장 먼저 완료한다.

**Phase 1:**
> - 선행 조건: Phase 0의 환경 변수(API 키, DB URL 등)가 설정되어야 Notion 클라이언트 초기화, Supabase 테이블 생성, Turnstile 위젯 렌더링이 가능하다.
> - 이 Phase의 근거: 여기서 구현하는 모듈들은 Phase 2~3의 여러 기능에서 반복 사용되는 공통 코드이다. Supabase 테이블은 Phase 3(CRUD)의 전제 조건이고, Notion 조회 함수는 Phase 2(페이지 연동)의 전제 조건이며, TurnstileWidget은 Phase 3의 3개 폼에서 공통 사용된다. 이들을 먼저 구현해두면 핵심 기능 구현 시 인프라 코드 작성과 기능 로직 구현이 혼재되지 않는다.

**Phase 2:**
> - 선행 조건: Phase 1에서 `getBrands()`, `getCapsulesByBrandId()`, `getCapsuleBySlug()`, `getBrandBySlug()` 함수가 구현 완료되어야 페이지에서 호출할 수 있다.
> - 이 Phase의 근거: 브랜드/캡슐 데이터는 서비스의 콘텐츠 골격이다. 캡슐 상세 페이지가 존재해야 Phase 3에서 해당 캡슐에 대한 리뷰를 연동할 수 있다. Notion 연동은 읽기 전용(ISR)이라 CRUD보다 구현 복잡도가 낮아 먼저 안정화하기 적합하다.

**Phase 3:**
> - 선행 조건: Phase 1의 Supabase 테이블과 TurnstileWidget이 준비되어야 하고, Phase 2의 캡슐 상세 페이지가 연동되어야 리뷰 작성 컨텍스트(어떤 캡슐에 대한 리뷰인지)가 확보된다.
> - 이 Phase의 근거: 리뷰/게시글/댓글 CRUD는 커뮤니티 서비스의 핵심 상호작용이다. Turnstile 스팸 방지를 함께 연동하는 이유는, 모든 API 라우트에 이미 Turnstile 서버 검증이 구현되어 있어(`reviews/route.ts:32-44`) CRUD를 테스트하려면 반드시 유효한 Turnstile 토큰이 필요하기 때문이다. 분리하면 테스트 불가능한 중간 상태가 발생한다.

**Phase 4:**
> - 선행 조건: Phase 2(캡슐 데이터)와 Phase 3(게시글 데이터)이 완료되어야 검색/필터/카테고리 필터링 대상 데이터가 존재한다.
> - 이 Phase의 근거: 검색, 필터, 빈 상태 UI, 에러 처리, SEO 메타태그는 핵심 기능은 아니지만 사용자 경험을 완성하는 부가 기능이다. 핵심 CRUD가 작동하는 상태에서 UX를 다듬는 순서가 자연스럽다.

**Phase 5:**
> - 선행 조건: Phase 0~4의 모든 기능이 로컬에서 정상 동작해야 프로덕션 배포 시 기능적 결함 없이 검증할 수 있다.
> - 이 Phase의 근거: 빌드 에러 수정, 환경 변수 프로덕션 설정, E2E 검증은 코드가 확정된 상태에서 진행해야 재작업을 최소화할 수 있다.

### 태스크 번호 재편성

Phase 1 내부는 서브그룹(1-A, 1-B, 1-C, 1-D)으로 구분:

```
Phase 1: 공통 모듈 구성
├── 1-A: 데이터 인프라 (Supabase)
│   TASK-P1-01  reviews 테이블              (← 기존 P1-01)
│   TASK-P1-02  posts 테이블                (← 기존 P1-02)
│   TASK-P1-03  comments 테이블             (← 기존 P1-03)
│   TASK-P1-04  comment_count 트리거        (← 기존 P1-04)
│   TASK-P1-05  RLS 정책                    (← 기존 P1-05)
├── 1-B: 데이터 접근 함수 (Notion)
│   TASK-P1-06  getBrands() + 매핑 함수     (← 기존 P2-01)
│   TASK-P1-07  getCapsules 관련 함수들      (← 기존 P2-02)
│   TASK-P1-08  getBrandBySlug()            (← 기존 P2-03)
├── 1-C: 공통 UI 컴포넌트
│   TASK-P1-09  TurnstileWidget             (← 기존 P4-01)
└── 1-D: 공통 유틸리티
    TASK-P1-10  snake_case ↔ camelCase 매핑 (← 신규, 기술부채에서 승격)

Phase 2: TASK-P2-01~04 (← 기존 P2-04~P2-07)
Phase 3: TASK-P3-01~11 (← 기존 P3-01~07 + P4-02~05, 엔티티별 묶음)
Phase 4: TASK-P4-01~05 (← 기존 P5-01~04 + P6-05)
Phase 5: TASK-P5-01~04 (← 기존 P6-01~04)
```

Phase 3 태스크 배치 (엔티티별 묶음):
```
리뷰:   P3-01(GET) → P3-02(POST 검증) → P3-03(ReviewForm Turnstile)
게시글: P3-04(목록 GET) → P3-05(POST 검증) → P3-06(PostForm Turnstile)
        P3-07(상세 GET)
댓글:   P3-08(POST 검증) → P3-09(CommentForm Turnstile)
공통:   P3-10(서버사이드 Turnstile E2E 확인) → P3-11(view_count)
```

### 기타 변경 사항

- SEO 메타태그(기존 P6-05)를 Phase 5 → Phase 4로 이동: `generateMetadata()`는 성격상 "추가 기능"에 해당
- 기술 부채 테이블에서 `camelCase ↔ snake_case 매핑 없음` 항목을 "해결 예정 (Phase 1 TASK-P1-10)"으로 업데이트
- MoSCoW 테이블, 성공 지표 등 부속 섹션은 새 Phase 구조에 맞춰 참조 번호만 업데이트
- 변경 이력에 새 행 추가: `2026-03-13 | 1.1.0 | Phase 구조 재편 - 공통 모듈 Phase 신설, 순서 근거 추가`

### 변경하지 않는 것

- 각 Task의 내부 내용(스키마, 구현 내용, 위험 요소 등)은 그대로 유지
- 프로젝트 개요, 현재 상태, 목표 상태, MoSCoW 섹션 내용 유지
- 환경 변수 체크리스트, 외부 서비스 설정 체크리스트, 성공 지표 유지

## 실행 단계

1. `ai_docs/ROADMAP.md`의 마일스톤 섹션을 위 구조에 따라 재작성
2. 각 Phase 도입부에 순서 근거 2줄 추가
3. 태스크 번호 재편성 적용
4. 기술 부채 테이블 업데이트 (snake_case 매핑 항목)
5. 변경 이력 추가

## 검증 방법

- ROADMAP.md를 읽어 5단계 원칙(골격→공통모듈→핵심기능→추가기능→최적화/배포)에 부합하는지 확인
- 모든 기존 Task가 누락 없이 새 Phase에 매핑되었는지 확인
- 각 Phase에 순서 근거가 포함되었는지 확인
- Task 간 의존성(dependency) 참조 번호가 새 번호 체계와 일치하는지 확인
