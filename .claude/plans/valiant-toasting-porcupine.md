# Task 15: getAllCapsules() Notion API 전체 조회 함수 구현

## Context
Top 5 랭킹(Task 16 TopCapsules 컴포넌트)을 구현하려면 전체 캡슐 목록이 필요하다.
현재 `notion.ts`에는 브랜드별 조회(`getCapsulesByBrandId`) 또는 단건 조회(`getCapsuleBySlug`)만 존재하고,
전체 목록을 한 번에 가져오는 함수가 없다.
Notion API는 페이지당 최대 100건만 반환하므로, `has_more` / `next_cursor`를 이용한 반복 조회가 필요하다.

## 수정 파일
- `frontend/lib/notion.ts` — `getAllCapsules()` 함수 추가

## 구현 계획

### 재사용할 기존 함수/상수 (notion.ts 내)
| 이름 | 역할 |
|---|---|
| `getBrands()` | 전체 브랜드 목록 조회 (Map 캐싱용) |
| `mapNotionPageToCapsule(page, brandName, brandSlug)` | Notion 페이지 → Capsule 매핑 |
| `getRelation(property)` | relation 프로퍼티에서 id 배열 추출 |
| `getProperty(props, ...keys)` | 유연한 키 매핑 헬퍼 |
| `isFullPage` | Notion API 응답 유효성 검증 |
| `CAPSULE_DATABASE_ID` | 캡슐 DB ID 상수 |
| `notion` | Notion Client 인스턴스 |

### 추가할 함수

```typescript
/** 전체 캡슐 목록 조회 (페이지네이션 반복 조회) */
export async function getAllCapsules(): Promise<Capsule[]> {
  try {
    // N+1 방지: getBrands() 1회 호출 후 Map으로 캐싱
    const brands = await getBrands();
    const brandMap = new Map<string, Brand>();
    for (const brand of brands) {
      brandMap.set(brand.id, brand);
    }

    const allCapsules: Capsule[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: CAPSULE_DATABASE_ID,
        start_cursor: cursor,
        page_size: 100,
      });

      for (const page of response.results.filter(isFullPage)) {
        const brandIds = getRelation(
          getProperty(page.properties, 'Brand', 'brand', 'BrandId', 'brandId'),
        );
        const brandId = brandIds[0] ?? '';
        const brand = brandId ? brandMap.get(brandId) : undefined;
        allCapsules.push(
          mapNotionPageToCapsule(page, brand?.name ?? '', brand?.slug ?? ''),
        );
      }

      hasMore = response.has_more;
      cursor = response.next_cursor ?? undefined;
    }

    return allCapsules;
  } catch (error) {
    console.error('[Notion] getAllCapsules 오류:', error);
    return [];
  }
}
```

### 삽입 위치
`getCapsuleBySlug()` 함수 아래 (파일 맨 끝) 또는 `getCapsulesByBrandId()` 와 `getCapsuleBySlug()` 사이에 추가.

### Import 추가 여부
- `Brand` 타입: 이미 import되어 있는지 확인 후 없으면 추가

## 검증 방법
1. `npm run typecheck` — 타입 에러 없음 확인
2. `npm run build` — 빌드 성공 확인

## 의존성
- Task 15는 다른 Task에 의존하지 않음 (독립 작업)
- Task 16 (TopCapsules 컴포넌트)이 Task 15에 의존

## 실행 에이전트
`nextjs-supabase-dev` 서브에이전트가 구현을 담당한다.
