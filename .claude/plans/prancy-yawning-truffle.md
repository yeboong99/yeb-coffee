# Task 11: Vercel 프로덕션 배포 준비

## Context

MVP 기능 구현이 완료된 상태에서 Vercel 프로덕션 배포를 위한 코드 사이드 준비 작업이 필요하다.
현재 문제점:
- `.gitignore`에 `.env.local`이 누락되어 **시크릿 키가 커밋될 위험**이 있음
- 참조 문서(CLAUDE.md)에 언급된 `frontend/.env.local.example` 파일이 존재하지 않음
- Vercel Root Directory는 대시보드에서 `frontend`로 설정할 예정 (vercel.json 불필요)

---

## [코드] 구현 계획

### 1. `.gitignore` 보안 수정 (필수)

프로젝트 루트 `.gitignore`에 `.env.local` 패턴 추가:

```
.env.local
.env*.local
```

### 2. `frontend/.env.local.example` 생성

CLAUDE.md에서 참조하는 예시 파일을 실제로 생성 (값 없이 키만):

```env
# Notion CMS
NOTION_API_KEY=
NOTION_BRAND_DATABASE_ID=
NOTION_CAPSULE_DATABASE_ID=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# 배포 도메인 (예: https://your-app.vercel.app)
NEXT_PUBLIC_BASE_URL=
```

---

## [수동] 배포 전 준비 가이드 (처음 Vercel 사용 시)

### STEP 1 — GitHub에 코드 Push

코드 변경이 완료되면 커밋 후 GitHub에 Push:

```bash
git add .
git commit -m "feat: Vercel 배포 준비"
git push origin main
```

### STEP 2 — Vercel 계정 및 프로젝트 생성

1. https://vercel.com 접속 → GitHub 계정으로 회원가입/로그인
2. `Add New Project` 버튼 클릭
3. GitHub 레포지토리 목록에서 `claude-yeb-coffee` 선택 → `Import`
4. **Configure Project** 화면에서:
   - **Root Directory** → `Edit` 클릭 → `frontend` 입력 → 저장
   - Framework Preset: `Next.js` 자동 감지됨 (그대로 둠)
5. 아직 `Deploy` 누르지 말 것 (환경변수 먼저 설정)

### STEP 3 — 환경변수 설정

`Configure Project` 화면 하단 **Environment Variables** 섹션에서 아래 9개를 입력
(`.env.local` 파일의 실제 값을 복사):

| Key | 설명 |
|---|---|
| `NOTION_API_KEY` | Notion Integration 시크릿 키 |
| `NOTION_BRAND_DATABASE_ID` | Notion 브랜드 DB ID |
| `NOTION_CAPSULE_DATABASE_ID` | Notion 캡슐 DB ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (비공개) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 사이트 키 |
| `TURNSTILE_SECRET_KEY` | Turnstile 시크릿 키 |
| `NEXT_PUBLIC_BASE_URL` | 배포 URL (처음엔 비워두고 배포 후 추가) |

### STEP 4 — 첫 배포 실행

`Deploy` 버튼 클릭 → 빌드 로그 확인 (약 1-3분)
배포 완료 후 `https://xxxx.vercel.app` 형식의 URL 발급

### STEP 5 — NEXT_PUBLIC_BASE_URL 업데이트

발급된 Vercel URL을 확인한 뒤:
- Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
- `NEXT_PUBLIC_BASE_URL` 값을 실제 URL로 업데이트 (예: `https://yourcoffee.vercel.app`)
- Redeploy 트리거 필요: Deployments 탭 → 최신 배포 → `...` → `Redeploy`

### STEP 6 — Cloudflare Turnstile 도메인 추가

1. https://dash.cloudflare.com 접속 → Turnstile 메뉴
2. 해당 사이트 선택 → `Edit` → Domains에 Vercel URL 추가
   (예: `yourcoffee.vercel.app`)

---

## 수정/생성 파일 (코드)

1. `.gitignore` — `.env.local`, `.env*.local` 패턴 추가
2. `frontend/.env.local.example` — 신규 생성

## 검증 방법

1. `git status` → `.env.local`이 untracked 상태인지 확인 (보안)
2. Vercel 빌드 로그에서 에러 없이 완료되는지 확인
3. 배포된 URL에서 브랜드 목록, 캡슐 상세, 리뷰 작성 동작 확인
