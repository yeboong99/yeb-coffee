# Playwright MCP로 Task 4 (Turnstile 위젯 연동) 직접 테스트

## Context

Playwright MCP 도구(`mcp__playwright__*`)를 사용해 실제 브라우저로 Task 4 구현 내용을 직접 검증한다.
별도 테스트 파일 작성 없이, MCP 도구로 브라우저를 제어해 UI 동작을 확인한다.

---

## 전제 조건

Next.js 개발 서버가 `http://localhost:3000`에서 실행 중이어야 함.
(`cd frontend && pnpm dev`)

---

## 테스트 시나리오

### 시나리오 1: PostForm (`/community/write`)

| 단계 | 도구 | 검증 내용 |
|------|------|----------|
| 1 | `browser_navigate` → `/community/write` | 페이지 접속 |
| 2 | `browser_screenshot` | 초기 화면 캡처 |
| 3 | `browser_snapshot` | 접근성 트리에서 제출 버튼 disabled 상태 확인 |
| 4 | Turnstile iframe 확인 | `browser_snapshot`에서 iframe 존재 여부 확인 |
| 5 | 폼 입력 | `browser_fill_form` 또는 `browser_type`으로 제목/내용/닉네임 입력 |
| 6 | 카테고리 선택 | `browser_select_option` |
| 7 | 버튼 클릭 시도 | `browser_click` → 버튼이 disabled라 클릭 안 됨 확인 |
| 8 | `browser_screenshot` | 최종 상태 캡처 |

### 시나리오 2: ReviewForm (`/capsules/[slug]`)

placeholder 데이터의 유효한 캡슐 slug 확인 후 접속

| 단계 | 도구 | 검증 내용 |
|------|------|----------|
| 1 | `browser_navigate` → `/capsules/{slug}` | 페이지 접속 |
| 2 | `browser_screenshot` | 리뷰 폼 영역 확인 |
| 3 | `browser_snapshot` | 제출 버튼 disabled 확인 |
| 4 | Turnstile 위젯 iframe 존재 확인 | |
| 5 | 별점/닉네임/내용 입력 | `browser_click` (별점), `browser_type` |
| 6 | 버튼 상태 재확인 | Turnstile 토큰 없으면 여전히 disabled |

### 시나리오 3: CommentForm (`/community/[postId]`)

placeholder postId 확인 후 접속

| 단계 | 도구 | 검증 내용 |
|------|------|----------|
| 1 | `browser_navigate` → `/community/{postId}` | 페이지 접속 |
| 2 | `browser_screenshot` | 댓글 폼 영역 확인 |
| 3 | `browser_snapshot` | 제출 버튼 disabled 확인 |
| 4 | 닉네임/내용 입력 후 버튼 상태 확인 | |

### 시나리오 4: Turnstile 없이 제출 시 toast 에러

NEXT_PUBLIC_TURNSTILE_SITE_KEY가 설정된 경우:
- Turnstile 위젯 iframe 렌더링 확인
- 토큰 없는 상태에서 버튼 클릭 불가 (disabled) 확인

NEXT_PUBLIC_TURNSTILE_SITE_KEY가 미설정인 경우:
- 위젯이 렌더링되지 않음
- JavaScript로 강제 제출 시 "CAPTCHA 인증을 완료해주세요." toast 확인
  → `browser_evaluate`로 폼 submit 이벤트 강제 발동

---

## 실행 순서

1. `browser_navigate`로 개발 서버 접속 확인
2. 각 시나리오 순서대로 진행
3. 각 단계마다 `browser_screenshot` 또는 `browser_snapshot`으로 상태 기록
4. 네트워크 요청 확인: `browser_network_requests`로 API 호출 여부 확인
5. 콘솔 에러 확인: `browser_console_messages`

---

## 주의사항

- 실제 Turnstile CAPTCHA는 자동화 도구에서 통과 불가 (외부 서비스)
- 따라서 테스트 범위: **UI 렌더링**, **버튼 disabled 상태**, **폼 유효성 에러** 위주
- Turnstile 자동 통과 테스트가 필요하면 Cloudflare 테스트 키로 환경 변수 설정 후 재시도
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA` (항상 통과)
