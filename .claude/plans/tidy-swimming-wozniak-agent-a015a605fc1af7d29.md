# Task 3 - Notion CMS 데이터 조회 함수 구현 계획

## 현재 상태 파악

### `frontend/lib/notion.ts` 현재 내용
- `Client` 인스턴스 생성 (`notion`)
- `BRAND_DATABASE_ID`, `CAPSULE_DATABASE_ID` 상수 정의
- 헬퍼 함수 없음, 조회 함수 없음

### `Brand` 타입 필드
- id, slug, name, description, logoUrl (string|null), websiteUrl (string|null), country, capsuleCount

### `Capsule` 타입 필드
- id, slug, brandId, brandName, brandSlug, name, description, imageUrl (string|null), intensity (IntensityLevel|null), flavorNotes (string[]), isLimitedEdition, isDiscontinued, averageRating (number|null), reviewCount

### SDK 타입 구조 확인 결과 (`@notionhq/client`)
- `PageObjectResponse.properties` → `Record<string, PagePropertyValueWithIdResponse>`
- title: `{ type: "title", title: Array<RichTextItemResponse> }` - `plain_text` 필드는 `RichTextItemResponseCommon`에 있음
- rich_text: `{ type: "rich_text", rich_text: Array<RichTextItemResponse> }`
- number: `{ type: "number", number: number | null }`
- url: `{ type: "url", url: string | null }`
- select: `{ type: "select", select: { id, name, color } | null }`
- multi_select: `{ type: "multi_select", multi_select: Array<{ id, name, color }> }`
- checkbox: `{ type: "checkbox", checkbox: boolean }`
- files: `{ type: "files", files: Array<{ name, type:"file"|"external", file:{url,expiry_time} | external:{url} }> }`
- relation: `{ type: "relation", relation: Array<{ id: IdRequest }> }`
- `isFullPage(page)` 헬퍼 함수가 SDK에 내장 → `PageObjectResponse` 타입 가드로 사용 가능

---

## 최종 코드 구현 내용

### import 구성
```typescript
import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client';
import type { Brand } from '@/types/brand';
import type { Capsule, IntensityLevel } from '@/types/capsule';
```

### 1. 프로퍼티 키 조회 헬퍼 (variation 대응)

```typescript
// 여러 후보 키 중 존재하는 첫 번째 프로퍼티 값을 반환
function getProperty(
  properties: PageObjectResponse['properties'],
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (key in properties) return properties[key];
  }
  return undefined;
}
```

### 2. 타입별 안전 추출 헬퍼 함수들

```typescript
// title / rich_text → string
function getPlainText(property: unknown): string {
  if (!property || typeof property !== 'object') return '';
  const p = property as Record<string, unknown>;
  if (p.type === 'title' && Array.isArray(p.title)) {
    return (p.title[0] as { plain_text?: string })?.plain_text ?? '';
  }
  if (p.type === 'rich_text' && Array.isArray(p.rich_text)) {
    return (p.rich_text[0] as { plain_text?: string })?.plain_text ?? '';
  }
  return '';
}

// number → number | null
function getNumber(property: unknown): number | null {
  if (!property || typeof property !== 'object') return null;
  const p = property as Record<string, unknown>;
  if (p.type === 'number') return typeof p.number === 'number' ? p.number : null;
  return null;
}

// url → string | null
function getUrl(property: unknown): string | null {
  if (!property || typeof property !== 'object') return null;
  const p = property as Record<string, unknown>;
  if (p.type === 'url') return typeof p.url === 'string' ? p.url : null;
  return null;
}

// relation → string[] (id 배열)
function getRelation(property: unknown): string[] {
  if (!property || typeof property !== 'object') return [];
  const p = property as Record<string, unknown>;
  if (p.type === 'relation' && Array.isArray(p.relation)) {
    return (p.relation as Array<{ id: string }>).map((r) => r.id);
  }
  return [];
}

// files → 첫 번째 URL string | null
// Notion files 타입: { type: "file", file: { url, expiry_time } } 또는 { type: "external", external: { url } }
function getFiles(property: unknown): string | null {
  if (!property || typeof property !== 'object') return null;
  const p = property as Record<string, unknown>;
  if (p.type === 'files' && Array.isArray(p.files) && p.files.length > 0) {
    const first = p.files[0] as Record<string, unknown>;
    if (first.type === 'file') {
      return (first.file as { url: string })?.url ?? null;
    }
    if (first.type === 'external') {
      return (first.external as { url: string })?.url ?? null;
    }
  }
  return null;
}

// select → name string | null
function getSelect(property: unknown): string | null {
  if (!property || typeof property !== 'object') return null;
  const p = property as Record<string, unknown>;
  if (p.type === 'select' && p.select && typeof p.select === 'object') {
    return (p.select as { name: string }).name ?? null;
  }
  return null;
}

// multi_select → name string[]
function getMultiSelect(property: unknown): string[] {
  if (!property || typeof property !== 'object') return [];
  const p = property as Record<string, unknown>;
  if (p.type === 'multi_select' && Array.isArray(p.multi_select)) {
    return (p.multi_select as Array<{ name: string }>).map((s) => s.name);
  }
  return [];
}

// checkbox → boolean
function getCheckbox(property: unknown): boolean {
  if (!property || typeof property !== 'object') return false;
  const p = property as Record<string, unknown>;
  if (p.type === 'checkbox') return typeof p.checkbox === 'boolean' ? p.checkbox : false;
  return false;
}
```

### 3. 내부 헬퍼 - 브랜드 ID로 단일 브랜드 조회

```typescript
// notion.pages.retrieve를 사용하여 브랜드 페이지 보강 조회 (캡슐 매핑 시 사용)
async function getBrandById(brandId: string): Promise<Brand | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: brandId });
    if (!isFullPage(page)) return null;
    return mapNotionPageToBrand(page);
  } catch {
    return null;
  }
}
```

### 4. 매핑 함수

#### `mapNotionPageToBrand`
```typescript
function mapNotionPageToBrand(page: PageObjectResponse): Brand {
  const props = page.properties;
  return {
    id: page.id,
    name: getPlainText(getProperty(props, 'Name', 'name', 'Title', 'title')),
    slug: getPlainText(getProperty(props, 'Slug', 'slug')),
    description: getPlainText(getProperty(props, 'Description', 'description')),
    logoUrl: getFiles(getProperty(props, 'Logo', 'logo', 'LogoUrl', 'logo_url')),
    websiteUrl: getUrl(getProperty(props, 'Website', 'website', 'WebsiteUrl', 'website_url')),
    // country는 select 또는 rich_text 둘 다 대응
    country:
      getSelect(getProperty(props, 'Country', 'country')) ??
      getPlainText(getProperty(props, 'Country', 'country')),
    capsuleCount: getNumber(getProperty(props, 'CapsuleCount', 'Capsule Count', 'capsule_count')) ?? 0,
  };
}
```

#### `mapNotionPageToCapsule`
```typescript
async function mapNotionPageToCapsuleWithBrand(page: PageObjectResponse): Promise<Capsule> {
  const props = page.properties;
  const brandIds = getRelation(getProperty(props, 'Brand', 'brand', 'Brands'));
  const brandId = brandIds[0] ?? '';

  // 브랜드 정보 보강 조회
  let brandName = '';
  let brandSlug = '';
  if (brandId) {
    const brand = await getBrandById(brandId);
    if (brand) {
      brandName = brand.name;
      brandSlug = brand.slug;
    }
  }

  const intensity = getNumber(getProperty(props, 'Intensity', 'intensity')) as IntensityLevel | null;

  return {
    id: page.id,
    slug: getPlainText(getProperty(props, 'Slug', 'slug')),
    brandId,
    brandName,
    brandSlug,
    name: getPlainText(getProperty(props, 'Name', 'name', 'Title', 'title')),
    description: getPlainText(getProperty(props, 'Description', 'description')),
    imageUrl: getFiles(getProperty(props, 'Image', 'image', 'ImageUrl', 'image_url')),
    intensity,
    flavorNotes: getMultiSelect(getProperty(props, 'FlavorNotes', 'Flavor Notes', 'flavor_notes', 'Flavor_Notes')),
    isLimitedEdition: getCheckbox(getProperty(props, 'LimitedEdition', 'Limited Edition', 'limited_edition')),
    isDiscontinued: getCheckbox(getProperty(props, 'Discontinued', 'discontinued')),
    averageRating: getNumber(getProperty(props, 'AverageRating', 'Average Rating', 'average_rating')),
    reviewCount: getNumber(getProperty(props, 'ReviewCount', 'Review Count', 'review_count')) ?? 0,
  };
}
```

### 5. 공개 조회 함수

```typescript
// 모든 브랜드 조회
export async function getBrands(): Promise<Brand[]> {
  try {
    const response = await notion.databases.query({
      database_id: BRAND_DATABASE_ID,
    });
    return response.results
      .filter(isFullPage)
      .map(mapNotionPageToBrand);
  } catch (error) {
    console.error('[notion] getBrands 오류:', error);
    return [];
  }
}

// slug로 단일 브랜드 조회
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const response = await notion.databases.query({
      database_id: BRAND_DATABASE_ID,
      filter: {
        property: 'Slug',
        rich_text: { equals: slug },
      },
    });
    const page = response.results.filter(isFullPage)[0];
    return page ? mapNotionPageToBrand(page) : null;
  } catch (error) {
    console.error('[notion] getBrandBySlug 오류:', error);
    return null;
  }
}

// 특정 브랜드의 캡슐 목록 조회
export async function getCapsulesByBrandId(brandId: string): Promise<Capsule[]> {
  try {
    const response = await notion.databases.query({
      database_id: CAPSULE_DATABASE_ID,
      filter: {
        property: 'Brand',
        relation: { contains: brandId },
      },
    });
    const pages = response.results.filter(isFullPage);
    // 브랜드 정보는 1회만 조회해서 모든 캡슐에 적용 (N+1 방지)
    const brand = await getBrandById(brandId);
    return pages.map((page) => {
      const props = page.properties;
      const intensity = getNumber(getProperty(props, 'Intensity', 'intensity')) as IntensityLevel | null;
      return {
        id: page.id,
        slug: getPlainText(getProperty(props, 'Slug', 'slug')),
        brandId,
        brandName: brand?.name ?? '',
        brandSlug: brand?.slug ?? '',
        name: getPlainText(getProperty(props, 'Name', 'name', 'Title', 'title')),
        description: getPlainText(getProperty(props, 'Description', 'description')),
        imageUrl: getFiles(getProperty(props, 'Image', 'image', 'ImageUrl', 'image_url')),
        intensity,
        flavorNotes: getMultiSelect(getProperty(props, 'FlavorNotes', 'Flavor Notes', 'flavor_notes', 'Flavor_Notes')),
        isLimitedEdition: getCheckbox(getProperty(props, 'LimitedEdition', 'Limited Edition', 'limited_edition')),
        isDiscontinued: getCheckbox(getProperty(props, 'Discontinued', 'discontinued')),
        averageRating: getNumber(getProperty(props, 'AverageRating', 'Average Rating', 'average_rating')),
        reviewCount: getNumber(getProperty(props, 'ReviewCount', 'Review Count', 'review_count')) ?? 0,
      } satisfies Capsule;
    });
  } catch (error) {
    console.error('[notion] getCapsulesByBrandId 오류:', error);
    return [];
  }
}

// slug로 단일 캡슐 조회
export async function getCapsuleBySlug(slug: string): Promise<Capsule | null> {
  try {
    const response = await notion.databases.query({
      database_id: CAPSULE_DATABASE_ID,
      filter: {
        property: 'Slug',
        rich_text: { equals: slug },
      },
    });
    const page = response.results.filter(isFullPage)[0];
    if (!page) return null;
    return mapNotionPageToCapsuleWithBrand(page);
  } catch (error) {
    console.error('[notion] getCapsuleBySlug 오류:', error);
    return null;
  }
}
```

---

## 주요 설계 결정

1. **`isFullPage` 사용**: SDK 내장 타입 가드로 `PageObjectResponse` 필터링. 별도 `'properties' in page` 체크 불필요.

2. **N+1 방지 전략**:
   - `getCapsulesByBrandId`: brandId 인수가 이미 주어지므로 `getBrandById` 1회만 호출
   - `getCapsuleBySlug`: 단일 캡슐이므로 `mapNotionPageToCapsuleWithBrand` 내부에서 1회 조회
   - `getBrands`: 브랜드만 조회하므로 추가 조회 없음

3. **country 필드 타입 유연성**: Notion DB에서 select 또는 rich_text 어느 타입으로든 설정 가능. `getSelect ?? getPlainText` 체인으로 둘 다 대응. null이면 빈 문자열 반환.

4. **intensity 타입 캐스팅**: `getNumber`는 `number | null`을 반환하나, `IntensityLevel`은 1~13의 literal union. 런타임 값 검증은 하지 않고 `as IntensityLevel | null` 캐스팅으로 처리 (Notion DB가 소스 오브 트루스).

5. **에러 처리**: 모든 export 함수는 try/catch로 감싸고, 에러는 `console.error`로 로깅 후 `[]` 또는 `null` 반환.

---

## 파일 변경 범위

- **수정**: `/Users/yeboong99/Desktop/claude-yeb-coffee/frontend/lib/notion.ts` (전면 재작성)

---

## 완료 후 작업

- TaskMaster에서 Task 3 상태를 'done'으로 업데이트
