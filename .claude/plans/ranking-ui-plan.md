# 메인 페이지 UI 개선 플랜

## Context
메인 페이지의 섹션 순서 조정, 랭킹 섹션 타이틀 아이콘 추가, 두 평점 섹션의 시각적 구분 강화를 목적으로 한다.
작업 담당: `nextjs-ui-markup` 서브에이전트

---

## 변경 파일

### 1. `frontend/app/(main)/page.tsx`
**변경 내용:** `<TopCapsules />` 와 `<PopularPosts />` 순서 교체

```tsx
// 변경 전
<BrandShowcase brands={brands} />
<PopularPosts posts={posts} />
<TopCapsules />

// 변경 후
<BrandShowcase brands={brands} />
<TopCapsules />
<PopularPosts posts={posts} />
```

---

### 2. `frontend/components/home/top-capsules.tsx`
**변경 내용 ①: 타이틀 앞에 노란 Trophy 아이콘 추가**

- `Trophy` 아이콘 import 추가 (lucide-react)
- 제목 라인을 flex 컨테이너로 감싸고 아이콘 배치

```tsx
// 변경 전
import Link from 'next/link';
import Image from 'next/image';

// 변경 후
import Link from 'next/link';
import Image from 'next/image';
import { Trophy } from 'lucide-react';
```

```tsx
// 변경 전
<h2 className="text-2xl font-bold mb-8">캡슐 Top 5 랭킹</h2>

// 변경 후
<h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
  <Trophy className="text-yellow-400" size={28} />
  캡슐 Top 5 랭킹
</h2>
```

**변경 내용 ②: 두 평점 섹션 시각적 구분 강화**

각 컬럼을 배경 + 테두리 + 패딩이 있는 카드 스타일로 감싸서 명확히 구분

```tsx
// 변경 전
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* 쿠팡 평점 Top 5 */}
  {coupangTop5 !== null && (
    <div>
      <h3 className="text-lg font-semibold mb-4">쿠팡 평점 Top 5</h3>
      ...
    </div>
  )}
  {/* 서비스 평점 Top 5 */}
  <div>
    <h3 className="text-lg font-semibold mb-4">서비스 평점 Top 5</h3>
    ...
  </div>
</div>

// 변경 후
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* 쿠팡 평점 Top 5 */}
  {coupangTop5 !== null && (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-base font-semibold mb-4 pb-3 border-b">쿠팡 평점 Top 5</h3>
      ...
    </div>
  )}
  {/* 서비스 평점 Top 5 */}
  <div className="rounded-xl border bg-card p-5">
    <h3 className="text-base font-semibold mb-4 pb-3 border-b">서비스 평점 Top 5</h3>
    ...
  </div>
</div>
```

---

## 검증 방법

1. `cd frontend && pnpm dev` 로 로컬 서버 실행
2. 메인 페이지(`http://localhost:3000`) 접속하여 확인:
   - 섹션 순서: HeroSection → BrandShowcase → **TopCapsules** → PopularPosts
   - "캡슐 Top 5 랭킹" 타이틀 앞에 노란 트로피 아이콘 표시
   - 두 평점 컬럼이 카드 형태로 분리되어 시각적으로 구분됨
3. `pnpm run check-all` 로 타입 검사 통과 확인
4. `pnpm run build` 로 빌드 성공 확인
