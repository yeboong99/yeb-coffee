# ROADMAP.md

## 프로젝트 개요

**캡슐 커피 커뮤니티**는 네스프레소, 돌체구스토, 버츄오 등 캡슐 커피 브랜드의 상세 정보를 제공하고, 익명 사용자가 리뷰와 커뮤니티 게시글을 통해 경험을 공유할 수 있는 서비스입니다.

- **CMS**: Notion API (브랜드, 캡슐 데이터 - 읽기 전용)
- **DB**: Supabase PostgreSQL (리뷰, 게시글, 댓글)
- **배포**: Vercel
- **스팸 방지**: Cloudflare Turnstile (CAPTCHA)

현재 MVP 초기 구조가 완료된 상태로, 모든 페이지가 placeholder 데이터로 구현되어 있습니다. 이 로드맵은 placeholder 데이터를 실제 외부 서비스와 연동하여 프로덕션 서비스를 완성하는 과정을 안내합니다.

---

## 현재 상태 (Current State)

### 구현 완료 (작동하는 것)
- 전체 페이지 라우트 구조: 홈, 브랜드 목록, 브랜드별 캡슐 목록, 캡슐 상세, 커뮤니티 목록, 게시글 작성, 게시글 상세
- 모든 UI 컴포넌트: `BrandShowcase`, `BrandGrid`, `CapsuleGrid`, `CapsuleDetail`, `CapsuleSearch`, `IntensityFilter`, `ReviewList`, `ReviewForm`, `PostList`, `PostForm`, `CommentList`, `CommentForm` 등
- API 라우트 뼈대: `GET/POST /api/reviews`, `GET/POST /api/posts`, `GET/POST /api/posts/[postId]/comments`, `POST /api/turnstile`
- Zod 유효성 스키마: `reviewSchema`, `postSchema`, `commentSchema`
- TypeScript 타입 정의: `Brand`, `Capsule`, `Review`, `Post`, `Comment`
- Notion 클라이언트 및 DB ID 상수 (`frontend/lib/notion.ts`)
- Supabase 브라우저/서버 클라이언트 팩토리 (`frontend/lib/supabase.ts`)
- 프론트엔드 fetch 함수: `createReview`, `getReviews`, `createPost`, `getPosts`, `createComment`, `getComments` (`frontend/lib/api.ts`)

### 미완료 (placeholder 상태인 것)
- Notion CMS 연동: 브랜드/캡슐 페이지가 하드코딩된 배열 데이터 사용 중
- Supabase 테이블 미생성: `reviews`, `posts`, `comments` 테이블 없음 - API 라우트는 뼈대만 존재
- Cloudflare Turnstile 미연동: 모든 폼이 `"dev-bypass"` 토큰 하드코딩 중
- 검색/필터 UI 연동 미완료: `CapsuleSearch`, `IntensityFilter` 컴포넌트는 존재하지만 브랜드별 캡슐 목록 페이지에 미적용
- `view_count` 증가 로직 없음: 게시글 상세 조회 시 조회수 카운팅 없음

---

## 목표 상태 (Target State)

모든 placeholder 데이터가 실제 외부 서비스 데이터로 교체되고, 다음 기능이 완전히 작동하는 상태:

1. Notion CMS에서 브랜드/캡슐 데이터를 ISR(revalidate: 3600s)로 조회
2. Supabase에서 리뷰/게시글/댓글 CRUD 완전 연동
3. Cloudflare Turnstile CAPTCHA가 리뷰, 게시글, 댓글 작성 시 실제 검증 수행
4. 캡슐 이름 검색 및 강도 필터 작동
5. 에러 상태, 로딩 상태, 빈 상태(empty state)가 모든 페이지에서 적절히 처리됨
6. Vercel 프로덕션 환경 변수 설정 완료 및 배포 성공

---

## MoSCoW 우선순위

| 우선순위 | 기능 |
|---------|------|
| **Must Have** | Notion CMS 브랜드/캡슐 데이터 연동, Supabase 테이블 생성 및 CRUD 연동, Turnstile 실제 검증 연동 |
| **Should Have** | 캡슐 검색 및 강도 필터 실제 연동, 조회수 카운팅, 에러 핸들링 전반 개선 |
| **Could Have** | 게시글 페이지네이션, 캡슐별 평균 평점 실시간 집계, SEO 메타태그 최적화 |
| **Won't Have (이번 릴리스)** | 로그인/회원가입, 게시글/리뷰 삭제 기능, 관리자 페이지, 이메일 알림 |

---

## 마일스톤 (Milestones)

### Phase 0: 기반 설정 (Foundation Setup)

**기간**: 0.5일
**목표**: 외부 서비스 계정 및 환경 변수 준비, 로컬 개발 환경에서 모든 서비스 접근 가능 확인
**완료 기준**: `pnpm dev` 실행 시 콘솔 에러 없이 로컬 서버가 기동되고, 각 서비스 SDK가 환경 변수를 정상 로드함

#### Tasks

- [ ] **[TASK-P0-01]** Notion Integration 생성 및 브랜드/캡슐 DB에 연동 권한 부여
  - 위치: Notion 웹 설정 (외부 작업)
  - 예상 시간: 30m
  - 완료 기준: Notion API 키 발급 완료, 브랜드 DB와 캡슐 DB에 Integration 연결됨

- [ ] **[TASK-P0-02]** Supabase 프로젝트 생성 및 API 키 확보
  - 위치: Supabase 대시보드 (외부 작업)
  - 예상 시간: 20m
  - 완료 기준: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 확보

- [ ] **[TASK-P0-03]** Cloudflare Turnstile 사이트 등록 및 키 발급
  - 위치: Cloudflare 대시보드 (외부 작업)
  - 예상 시간: 20m
  - 완료 기준: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` 발급 완료

- [ ] **[TASK-P0-04]** `.env.local` 파일 생성 및 모든 환경 변수 설정
  - 파일: `frontend/.env.local` (`.env.local.example` 참고)
  - 예상 시간: 20m
  - 의존성: TASK-P0-01, TASK-P0-02, TASK-P0-03
  - 완료 기준: `frontend/.env.local`에 아래 9개 변수 모두 실제 값으로 설정됨
    ```
    NOTION_API_KEY
    NOTION_BRAND_DATABASE_ID
    NOTION_CAPSULE_DATABASE_ID
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
    NEXT_PUBLIC_TURNSTILE_SITE_KEY
    TURNSTILE_SECRET_KEY
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    ```

#### 위험 요소 (Risks)

- **Notion DB 스키마 불일치**: Notion DB의 실제 프로퍼티명이 코드에서 기대하는 것과 다를 수 있음
  - 완화: Phase 1에서 Notion DB 쿼리 전 프로퍼티 목록을 먼저 조회하여 확인

---

### Phase 1: 데이터 레이어 - Supabase 테이블 생성

**기간**: 0.5일
**목표**: Supabase에 `reviews`, `posts`, `comments` 테이블 생성 및 Row Level Security 설정
**완료 기준**: Supabase SQL 에디터에서 각 테이블에 샘플 데이터 INSERT/SELECT 성공

#### Tasks

- [ ] **[TASK-P1-01]** `reviews` 테이블 생성 SQL 작성 및 실행
  - 위치: Supabase SQL 에디터 (외부 작업)
  - 예상 시간: 30m
  - 의존성: TASK-P0-02
  - 스키마:
    ```sql
    CREATE TABLE reviews (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      capsule_id TEXT NOT NULL,
      capsule_slug TEXT NOT NULL,
      author_nickname TEXT NOT NULL,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ```
  - 완료 기준: 테이블 생성 완료, `capsule_slug` 컬럼에 INDEX 생성

- [ ] **[TASK-P1-02]** `posts` 테이블 생성 SQL 작성 및 실행
  - 위치: Supabase SQL 에디터 (외부 작업)
  - 예상 시간: 30m
  - 의존성: TASK-P0-02
  - 스키마:
    ```sql
    CREATE TABLE posts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('정보공유', '추천', '질문', '잡담')),
      author_nickname TEXT NOT NULL,
      view_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    ```
  - 완료 기준: 테이블 생성 완료, `category` 컬럼에 INDEX 생성

- [ ] **[TASK-P1-03]** `comments` 테이블 생성 SQL 작성 및 실행
  - 위치: Supabase SQL 에디터 (외부 작업)
  - 예상 시간: 30m
  - 의존성: TASK-P1-02 (posts 테이블 선행 필요)
  - 스키마:
    ```sql
    CREATE TABLE comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_nickname TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ```
  - 완료 기준: 테이블 생성 완료, `post_id` 외래키 INDEX 생성

- [ ] **[TASK-P1-04]** `comment_count` 자동 갱신 DB 트리거 생성
  - 위치: Supabase SQL 에디터 (외부 작업)
  - 예상 시간: 30m
  - 의존성: TASK-P1-02, TASK-P1-03
  - 완료 기준: 댓글 INSERT/DELETE 시 `posts.comment_count`가 자동으로 +1/-1 됨
    ```sql
    -- 트리거 함수: 댓글 수 자동 업데이트
    CREATE OR REPLACE FUNCTION update_comment_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_count();
    ```

- [ ] **[TASK-P1-05]** Row Level Security (RLS) 정책 설정
  - 위치: Supabase SQL 에디터 (외부 작업)
  - 예상 시간: 30m
  - 의존성: TASK-P1-01, TASK-P1-02, TASK-P1-03
  - 정책 방향: 모든 테이블 읽기는 anon 허용, 쓰기는 service_role만 허용 (API 라우트에서 service role 키 사용)
  - 완료 기준: anon 키로 SELECT 가능, anon 키로 INSERT 시 403 반환, service_role 키로 INSERT 성공

#### 위험 요소 (Risks)

- **RLS 설정 누락**: anon 키로 INSERT가 가능한 경우 스팸 직접 주입 위험
  - 완화: 테이블 생성 직후 RLS 활성화, Supabase 대시보드에서 검증

---

### Phase 2: 데이터 레이어 - Notion CMS 연동

**기간**: 1일
**목표**: Notion API를 통해 브랜드/캡슐 실데이터를 조회하는 서버 함수 구현, placeholder 데이터 교체
**완료 기준**: 브랜드 목록 페이지와 브랜드별 캡슐 목록 페이지가 Notion 실데이터를 렌더링함

#### Tasks

- [ ] **[TASK-P2-01]** Notion 브랜드 DB 프로퍼티 구조 확인 및 `getBrands()` 함수 구현
  - 파일: `frontend/lib/notion.ts`
  - 예상 시간: 2h
  - 의존성: TASK-P0-04 (환경 변수 설정)
  - 구현 내용:
    - `getBrands(): Promise<Brand[]>` 함수 구현
    - Notion DB 쿼리 → `Brand` 타입으로 변환하는 매핑 함수 `mapNotionPageToBrand()` 구현
    - ISR 적용: `next: { revalidate: 3600 }` 옵션 사용
  - 완료 기준: 함수 호출 시 Notion DB의 실제 브랜드 데이터가 `Brand[]` 형태로 반환됨

- [ ] **[TASK-P2-02]** Notion 캡슐 DB 프로퍼티 구조 확인 및 `getCapsulesByBrandId()` 함수 구현
  - 파일: `frontend/lib/notion.ts`
  - 예상 시간: 2h
  - 의존성: TASK-P2-01
  - 구현 내용:
    - `getCapsulesByBrandId(brandId: string): Promise<Capsule[]>` 함수 구현
    - `getCapsuleBySlug(slug: string): Promise<Capsule | null>` 함수 구현
    - `mapNotionPageToCapsule()` 매핑 함수 구현 (강도, flavor_notes 등 필드 포함)
  - 완료 기준: brandId 기준 캡슐 목록 조회 및 slug 기준 단건 조회 정상 작동

- [ ] **[TASK-P2-03]** `getBrandBySlug()` 함수 구현
  - 파일: `frontend/lib/notion.ts`
  - 예상 시간: 1h
  - 의존성: TASK-P2-01
  - 완료 기준: slug로 단일 브랜드 조회 성공

- [ ] **[TASK-P2-04]** 브랜드 목록 페이지 Notion 실데이터 연동
  - 파일: `frontend/app/(main)/brands/page.tsx`
  - 예상 시간: 1h
  - 의존성: TASK-P2-01
  - 작업 내용: `placeholderBrands` 배열 제거 → `getBrands()` 호출로 교체, `export const revalidate = 3600` 추가
  - 완료 기준: 브랜드 목록 페이지에서 Notion 실데이터 브랜드 카드 렌더링

- [ ] **[TASK-P2-05]** 브랜드별 캡슐 목록 페이지 Notion 실데이터 연동
  - 파일: `frontend/app/(main)/brands/[brandSlug]/page.tsx`
  - 예상 시간: 1.5h
  - 의존성: TASK-P2-02, TASK-P2-03
  - 작업 내용: `placeholderBrands`, `placeholderCapsules` 제거 → `getBrandBySlug()`, `getCapsulesByBrandId()` 호출로 교체
  - 완료 기준: 특정 브랜드 페이지 진입 시 해당 브랜드의 캡슐 목록 실데이터 렌더링, 없는 slug 접근 시 `notFound()` 정상 호출

- [ ] **[TASK-P2-06]** 캡슐 상세 페이지 Notion 실데이터 연동
  - 파일: `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`
  - 예상 시간: 1.5h
  - 의존성: TASK-P2-02
  - 작업 내용: `placeholderCapsules` 제거 → `getCapsuleBySlug()` 호출로 교체 (리뷰는 Phase 3에서 처리)
  - 완료 기준: 캡슐 상세 페이지에서 실제 캡슐 정보 렌더링

- [ ] **[TASK-P2-07]** 홈 페이지 `BrandShowcase` 컴포넌트 실데이터 연동
  - 파일: `frontend/components/home/brand-showcase.tsx` 또는 `frontend/app/(main)/page.tsx`
  - 예상 시간: 1h
  - 의존성: TASK-P2-01
  - 작업 내용: `BrandShowcase` 내 placeholder 배열 제거, 홈 페이지 서버 컴포넌트에서 `getBrands()` 호출 후 props 전달
  - 완료 기준: 홈 페이지 인기 브랜드 섹션이 Notion 실데이터 3개를 표시

#### 위험 요소 (Risks)

- **Notion API Rate Limit**: 무료 플랜은 초당 3 요청 제한
  - 완화: ISR 캐싱(revalidate: 3600)으로 요청 빈도 최소화, 빌드 타임에 `generateStaticParams` 활용 검토
- **Notion 프로퍼티명 불일치**: 실제 DB 프로퍼티명이 코드 가정과 다를 수 있음 (예: "Brand ID" vs "brand_id")
  - 완화: TASK-P2-01 시작 전 Notion DB를 직접 열어 프로퍼티명 목록 확인

---

### Phase 3: 데이터 레이어 - Supabase CRUD 연동

**기간**: 1일
**목표**: 캡슐 상세 페이지의 리뷰, 커뮤니티 게시글/댓글이 Supabase 실데이터와 연동됨
**완료 기준**: 로컬에서 리뷰 작성 → Supabase DB에 행 생성 → 페이지 새로고침 시 리뷰 목록에 반영 확인

#### Tasks

- [ ] **[TASK-P3-01]** 캡슐 상세 페이지 리뷰 목록 Supabase 연동 (GET)
  - 파일: `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`
  - 예상 시간: 1h
  - 의존성: TASK-P1-01 (reviews 테이블), TASK-P2-06
  - 작업 내용: `placeholderReviews` 제거 → `getReviews(capsuleSlug)` fetch 함수 호출 또는 서버 컴포넌트에서 Supabase 직접 쿼리
  - 완료 기준: 빈 리뷰 목록 또는 DB에 있는 리뷰가 렌더링됨

- [ ] **[TASK-P3-02]** 리뷰 작성 API 라우트 실데이터 연동 검증 (POST)
  - 파일: `frontend/app/api/reviews/route.ts`
  - 예상 시간: 30m
  - 의존성: TASK-P1-01, TASK-P0-04
  - 작업 내용: 이미 구현된 API 라우트가 실제 테이블과 연동되는지 검증 (Supabase 테이블 컬럼명과 INSERT 필드명 일치 확인)
  - 완료 기준: `POST /api/reviews` 요청 시 Supabase `reviews` 테이블에 실제 행 생성

- [ ] **[TASK-P3-03]** 커뮤니티 게시글 목록 페이지 Supabase 연동 (GET)
  - 파일: `frontend/app/(main)/community/page.tsx`
  - 예상 시간: 1h
  - 의존성: TASK-P1-02
  - 작업 내용: `placeholderPosts` 배열 제거, React Query 또는 서버 컴포넌트에서 `GET /api/posts` 호출
  - 완료 기준: 커뮤니티 페이지에서 Supabase 실데이터 게시글 목록 렌더링 (빈 상태 포함)

- [ ] **[TASK-P3-04]** 게시글 작성 API 라우트 실데이터 연동 검증 (POST)
  - 파일: `frontend/app/api/posts/route.ts`
  - 예상 시간: 30m
  - 의존성: TASK-P1-02, TASK-P0-04
  - 작업 내용: `POST /api/posts` 요청 시 실제 테이블에 INSERT 되는지 검증
  - 완료 기준: 게시글 작성 후 커뮤니티 목록에서 새 게시글 확인 가능

- [ ] **[TASK-P3-05]** 게시글 상세 페이지 Supabase 연동 (GET)
  - 파일: `frontend/app/(main)/community/[postId]/page.tsx`
  - 예상 시간: 1h
  - 의존성: TASK-P1-02, TASK-P1-03
  - 작업 내용: `placeholderPosts`, `placeholderComments` 제거 → `GET /api/posts/{postId}` (신규 엔드포인트 필요) 또는 서버 컴포넌트에서 Supabase 직접 쿼리
  - 완료 기준: 게시글 상세 페이지에서 실제 게시글 본문 및 댓글 목록 렌더링

  > **주의**: 현재 `GET /api/posts/[postId]` 라우트가 존재하지 않음. 서버 컴포넌트에서 Supabase를 직접 쿼리하거나 신규 API 라우트 `frontend/app/api/posts/[postId]/route.ts` 생성 필요. [PRD 명확화 필요: 단건 게시글 조회 방식]

- [ ] **[TASK-P3-06]** 댓글 작성 API 라우트 실데이터 연동 검증 (POST)
  - 파일: `frontend/app/api/posts/[postId]/comments/route.ts`
  - 예상 시간: 30m
  - 의존성: TASK-P1-03
  - 완료 기준: 댓글 작성 후 Supabase `comments` 테이블에 행 생성, `posts.comment_count` 자동 갱신 확인

- [ ] **[TASK-P3-07]** 게시글 조회수(`view_count`) 증가 로직 구현
  - 파일: 게시글 상세 서버 컴포넌트 또는 `frontend/app/api/posts/[postId]/route.ts`
  - 예상 시간: 1h
  - 의존성: TASK-P3-05
  - 작업 내용: 게시글 상세 페이지 방문 시 Supabase `UPDATE posts SET view_count = view_count + 1` 실행
  - 완료 기준: 게시글 상세 접근마다 `view_count` 1씩 증가

#### 위험 요소 (Risks)

- **컬럼명 snake_case vs camelCase 불일치**: Supabase는 snake_case 반환, TypeScript 타입은 camelCase
  - 완화: API 라우트 응답 시 명시적 매핑 함수 추가 (예: `snake_to_camel` 변환)

---

### Phase 4: 스팸 방지 - Cloudflare Turnstile 연동

**기간**: 0.5일
**목표**: 리뷰, 게시글, 댓글 작성 폼에 Turnstile 위젯 연동 및 서버사이드 토큰 검증 실제 작동
**완료 기준**: 폼 제출 전 Turnstile 위젯이 렌더링되고, 위젯 미완료 시 제출 불가, 실제 토큰이 서버사이드 검증됨

#### Tasks

- [ ] **[TASK-P4-01]** Turnstile React 위젯 컴포넌트 구현
  - 파일: `frontend/components/ui/turnstile-widget.tsx` (신규 파일)
  - 예상 시간: 1.5h
  - 의존성: TASK-P0-03 (Turnstile 키 발급)
  - 구현 내용:
    - `@marsidev/react-turnstile` 패키지 설치 또는 Cloudflare 공식 스크립트 직접 사용
    - `sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}` 주입
    - `onSuccess(token: string)` 콜백으로 토큰 전달
    - `"use client"` 지시어 필수
  - 완료 기준: 위젯이 화면에 렌더링되고 사용자 인터랙션 후 유효한 토큰 문자열 반환

- [ ] **[TASK-P4-02]** `ReviewForm` 컴포넌트에 Turnstile 위젯 연동
  - 파일: `frontend/components/review/review-form.tsx`
  - 예상 시간: 1h
  - 의존성: TASK-P4-01
  - 작업 내용: `"dev-bypass"` 하드코딩 제거 → `TurnstileWidget`의 `onSuccess` 콜백으로 받은 토큰을 `turnstileToken` state에 저장 → `createReview()` 호출 시 실제 토큰 전달, Turnstile 미완료 시 제출 버튼 disabled
  - 완료 기준: 위젯 미완료 시 제출 불가, 완료 후 실제 토큰이 API 라우트로 전달됨

- [ ] **[TASK-P4-03]** `PostForm` 컴포넌트에 Turnstile 위젯 연동
  - 파일: `frontend/components/community/post-form.tsx`
  - 예상 시간: 1h
  - 의존성: TASK-P4-01
  - 작업 내용: TASK-P4-02와 동일한 패턴으로 `"dev-bypass"` 교체
  - 완료 기준: 게시글 작성 폼에서 Turnstile 위젯 동작 확인

- [ ] **[TASK-P4-04]** `CommentForm` 컴포넌트에 Turnstile 위젯 연동
  - 파일: `frontend/components/community/comment-form.tsx`
  - 예상 시간: 1h
  - 의존성: TASK-P4-01
  - 작업 내용: TASK-P4-02와 동일한 패턴으로 `"dev-bypass"` 교체
  - 완료 기준: 댓글 작성 폼에서 Turnstile 위젯 동작 확인

- [ ] **[TASK-P4-05]** 서버사이드 Turnstile 검증 로직 검증
  - 파일: `frontend/app/api/reviews/route.ts`, `frontend/app/api/posts/route.ts`, `frontend/app/api/posts/[postId]/comments/route.ts`
  - 예상 시간: 30m
  - 의존성: TASK-P4-02, TASK-P4-03, TASK-P4-04, TASK-P0-03
  - 작업 내용: 이미 구현된 Turnstile 검증 로직이 실제 Secret Key로 작동하는지 E2E 확인
  - 완료 기준: 유효한 토큰으로 POST 성공, 잘못된 토큰으로 POST 시 400 에러 반환

#### 위험 요소 (Risks)

- **Turnstile 위젯 라이브러리 미설치**: 현재 `package.json`에 Turnstile 클라이언트 라이브러리 없음
  - 완화: `@marsidev/react-turnstile` 설치 또는 Cloudflare 공식 스크립트 태그 방식 사용 중 선택

---

### Phase 5: UX 완성 - 검색, 필터, 빈 상태

**기간**: 0.5일
**목표**: 캡슐 검색/강도 필터 실제 연동, 모든 페이지 빈 상태(empty state) 및 로딩 상태 처리
**완료 기준**: 브랜드별 캡슐 목록 페이지에서 검색어 입력 시 필터링, 강도 선택 시 필터링 작동

#### Tasks

- [ ] **[TASK-P5-01]** 브랜드별 캡슐 목록 페이지에 `CapsuleSearch` + `IntensityFilter` 연동
  - 파일: `frontend/app/(main)/brands/[brandSlug]/page.tsx`
  - 예상 시간: 1.5h
  - 의존성: TASK-P2-05
  - 작업 내용:
    - 페이지를 Client Component로 전환하거나 검색/필터 UI를 별도 Client Component로 분리
    - `CapsuleSearch`의 `onSearch` 콜백으로 캡슐 이름 필터링
    - `IntensityFilter`의 `onSelect` 콜백으로 강도 필터링
    - 두 필터의 AND 조건 적용
  - 완료 기준: 검색어 입력 및 강도 선택 시 캡슐 목록이 실시간 필터링됨

- [ ] **[TASK-P5-02]** 커뮤니티 카테고리 탭 필터링 React Query 또는 서버 액션으로 교체
  - 파일: `frontend/app/(main)/community/page.tsx`
  - 예상 시간: 1.5h
  - 의존성: TASK-P3-03
  - 작업 내용: 카테고리 탭 전환 시 클라이언트 필터링이 아닌 API 재요청 또는 URL searchParams 방식으로 전환
  - 완료 기준: 카테고리별 탭 전환 시 해당 카테고리의 Supabase 데이터만 렌더링

- [ ] **[TASK-P5-03]** 빈 상태(empty state) UI 전체 점검 및 구현
  - 파일: `frontend/components/capsule/capsule-grid.tsx`, `frontend/components/review/review-list.tsx`, `frontend/components/community/post-list.tsx`, `frontend/components/community/comment-list.tsx`
  - 예상 시간: 1h
  - 완료 기준: 데이터가 없는 경우 각 컴포넌트에서 적절한 안내 문구 표시

- [ ] **[TASK-P5-04]** 에러 상태 처리 및 `error.tsx` 완성
  - 파일: `frontend/app/(main)/error.tsx`
  - 예상 시간: 1h
  - 완료 기준: API 에러 발생 시 사용자에게 에러 메시지와 재시도 버튼 표시

---

### Phase 6: 성능 & 배포

**기간**: 0.5일
**목표**: Vercel 프로덕션 환경 변수 설정, 빌드 성공, 프로덕션 URL에서 전체 기능 동작 확인
**완료 기준**: `vercel --prod` 배포 성공, 프로덕션 URL에서 Notion 실데이터 렌더링 및 리뷰/게시글 작성 성공

#### Tasks

- [ ] **[TASK-P6-01]** Vercel 프로젝트 환경 변수 설정
  - 위치: Vercel 대시보드 → Settings → Environment Variables (외부 작업)
  - 예상 시간: 20m
  - 의존성: TASK-P0-01 ~ TASK-P0-03
  - 작업 내용: 환경 변수 체크리스트의 모든 변수를 Production, Preview, Development 환경에 설정, `NEXT_PUBLIC_BASE_URL`은 실제 Vercel 도메인으로 설정
  - 완료 기준: Vercel 대시보드에서 9개 환경 변수 모두 설정 완료

- [ ] **[TASK-P6-02]** Cloudflare Turnstile 허용 도메인에 Vercel 도메인 추가
  - 위치: Cloudflare 대시보드 (외부 작업)
  - 예상 시간: 10m
  - 의존성: TASK-P6-01
  - 완료 기준: Vercel 배포 도메인이 Turnstile 허용 도메인 목록에 포함

- [ ] **[TASK-P6-03]** TypeScript 빌드 에러 및 ESLint 경고 점검
  - 위치: `frontend/` 디렉토리
  - 예상 시간: 1h
  - 작업 내용: `pnpm build` 실행 후 에러 모두 해결
  - 완료 기준: `pnpm build` 에러 0건

- [ ] **[TASK-P6-04]** Vercel 배포 및 프로덕션 E2E 검증
  - 위치: Vercel 대시보드 또는 `vercel` CLI
  - 예상 시간: 1h
  - 의존성: TASK-P6-01, TASK-P6-02, TASK-P6-03
  - 완료 기준: 사용자 여정 전체 경로 (홈 → 브랜드 → 캡슐 상세 → 리뷰 작성 → 커뮤니티 → 게시글 작성 → 댓글 작성) 프로덕션에서 정상 동작

- [ ] **[TASK-P6-05]** 주요 페이지 SEO 메타태그 설정
  - 파일: `frontend/app/(main)/brands/[brandSlug]/page.tsx`, `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`
  - 예상 시간: 1h
  - 작업 내용: Next.js `generateMetadata()` 함수로 페이지별 title, description 설정
  - 완료 기준: 브랜드 페이지와 캡슐 상세 페이지에서 고유한 메타태그 렌더링

#### 위험 요소 (Risks)

- **ISR 캐시로 인한 신규 Notion 데이터 지연**: `revalidate: 3600`으로 최대 1시간 지연 가능
  - 완화: Vercel의 On-Demand ISR 또는 `revalidatePath` API 활용 방안 검토 (포스트-MVP)

---

## 기술 부채 & TODO

| 항목 | 심각도 | 설명 |
|------|--------|------|
| `GET /api/posts/[postId]` 라우트 미존재 | 높음 | 게시글 상세 페이지 서버 연동 시 단건 조회 방식 결정 필요 |
| Turnstile 클라이언트 라이브러리 미설치 | 높음 | `package.json`에 Turnstile React 패키지 없음, Phase 4 전 설치 필요 |
| camelCase ↔ snake_case 매핑 없음 | 중간 | Supabase 응답을 TypeScript 타입으로 변환하는 명시적 매핑 함수 필요 |
| `view_count` 증가 로직 없음 | 중간 | 현재 게시글 상세 조회 시 조회수 미증가 |
| 커뮤니티 카테고리 필터링이 클라이언트 사이드 | 낮음 | 데이터가 많아지면 성능 문제 가능, URL searchParams 방식 전환 권장 |
| `CapsuleSearch`가 캡슐 목록 페이지에 미적용 | 낮음 | 컴포넌트는 존재하지만 `[brandSlug]/page.tsx`에 연결 안됨 |
| `averageRating`이 Notion에서 오는지 Supabase 집계인지 불명확 | 낮음 | `Capsule.averageRating`의 데이터 소스 결정 필요 [PRD 명확화 필요] |

---

## 환경 변수 체크리스트

| 변수명 | 용도 | 환경 | 현재 상태 |
|--------|------|------|-----------|
| `NOTION_API_KEY` | Notion API 인증 | 서버 전용 | 미설정 |
| `NOTION_BRAND_DATABASE_ID` | Notion 브랜드 DB ID | 서버 전용 | 미설정 |
| `NOTION_CAPSULE_DATABASE_ID` | Notion 캡슐 DB ID | 서버 전용 | 미설정 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 공개 (클라이언트 포함) | 미설정 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (읽기) | 공개 (클라이언트 포함) | 미설정 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (쓰기) | 서버 전용 | 미설정 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 사이트 키 (위젯) | 공개 (클라이언트 포함) | 미설정 |
| `TURNSTILE_SECRET_KEY` | Turnstile 서버 검증 키 | 서버 전용 | 미설정 |
| `NEXT_PUBLIC_BASE_URL` | API fetch 기본 URL | 공개 | 로컬: `http://localhost:3000` |

> `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 번들에 포함되면 안 됩니다. `NEXT_PUBLIC_` 접두사 없이 선언되어 있어 현재 올바르게 설정되어 있습니다.

---

## 외부 서비스 설정 체크리스트

### Notion
- [ ] Notion 계정에서 Integration 생성 (`Settings > Connections > Develop or manage integrations`)
- [ ] 브랜드 DB 페이지에 Integration 연결 (`Share > Invite`)
- [ ] 캡슐 DB 페이지에 Integration 연결 (`Share > Invite`)
- [ ] 브랜드 DB ID 확인 (DB 페이지 URL에서 추출)
- [ ] 캡슐 DB ID 확인 (DB 페이지 URL에서 추출)
- [ ] 브랜드 DB 프로퍼티명 목록 확인: `name`, `slug`, `description`, `logo_url`, `website_url`, `country`
- [ ] 캡슐 DB 프로퍼티명 목록 확인: `name`, `slug`, `brand_id`, `intensity`, `flavor_notes`, `image_url`, `is_limited`

### Supabase
- [ ] 프로젝트 생성 (리전: ap-northeast-2 Seoul 권장)
- [ ] `reviews` 테이블 생성 완료
- [ ] `posts` 테이블 생성 완료
- [ ] `comments` 테이블 생성 완료
- [ ] `comment_count` 자동 갱신 트리거 생성 완료
- [ ] RLS 정책 설정 완료 (anon 읽기 허용, 쓰기는 service_role만)
- [ ] API URL 및 anon key, service role key 확보

### Cloudflare Turnstile
- [ ] Cloudflare 계정 생성 (무료 가능)
- [ ] Turnstile 사이트 등록 (`turnstile.cloudflare.com`)
- [ ] 허용 도메인 등록: `localhost`, Vercel 배포 도메인
- [ ] Site Key (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) 확보
- [ ] Secret Key (`TURNSTILE_SECRET_KEY`) 확보

### Vercel
- [ ] 프로젝트 Git 연동 (`frontend/` 디렉토리를 Root Directory로 설정)
- [ ] 9개 환경 변수 모두 설정
- [ ] `NEXT_PUBLIC_BASE_URL`을 Vercel 배포 도메인으로 설정
- [ ] 빌드 커맨드: `pnpm build`, 출력 디렉토리: `.next` 확인

---

## 성공 지표 (Success Metrics)

### 기능적 완료 기준
- [ ] 브랜드 목록 페이지에서 Notion 실데이터 브랜드 1개 이상 렌더링
- [ ] 브랜드별 캡슐 목록 페이지에서 실데이터 캡슐 1개 이상 렌더링
- [ ] 캡슐 상세 페이지에서 리뷰 작성 후 목록에 즉시 반영
- [ ] 커뮤니티 게시글 작성 후 목록에서 확인 가능
- [ ] 게시글 상세에서 댓글 작성 후 목록에 즉시 반영
- [ ] Turnstile 위젯 미완료 시 폼 제출 불가
- [ ] 잘못된 Turnstile 토큰으로 API 요청 시 400 에러 반환
- [ ] Vercel 프로덕션 배포 성공 (`pnpm build` 에러 0건)

### 비기능적 완료 기준
- [ ] Notion 데이터 페이지 ISR 캐시 적용 (revalidate: 3600)
- [ ] Supabase RLS로 anon 키 직접 쓰기 차단
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 미포함 확인

---

## 변경 이력 (Changelog)

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 2026-03-12 | 1.0.0 | 초기 로드맵 생성 - MVP PRD 기반 6개 Phase 정의 | prd-to-roadmap agent |
