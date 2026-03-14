# UI 개선: 강도 뱃지 · 카드 이미지 패딩 · 호버 애니메이션

**실행 주체: nextjs-supabase-dev 에이전트**

---

## Context

이전 작업으로 캡슐 이미지와 Flavor Notes가 표시되기 시작했으나 UI 품질 개선이 필요:
1. **강도 표시** — 현재 단순 텍스트(`강도 5`). 색상 및 레벨 막대 뱃지로 시각화 필요
2. **캡슐 카드 이미지** — 현재 이미지가 카드 테두리에 붙음(`rounded-t-lg`). 카드 내부 패딩 안에 이미지 표시 필요
3. **호버 애니메이션** — 현재 테두리 색상 변경만 있음. 카드가 부드럽게 떠오르는 lift 효과 필요
4. **코드 중복** — `BrandShowcase`가 `BrandCard` 코드를 인라인으로 복사하여 사용 중 → `BrandCard` 컴포넌트 재사용으로 해결

---

## 수정 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `frontend/components/capsule/intensity-badge.tsx` | **신규** — 공유 강도 뱃지 컴포넌트 |
| `frontend/components/capsule/capsule-card.tsx` | 이미지 패딩, IntensityBadge 사용, 배치 변경, 호버 애니메이션 |
| `frontend/components/capsule/capsule-detail.tsx` | IntensityBadge 사용 |
| `frontend/components/brand/brand-card.tsx` | 호버 애니메이션 추가 |
| `frontend/components/home/brand-showcase.tsx` | BrandCard 재사용으로 중복 제거, 호버는 BrandCard에서 상속 |

---

## 구현 계획

### Step 1: `IntensityBadge` 컴포넌트 신규 생성

**파일:** `frontend/components/capsule/intensity-badge.tsx`

강도 수치를 받아 색상+막대 뱃지로 렌더링하는 공유 컴포넌트.

**레벨 규칙:**
| 범위 | 뱃지 색 | 막대1 | 막대2 | 막대3 |
|------|---------|-------|-------|-------|
| 1~6  | 초록 | `bg-green-600` | `bg-green-200` | `bg-green-200` |
| 7~9  | 주황 | `bg-orange-600` | `bg-orange-600` | `bg-orange-300` |
| 10~13 | 빨강 | `bg-red-600` | `bg-red-600` | `bg-red-600` |

**렌더링 형식:** `강도 [▌][▌][▌] 5`
- 세로 막대: `w-[3px] h-3 rounded-sm` inline-block 요소 3개
- 폰트 크기: `text-xs` (flavorNotes 뱃지와 동일)
- 뱃지 외형: shadcn `Badge` variant="outline"과 동일한 `rounded-full border px-2.5 py-0.5` 스타일을 수동 적용 (내부 레이아웃 커스텀 필요하므로 shadcn Badge 래퍼 미사용)
- `cn()` 유틸(`frontend/lib/utils.ts`)을 활용해 조건부 클래스 적용

```tsx
// 구조 예시
<span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', colorClasses)}>
  강도
  <span className="inline-flex items-center gap-0.5 mx-0.5">
    {bars.map((barColor, i) => (
      <span key={i} className={cn('inline-block w-[3px] h-3 rounded-sm', barColor)} />
    ))}
  </span>
  {intensity}
</span>
```

---

### Step 2: `CapsuleCard` 수정

**파일:** `frontend/components/capsule/capsule-card.tsx`

**① 이미지 패딩 (카드 테두리에 붙지 않게)**

```tsx
// Before (테두리에 붙음)
<div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-lg">
  <img ... />
</div>

// After (카드 내부에 패딩 있는 이미지)
<div className="p-3 pb-0">
  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
    <img ... />
  </div>
</div>
```

**② 강도 표시 교체 + 배치 변경**

기존: `CardContent` 하단의 flex row에 인라인 텍스트로 강도 표시
변경: `IntensityBadge` 컴포넌트로 교체 + flavorNotes 뱃지 한 칸 위의 독립 행에 배치

```tsx
// ContentArea 구조
<CardContent className="pt-0">
  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>

  {/* 강도: flavorNotes 뱃지 바로 위 독립 행 */}
  {capsule.intensity !== null && (
    <div className="mb-1.5">
      <IntensityBadge intensity={capsule.intensity} />
    </div>
  )}

  {/* Flavor Notes */}
  {capsule.flavorNotes.length > 0 && (
    <div className="flex flex-wrap gap-1 mb-3">
      {capsule.flavorNotes.slice(0, 3).map(...)}
    </div>
  )}

  {/* 평점 (하단) */}
  {capsule.averageRating !== null && (
    <span className="text-sm text-muted-foreground">
      ★ {capsule.averageRating.toFixed(1)} ({capsule.reviewCount})
    </span>
  )}
</CardContent>
```

**③ 호버 애니메이션**

```tsx
// Before
<Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">

// After
<Card className="hover:border-primary/50 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
```

---

### Step 3: `CapsuleDetail` 수정

**파일:** `frontend/components/capsule/capsule-detail.tsx`

`IntensityBadge` import 추가 후, 기존 강도 표시 섹션(`<p className="font-semibold">{capsule.intensity} / 13</p>`) 을 `IntensityBadge`로 교체.

```tsx
// Before
<div className="space-y-1">
  <p className="text-sm text-muted-foreground">강도</p>
  <p className="font-semibold">{capsule.intensity} / 13</p>
</div>

// After
<div className="space-y-1">
  <p className="text-sm text-muted-foreground">강도</p>
  <IntensityBadge intensity={capsule.intensity} />
</div>
```

---

### Step 4: `BrandCard` 호버 애니메이션 추가

**파일:** `frontend/components/brand/brand-card.tsx`

```tsx
// Before
<Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">

// After
<Card className="hover:border-primary/50 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
```

---

### Step 5: `BrandShowcase` 중복 제거

**파일:** `frontend/components/home/brand-showcase.tsx`

현재 인라인으로 `Card` 마크업을 복사해 사용 중 → `BrandCard` 컴포넌트를 import하여 재사용.

```tsx
// Before (각 brand마다 인라인 Card 마크업)
{brands.map((brand) => (
  <Link key={brand.slug} href={`/brands/${brand.slug}`}>
    <Card className="hover:border-primary/50 transition-colors ...">
      <CardHeader>...</CardHeader>
    </Card>
  </Link>
))}

// After
import { BrandCard } from "@/components/brand/brand-card";
...
{brands.map((brand) => (
  <BrandCard key={brand.slug} brand={brand} />
))}
```

호버 애니메이션은 `BrandCard`에서 상속되므로 별도 처리 불필요.

---

## 검증 방법

1. `/brands/nespresso` 접속 → 캡슐 카드 이미지가 카드 내부 패딩 안에 표시되는지 확인 (테두리에 붙지 않음)
2. 캡슐 카드에서 강도 뱃지(색상+막대)가 flavorNotes 뱃지 위 행에 표시되는지 확인
3. 강도 범위별 색상 확인: 1~6=초록, 7~9=주황, 10~13=빨강
4. `/capsules/[slug]` → CapsuleDetail에서 강도 뱃지 표시 확인
5. `/` (홈), `/brands`, `/brands/nespresso` 에서 카드 호버 시 lift 애니메이션 확인
6. `BrandShowcase`가 `BrandCard`를 재사용하는지 코드 확인 (중복 없음)
