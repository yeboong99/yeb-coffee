# 이중 평점 시스템 구현 계획

## 실행 주체 구분

| 주체 | 역할 |
|------|------|
| **사용자 직접** | Supabase 대시보드 SQL 실행 |
| **nextjs-supabase-dev 서브에이전트** | 타입, Notion 파싱, Supabase 유틸, 페이지, 컴포넌트 코딩 전반 |

## Context

캡슐 커피 커뮤니티에서 캡슐 평점을 두 가지 소스로 분리 표시:
- **쿠팡 평점**: 운영자가 Notion CMS에 직접 입력하는 외부 검증된 평점 (공신력 있는 데이터)
- **커뮤니티 평점**: 이 서비스 사용자들이 작성한 리뷰의 Supabase 집계 평점

현재 상태:
- `Capsule.averageRating` 필드가 Notion에서 수동 입력되는 평점을 담당
- Supabase `reviews` 테이블에 개별 `rating`(1-5)은 저장되지만 평균 집계 로직 없음
- 두 평점이 UI에서 구분 없이 섞여 있음

## 구현 범위

### 1. [사용자 직접] Supabase View 생성

> ⚠️ **코딩 시작 전에 먼저 완료해야 합니다.**

1. Supabase 대시보드 접속 → SQL Editor 메뉴로 이동
2. 아래 SQL을 붙여넣고 실행:

```sql
CREATE OR REPLACE VIEW capsule_review_stats AS
SELECT
  capsule_slug,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating,
  COUNT(*) AS review_count
FROM reviews
GROUP BY capsule_slug;
```

3. Table Editor에서 `capsule_review_stats` 뷰가 생성되었는지 확인

### 2. [nextjs-supabase-dev] 타입 수정

**`frontend/types/capsule.ts`**
- `averageRating: number | null` → `coupangRating: number | null` 으로 리네임
- `reviewCount: number` 유지 (Notion의 reviewCount는 제거 또는 별도 의미로 사용)

**새 타입 추가** (`frontend/types/review.ts` 또는 `types/index.ts`)
```typescript
export interface ServiceRating {
  avgRating: number | null;
  reviewCount: number;
}
```

### 3. [nextjs-supabase-dev] Notion 파싱 수정

**`frontend/lib/notion.ts`** (L154)
- `averageRating:` → `coupangRating:` 리네임 (Notion 프로퍼티명 `AverageRating`은 유지)

### 4. [nextjs-supabase-dev] Supabase 유틸리티 함수 추가

**`frontend/lib/supabase.ts`** (서버용 클라이언트에 추가)
```typescript
// 단일 캡슐 서비스 평점 조회
export async function getServiceRating(capsuleSlug: string): Promise<ServiceRating>

// 복수 캡슐 서비스 평점 일괄 조회
export async function getServiceRatings(
  capsuleSlugs: string[]
): Promise<Record<string, ServiceRating>>
```
- `capsule_review_stats` 뷰를 쿼리

### 5. [nextjs-supabase-dev] 페이지 수정

**`frontend/app/(main)/brands/[brandSlug]/page.tsx`**
- 캡슐 목록 조회 후 모든 capsuleSlug로 `getServiceRatings()` 일괄 호출
- `CapsuleCard`에 `serviceRating` prop 전달

**`frontend/app/(main)/capsules/[capsuleSlug]/page.tsx`**
- 캡슐 조회 후 `getServiceRating(slug)` 호출
- `CapsuleDetail`에 `serviceRating` prop 전달

### 6. [nextjs-supabase-dev] 컴포넌트 수정

**`frontend/components/capsule/capsule-card.tsx`**
- `serviceRating?: ServiceRating` prop 추가
- UI 변경:
  ```
  현재: ★ 4.2 (12)
  변경:
  쿠팡 ★ 4.2      (capsule.coupangRating)
  커뮤니티 ★ 3.8   (serviceRating.avgRating) 없으면 "아직 없음"
  ```

**`frontend/components/capsule/capsule-detail.tsx`**
- `serviceRating?: ServiceRating` prop 추가
- 상단 그리드 UI 변경 (기존 "평균 평점" 섹션을 두 개로 분리):
  ```
  [강도] [쿠팡 평점] [커뮤니티 평점] [리뷰 수]
  ```
- 포맷: `4.5 / 5` 형태로 표시

### 7. [nextjs-supabase-dev] (선택) review-list.tsx 상단 요약

**`frontend/components/review/review-list.tsx`**
- 리뷰 목록 상단에 커뮤니티 평균 요약 배지 표시 (serviceRating prop 받거나 자체 쿼리)

## 수정 대상 파일 목록

| 파일 | 변경 유형 |
|------|---------|
| `frontend/types/capsule.ts` | `averageRating` → `coupangRating` 리네임 |
| `frontend/types/review.ts` | `ServiceRating` 타입 추가 |
| `frontend/lib/notion.ts` | 필드명 `coupangRating` 으로 수정 |
| `frontend/lib/supabase.ts` | `getServiceRating`, `getServiceRatings` 추가 |
| `frontend/app/(main)/brands/[brandSlug]/page.tsx` | 서비스 평점 일괄 조회 추가 |
| `frontend/app/(main)/capsules/[capsuleSlug]/page.tsx` | 서비스 평점 조회 추가 |
| `frontend/components/capsule/capsule-card.tsx` | 이중 평점 UI |
| `frontend/components/capsule/capsule-detail.tsx` | 이중 평점 UI |
| Supabase SQL (수동) | `capsule_review_stats` 뷰 생성 |

## Verification

### [사용자 직접] 코딩 전 사전 확인
- [ ] Supabase SQL Editor에서 View 생성 완료

### [nextjs-supabase-dev 완료 후 사용자 확인]
1. `pnpm dev` 후 `/brands/{brandSlug}` 접속 → 카드에 쿠팡/커뮤니티 평점 표시 확인
2. `/capsules/{slug}` 접속 → 상단 그리드에 두 평점 표시 확인
3. 리뷰 없는 캡슐 → 커뮤니티 평점 "아직 없음" 표시 확인
4. TypeScript 타입 에러 없음 (`pnpm build`)
