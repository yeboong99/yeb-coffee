import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Brand } from '@/types/brand';
import type { Capsule, IntensityLevel } from '@/types/capsule';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const BRAND_DATABASE_ID = process.env.NOTION_BRAND_DATABASE_ID!;
export const CAPSULE_DATABASE_ID = process.env.NOTION_CAPSULE_DATABASE_ID!;

// ============================================================
// 내부 프로퍼티 헬퍼 함수
// ============================================================

type NotionProperties = PageObjectResponse['properties'];

/** 여러 키 이름 variation 중 첫 번째로 일치하는 프로퍼티 반환 */
function getProperty(props: NotionProperties, ...keys: string[]) {
  for (const key of keys) {
    if (props[key] !== undefined) return props[key];
  }
  return undefined;
}

/** title 또는 rich_text 프로퍼티 → string */
function getPlainText(property: ReturnType<typeof getProperty>): string {
  if (!property) return '';
  if (property.type === 'title') {
    return property.title.map((t) => t.plain_text).join('');
  }
  if (property.type === 'rich_text') {
    return property.rich_text.map((t) => t.plain_text).join('');
  }
  return '';
}

/** number 프로퍼티 → number | null */
function getNumber(property: ReturnType<typeof getProperty>): number | null {
  if (!property || property.type !== 'number') return null;
  return property.number;
}

/** url 프로퍼티 → string | null */
function getUrl(property: ReturnType<typeof getProperty>): string | null {
  if (!property || property.type !== 'url') return null;
  return property.url || null; // 빈 문자열도 null로 처리
}

/** relation 프로퍼티 → id 배열 */
function getRelation(property: ReturnType<typeof getProperty>): string[] {
  if (!property || property.type !== 'relation') return [];
  return property.relation.map((r) => r.id);
}

/** files 프로퍼티 → 첫 번째 URL | null */
function getFiles(property: ReturnType<typeof getProperty>): string | null {
  if (!property || property.type !== 'files') return null;
  const first = property.files[0];
  if (!first) return null;
  if (first.type === 'external') return first.external.url;
  if (first.type === 'file') return first.file.url;
  return null;
}

/** select 프로퍼티 → string | null */
function getSelect(property: ReturnType<typeof getProperty>): string | null {
  if (!property || property.type !== 'select') return null;
  return property.select?.name ?? null;
}

/** multi_select 프로퍼티 → name 배열 */
function getMultiSelect(property: ReturnType<typeof getProperty>): string[] {
  if (!property || property.type !== 'multi_select') return [];
  return property.multi_select.map((s) => s.name);
}

/** checkbox 프로퍼티 → boolean */
function getCheckbox(property: ReturnType<typeof getProperty>): boolean {
  if (!property || property.type !== 'checkbox') return false;
  return property.checkbox;
}

/** rollup 프로퍼티 → number | null (number 타입이면 값, array 타입이면 배열 길이) */
function getRollupNumber(property: ReturnType<typeof getProperty>): number | null {
  if (!property || property.type !== 'rollup') return null;
  const rollup = property.rollup;
  if (rollup.type === 'number') return rollup.number ?? null;
  if (rollup.type === 'array') return rollup.array.length;
  return null;
}

// ============================================================
// 매핑 함수 (내부 사용)
// ============================================================

function mapNotionPageToBrand(page: PageObjectResponse): Brand {
  const props = page.properties;

  return {
    id: page.id,
    slug: getPlainText(getProperty(props, 'Slug', 'slug', 'SLUG')),
    name: getPlainText(getProperty(props, 'Name', 'name', '이름')),
    description: getPlainText(getProperty(props, 'Descript', 'Description', 'description', '설명')),
    logoUrl:
      getUrl(getProperty(props, 'Logo URL', 'LogoUrl', 'logoUrl', 'logo_url'))
      ?? getFiles(getProperty(props, 'Logo URL', 'Logo', 'logo')),
    websiteUrl: getUrl(getProperty(props, 'Website URL', 'WebsiteUrl', 'websiteUrl', 'Website', 'website')),
    country: getPlainText(getProperty(props, 'Country', 'country', '국가')),
    capsuleCount:
      getRollupNumber(getProperty(props, 'Capsule Count', 'capsuleCount', 'CapsuleCount'))
      ?? getNumber(getProperty(props, 'Capsule Count', 'capsuleCount', 'CapsuleCount'))
      ?? 0,
  };
}

function mapNotionPageToCapsule(
  page: PageObjectResponse,
  brandName: string,
  brandSlug: string,
): Capsule {
  const props = page.properties;

  const intensityRaw = getNumber(getProperty(props, 'Intensity', 'intensity', '강도'));
  const intensity =
    intensityRaw !== null && intensityRaw >= 1 && intensityRaw <= 13
      ? (intensityRaw as IntensityLevel)
      : null;

  const brandIds = getRelation(getProperty(props, 'Brand', 'brand', 'BrandId', 'brandId'));

  return {
    id: page.id,
    slug: getPlainText(getProperty(props, 'Slug', 'slug', 'SLUG')),
    brandId: brandIds[0] ?? '',
    brandName,
    brandSlug,
    name: getPlainText(getProperty(props, 'Name', 'name', '이름')),
    description: getPlainText(getProperty(props, 'Description', 'description', '설명')),
    imageUrl:
      getFiles(getProperty(props, 'Image URL', 'Image', 'image', 'ImageUrl', 'image_url'))
      ?? getUrl(getProperty(props, 'Image URL', 'Image', 'image', 'ImageUrl', 'image_url')),
    intensity,
    // 'Flavor Notes'는 rich_text 타입이므로 쉼표 분리 처리
    flavorNotes: (() => {
      const multiSelect = getMultiSelect(getProperty(props, 'Flavor Notes', 'FlavorNotes', 'flavorNotes', 'flavor_notes'));
      if (multiSelect.length > 0) return multiSelect;
      const richText = getPlainText(getProperty(props, 'Flavor Notes', 'FlavorNotes', 'flavorNotes', 'flavor_notes'));
      return richText ? richText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    })(),
    isLimitedEdition: getCheckbox(getProperty(props, 'Is Limited', 'IsLimitedEdition', 'isLimitedEdition', 'Limited Edition')),
    isDiscontinued: getCheckbox(getProperty(props, 'IsDiscontinued', 'isDiscontinued', 'Discontinued')),
    // Notion 프로퍼티명 'AverageRating'은 쿠팡 연동 평점을 의미
    coupangRating: getNumber(getProperty(props, 'AverageRating', 'averageRating', 'Average Rating')),
    reviewCount: getNumber(getProperty(props, 'ReviewCount', 'reviewCount', 'Review Count')) ?? 0,
  };
}

// ============================================================
// 내부 조회 함수
// ============================================================

/** 캡슐 매핑 시 브랜드 정보 보강용 (내부 사용) */
async function getBrandById(brandId: string): Promise<Brand | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: brandId });
    if (!isFullPage(page)) return null;
    return mapNotionPageToBrand(page);
  } catch {
    return null;
  }
}

// ============================================================
// export 조회 함수
// ============================================================

/** 전체 브랜드 목록 조회 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const response = await notion.databases.query({
      database_id: BRAND_DATABASE_ID,
    });

    return response.results
      .filter(isFullPage)
      .map(mapNotionPageToBrand);
  } catch (error) {
    console.error('[Notion] getBrands 오류:', error);
    return [];
  }
}

/** slug로 브랜드 단건 조회 (전체 목록 조회 후 JS 필터 — Notion Slug 프로퍼티 부재 대응) */
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const brands = await getBrands();
    return brands.find((b) => b.slug === slug) ?? null;
  } catch (error) {
    console.error('[Notion] getBrandBySlug 오류:', error);
    return null;
  }
}

/** brandId로 해당 브랜드의 캡슐 목록 조회 */
export async function getCapsulesByBrandId(brandId: string): Promise<Capsule[]> {
  try {
    // N+1 방지: 브랜드 정보 1회만 조회
    const brand = await getBrandById(brandId);
    const brandName = brand?.name ?? '';
    const brandSlug = brand?.slug ?? '';

    const response = await notion.databases.query({
      database_id: CAPSULE_DATABASE_ID,
      filter: {
        property: 'Brand',
        relation: { contains: brandId },
      },
    });

    return response.results
      .filter(isFullPage)
      .map((page) => mapNotionPageToCapsule(page, brandName, brandSlug));
  } catch (error) {
    console.error('[Notion] getCapsulesByBrandId 오류:', error);
    return [];
  }
}

/** slug로 캡슐 단건 조회 (전체 목록 순회 — Notion Slug 프로퍼티 부재 대응) */
export async function getCapsuleBySlug(slug: string): Promise<Capsule | null> {
  try {
    const response = await notion.databases.query({
      database_id: CAPSULE_DATABASE_ID,
    });
    const pages = response.results.filter(isFullPage);

    for (const page of pages) {
      const brandIds = getRelation(
        getProperty(page.properties, 'Brand', 'brand', 'BrandId', 'brandId'),
      );
      const brandId = brandIds[0] ?? '';
      const brand = brandId ? await getBrandById(brandId) : null;
      const capsule = mapNotionPageToCapsule(page, brand?.name ?? '', brand?.slug ?? '');
      if (capsule.slug === slug) return capsule;
    }
    return null;
  } catch (error) {
    console.error('[Notion] getCapsuleBySlug 오류:', error);
    return null;
  }
}
