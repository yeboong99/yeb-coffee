# Task 3: Notion CMS 데이터 조회 함수 구현

## Context
MVP 초기화가 완료된 상태로, 현재 `frontend/lib/notion.ts`는 클라이언트 인스턴스와 DB ID 상수만 존재합니다.
브랜드/캡슐 페이지들이 placeholder 데이터를 사용하고 있어 실제 Notion CMS 연동을 위한 조회 함수가 필요합니다.
이 작업은 Task 5(페이지 연동)의 전제 조건입니다.

## 수정 파일
- `frontend/lib/notion.ts` (단일 파일 수정)

## 현재 타입 구조 (참고)

**Brand:**
```ts
{ id, slug, name, description, logoUrl, websiteUrl, country, capsuleCount }
```

**Capsule:**
```ts
{ id, slug, brandId, brandName, brandSlug, name, description, imageUrl,
  intensity (IntensityLevel | null), flavorNotes, isLimitedEdition, isDiscontinued,
  averageRating, reviewCount }
```

## 구현 계획

### 1. Notion 프로퍼티 헬퍼 함수 (내부 사용)
- `getProperty(props, ...keys)` — 프로퍼티명 variation 탐색 (Slug/slug/SLUG 등)
- `getPlainText(property)` — title/rich_text → string
- `getNumber(property)` — number → number | null
- `getUrl(property)` — url → string | null
- `getRelation(property)` — relation → string[] (id 배열)
- `getFiles(property)` — files → string | null (첫 번째 URL)
- `getSelect(property)` — select → string | null
- `getMultiSelect(property)` — multi_select → string[] (name 배열)
- `getCheckbox(property)` — checkbox → boolean

### 2. 매핑 함수 (내부 사용)
- `mapNotionPageToBrand(page: PageObjectResponse): Brand`
- `mapNotionPageToCapsule(page, brandName, brandSlug): Capsule`

### 3. 내부 조회 함수
- `getBrandById(brandId): Promise<Brand | null>` — 캡슐 매핑 시 브랜드 정보 보강용

### 4. export 조회 함수 4개
```ts
export async function getBrands(): Promise<Brand[]>
export async function getBrandBySlug(slug: string): Promise<Brand | null>
export async function getCapsulesByBrandId(brandId: string): Promise<Capsule[]>
export async function getCapsuleBySlug(slug: string): Promise<Capsule | null>
```

## 핵심 설계 결정

1. **isFullPage 타입 가드** — `@notionhq/client`의 내장 `isFullPage()` 사용하여 타입 안전 보장
2. **프로퍼티명 variation** — `getProperty(props, 'Slug', 'slug', 'SLUG')` 방식으로 Notion DB 실제 키명에 유연하게 대응
3. **N+1 방지**
   - `getCapsulesByBrandId`: brandId 인자 이용 → `getBrandById` 1회만 호출 후 전체 캡슐에 적용
   - `getCapsuleBySlug`: 단일 캡슐 조회 후 relation에서 brandId 추출 → 1회 조회
4. **방어적 에러 처리** — 모든 export 함수 `try/catch`로 감싸고 에러 시 `[]` 또는 `null` 반환

## 검증 방법
- `pnpm build`에서 TypeScript 타입 에러 없는지 확인
- 로컬에서 `getBrands()` 호출 시 Notion DB 실제 데이터 반환 확인
- 존재하지 않는 slug 조회 시 `null` 반환 확인
- 완료 후 TaskMaster Task 3 상태를 `done`으로 업데이트
