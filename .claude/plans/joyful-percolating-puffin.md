# 계획: nextjs-ui-markup 에이전트 MCP 서버 활용 강화

## Context

현재 `nextjs-ui-markup` 에이전트는 UI 마크업을 잘 생성하지만, MCP 서버를 전혀 활용하지 않고 있음.
- **context7**: 최신 라이브러리 문서 (Tailwind v4, shadcn/ui, Next.js 16) 조회 가능
- **sequential-thinking**: 복잡한 UI 설계를 단계별로 체계적으로 사고 가능
- **shadcn MCP**: 레지스트리에서 실제 shadcn/ui 컴포넌트 탐색, 예제 코드 조회 가능

이 세 MCP 서버를 에이전트 작업 흐름에 통합하면 품질 높은 UI를 더 체계적으로 생성할 수 있음.

## 수정 대상 파일

`/Users/yeboong99/Desktop/claude-yeb-coffee/.claude/agents/nextjs-ui-markup.md`

## 수정 내용

### 1. 작업 흐름 섹션 추가 (MCP 기반)

에이전트가 UI를 생성할 때 따를 3단계 MCP 활용 흐름:

**Step 1 — Sequential Thinking으로 UI 구조 설계**
- `mcp__sequential-thinking__sequentialthinking` 사용
- 요청된 UI의 컴포넌트 계층, 레이아웃, 상태, 접근성 요구사항을 단계별로 사고
- 사용할 shadcn/ui 컴포넌트 목록 결정

**Step 2 — shadcn MCP로 컴포넌트 탐색 및 예제 확인**
- `mcp__shadcn__list_items_in_registries` / `mcp__shadcn__search_items_in_registries` 사용
- 필요한 컴포넌트가 shadcn 레지스트리에 있는지 확인
- `mcp__shadcn__get_item_examples_from_registries` / `mcp__shadcn__view_items_in_registries`로 실제 예제 코드 참조
- `mcp__shadcn__get_add_command_for_items`로 설치 명령 확인

**Step 3 — context7으로 최신 문서 확인**
- Tailwind CSS v4 새로운 유틸리티나 문법이 확실하지 않을 때
- shadcn/ui 특정 컴포넌트의 최신 API가 필요할 때
- Next.js 16 / React 19 특화 패턴 확인 시
- `mcp__context7__resolve-library-id` → `mcp__context7__query-docs` 순서로 사용

### 2. MCP 사용 가이드라인 섹션 추가

```
## MCP 서버 활용 워크플로우

### Sequential Thinking (항상 먼저 실행)
복잡한 UI 요청(여러 섹션, 새로운 페이지, 복합 컴포넌트)을 받으면
mcp__sequential-thinking__sequentialthinking를 먼저 실행하여:
- 필요한 UI 컴포넌트 목록 정리
- 레이아웃 구조 계획 (그리드, 플렉스 중 선택)
- 반응형/다크모드 요구사항 파악
- shadcn 컴포넌트 사용 전략 수립

### shadcn MCP (컴포넌트 선택 시)
컴포넌트를 선택하기 전 반드시:
1. mcp__shadcn__search_items_in_registries로 원하는 컴포넌트 탐색
2. mcp__shadcn__view_items_in_registries로 컴포넌트 상세 확인
3. mcp__shadcn__get_item_examples_from_registries로 실제 사용 예제 참조
4. mcp__shadcn__get_add_command_for_items로 설치 명령 포함

### context7 (문서 불확실 시)
라이브러리 API가 불확실하거나 최신 문법이 필요할 때:
1. mcp__context7__resolve-library-id로 라이브러리 ID 확인
2. mcp__context7__query-docs로 관련 문서 조회
주요 라이브러리: tailwindcss, shadcn/ui, next.js, react
```

### 3. 출력 형식에 shadcn 설치 명령 추가

현재 "shadcn/ui 의존성: 필요한 컴포넌트 목록" →
"shadcn/ui 의존성: 설치 명령 포함 (pnpm dlx shadcn@latest add ...)"으로 강화

## 최종 파일 구조

1. 핵심 역할 (기존 유지)
2. 절대 하지 않는 것 (기존 유지)
3. **[신규] MCP 서버 활용 워크플로우** ← 핵심 추가 섹션
4. 프로젝트 컨텍스트 (기존 유지)
5. 마크업 작성 원칙 (기존 유지)
6. 출력 형식 (shadcn 설치 명령 강화)
7. 코드 품질 기준 (기존 유지)
8. 자기 검증 체크리스트 (MCP 활용 항목 추가)
9. 메모리 시스템 (기존 유지)

## 검증 방법

수정 후 에이전트를 테스트:
1. 새 UI 컴포넌트 요청 시 sequential thinking 먼저 실행하는지 확인
2. shadcn 컴포넌트 선택 시 MCP로 예제 코드 참조하는지 확인
3. 최신 Tailwind v4 문법 사용 시 context7 조회하는지 확인
