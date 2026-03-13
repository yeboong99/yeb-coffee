# Task 1: 환경 변수 설정 및 외부 서비스 연동 준비

## Context

MVP 개발을 진행하기 위해 Notion, Supabase, Cloudflare Turnstile API 키를 발급하고
`frontend/.env.local` 파일을 구성해야 합니다. 현재 해당 파일이 존재하지 않으며,
`lib/notion.ts`와 `lib/supabase.ts`는 이미 환경 변수를 참조하도록 구현되어 있습니다.

## 현재 상태

- `frontend/.env.local` → **없음** (생성 필요)
- `frontend/lib/notion.ts` → Notion 클라이언트 및 DB ID 참조 코드 존재
- `frontend/lib/supabase.ts` → 브라우저/서버 Supabase 클라이언트 존재
- `.env.example` → Claude MCP용 (프로젝트 env 아님)

## 구현 계획

### 단계 1: `.env.local` 템플릿 파일 생성 (코드로 수행 가능)

`frontend/.env.local` 파일을 아래 내용으로 생성합니다.
실제 값은 사용자가 직접 각 서비스 대시보드에서 발급 후 채워야 합니다.

**파일:** `frontend/.env.local`

```bash
# Notion API
NOTION_API_KEY=secret_여기에_노션_API_키_입력
NOTION_BRAND_DATABASE_ID=여기에_브랜드_DB_ID_입력
NOTION_CAPSULE_DATABASE_ID=여기에_캡슐_DB_ID_입력

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://여기에_프로젝트_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_입력
SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_key_입력

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=여기에_사이트_키_입력
TURNSTILE_SECRET_KEY=여기에_시크릿_키_입력

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 단계 2: 사용자 직접 수행 항목 (코드로 불가)

아래 외부 서비스 계정 설정은 사용자가 직접 진행해야 합니다:

1. **Notion Integration 설정**
   - https://www.notion.so/my-integrations 에서 새 Integration 생성
   - 브랜드 DB, 캡슐 DB 각각에 Integration 연결 (Share → Connect)
   - `NOTION_API_KEY`, `NOTION_BRAND_DATABASE_ID`, `NOTION_CAPSULE_DATABASE_ID` 획득

2. **Supabase 프로젝트 설정**
   - https://supabase.com 에서 새 프로젝트 생성 (ap-northeast-2 Seoul 리전 권장)
   - Settings > API 에서 URL, anon key, service_role key 획득

3. **Cloudflare Turnstile 설정**
   - https://dash.cloudflare.com/ → Turnstile → 사이트 추가
   - localhost 허용 도메인 추가
   - Site Key, Secret Key 획득

## 수정 대상 파일

- `frontend/.env.local` (신규 생성)

## 검증 방법

```bash
cd frontend
pnpm dev
# 환경 변수 로드 에러 없이 서버 시작되면 성공
# http://localhost:3000 접속 확인
```
