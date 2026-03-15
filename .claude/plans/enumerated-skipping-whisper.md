# UI 개선 계획 — 테마 색상 / 로고 / 애니메이션 / 인기 게시글 실데이터

## Context

현재 UI가 전체적으로 단조롭고 무채색 계열만 사용 중. 사용자 요청에 따라:
- 라이트 모드에 커피색 배경 도입
- 어두운 초록색 강조 색상 전체 적용
- 서비스 로고 이미지 교체
- 게시글 요소에 hover 애니메이션 통일
- 메인 페이지 인기 게시글 실데이터 연동

작업 주체: **nextjs-ui-markup 서브에이전트**

---

## 작업 범위

### 1. 테마 색상 변경 — `frontend/app/globals.css`

**라이트 모드 (커피색 테마):**
- `--background`: `oklch(0.97 0.015 75)` — 크림/베이지 배경
- `--card`: `oklch(0.99 0.01 75)` — 카드 배경 (약간 따뜻한 흰색)
- `--border`: `oklch(0.87 0.025 70)` — 연한 갈색 테두리
- `--input`: `oklch(0.87 0.025 70)` — 입력창 테두리
- `--muted`: `oklch(0.93 0.02 75)` — 뮤트 배경 (약간의 커피색)
- `--primary`: `oklch(0.32 0.11 148)` — 어두운 초록 강조색
- `--primary-foreground`: `oklch(0.98 0 0)` — 강조색 위 텍스트 (흰색)
- `--ring`: `oklch(0.32 0.11 148)` — 포커스 링도 강조색

**다크 모드 (현재 분위기 유지 + 강조색 교체):**
- 배경/카드/텍스트는 현재값 유지
- `--primary`: `oklch(0.60 0.14 148)` — 다크 모드용 밝은 초록
- `--primary-foreground`: `oklch(0.12 0 0)` — 강조색 위 텍스트 (어두운색)
- `--ring`: `oklch(0.60 0.14 148)`

### 2. 로고 이미지 교체

**파일 복사:**
- `/Users/yeboong99/Downloads/yeb-coffee-logo.png` → `frontend/public/logo.png`

**컴포넌트 수정 — `frontend/components/layout/navbar.tsx`:**
```tsx
// 기존: ☕ 이모지 + "캡슐 커피" 텍스트
// 변경: next/image로 logo.png 표시 (높이 32px)
import Image from "next/image";
<Link href="/" className="mr-8 flex items-center gap-2">
  <Image src="/logo.png" alt="캡슐 커피" width={120} height={32} className="h-8 w-auto" />
</Link>
```

### 3. 강조 색상 전파 — 여러 컴포넌트

강조색(`--primary`)이 이미 `hover:border-primary/50` 등으로 사용 중이므로,
globals.css의 `--primary` 변경으로 전체에 자동 반영됨.

추가 적용 포인트:
- **버튼(Button 컴포넌트)**: shadcn의 variant="default"가 primary 사용 → 자동 반영
- **입력창(Input 컴포넌트)**: `focus-visible:ring-ring` → ring 변수 변경으로 자동 반영
- **카드 테두리**: hover 시 `border-primary/50` → 자동 반영
- **링크/뱃지**: primary 색상 사용 컴포넌트 → 자동 반영

### 4. hover 애니메이션 통일

**수정 파일: `frontend/components/community/post-card.tsx`**

```
현재: hover:border-primary/50 transition-colors
변경: hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200
```
(리스트 레이아웃이므로 `-translate-y-1` 대신 `-translate-y-0.5`로 미세하게)

**수정 파일: `frontend/components/home/popular-posts.tsx`**

```
현재: hover:border-primary/50 transition-colors
변경: hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200
```

### 5. 인기 게시글 실데이터 연동

**수정 파일: `frontend/app/(main)/page.tsx`**
- `createServerSupabaseClient()` import 추가
- posts 테이블에서 `view_count` 내림차순 + 최근 7일 이내 게시글 기준으로 상위 5개 조회
- mapRowToPost 유틸리티는 community/page.tsx의 방식을 그대로 참고
- 조회된 posts를 `<PopularPosts posts={posts} />`로 전달

**수정 파일: `frontend/components/home/popular-posts.tsx`**
- `placeholderPosts` 제거
- `posts: Post[]` props 받도록 인터페이스 변경
- 빈 상태 처리 추가 (게시글 없을 시 안내 메시지)

---

## 수정 대상 파일 목록

| 파일 | 작업 |
|------|------|
| `frontend/app/globals.css` | 라이트/다크 CSS 변수 색상 변경 |
| `frontend/public/logo.png` | 이미지 파일 복사 (신규) |
| `frontend/components/layout/navbar.tsx` | 로고 이미지 교체 |
| `frontend/components/community/post-card.tsx` | hover 애니메이션 추가 |
| `frontend/components/home/popular-posts.tsx` | 애니메이션 + props 방식으로 변경 |
| `frontend/app/(main)/page.tsx` | Supabase 인기 게시글 조회 + PopularPosts props 전달 |

---

## 검증 방법

1. `cd frontend && pnpm dev` 실행
2. 라이트 모드 확인: 배경이 크림/베이지색, 버튼/테두리가 어두운 초록색인지 확인
3. 다크 모드 확인: 기존 분위기 유지되면서 강조색이 초록색인지 확인
4. 네비게이션 바에 로고 이미지 표시 확인
5. 커뮤니티 페이지: 게시글 목록 hover 시 살짝 올라가는 애니메이션 확인
6. 메인 페이지: 인기 게시글 섹션이 실제 DB 데이터 표시 확인

---

## 주의사항

- `frontend/app/(main)/community/page.tsx`의 `mapRowToPost` 패턴을 그대로 재사용 (중복 작성 지양)
- 로고 이미지는 반드시 `public/` 디렉토리에 복사 후 `/logo.png` 경로로 참조
- Tailwind v4 환경이므로 `@theme inline` 블록 내 변수는 건드리지 않고 `:root` 및 `.dark` 블록의 값만 수정
