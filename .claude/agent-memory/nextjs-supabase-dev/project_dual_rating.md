---
name: 이중 평점 시스템
description: CapsuleCard/CapsuleDetail에 쿠팡 평점(Notion)과 커뮤니티 평점(Supabase) 두 가지를 표시하는 아키텍처
type: project
---

캡슐 커피 커뮤니티는 두 가지 평점 출처를 분리해서 표시한다.

- `coupangRating` (Notion `AverageRating` 프로퍼티) → types/capsule.ts `Capsule.coupangRating`
- 커뮤니티 평점 → Supabase `capsule_review_stats` 뷰 (`avg_rating`, `review_count`, `capsule_slug` 컬럼), `ServiceRating` 타입 (types/review.ts)

**Why:** 쿠팡 연동 평점과 자체 커뮤니티 리뷰 평점은 출처가 다르므로 분리 표시.

**How to apply:**
- 페이지 레벨에서 Notion 데이터 조회 후 슬러그 배열로 `getServiceRatings()` 일괄 호출 (N+1 방지)
- 상세 페이지는 `getServiceRating(slug)` 단건 호출
- `CapsuleGrid`는 `serviceRatings: Record<string, ServiceRating>` prop을 받아 각 `CapsuleCard`에 전달
- Supabase 뷰가 없거나 데이터 없으면 `{ avgRating: null, reviewCount: 0 }` 반환 (graceful fallback)
