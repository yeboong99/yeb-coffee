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
  return property.url;
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

// ============================================================
// 매핑 함수 (내부 사용)
// ============================================================

function mapNotionPageToBrand(page: PageObjectResponse): Brand {
  const props = page.properties;

  return {
    id: page.id,
    slug: getPlainText(getProperty(props, 'Slug', 'slug', 'SLUG')),
    name: getPlainText(getProperty(props, 'Name', 'name', '이름')),
    description: getPlainText(getProperty(props, 'Description', 'description', '설명')),
    logoUrl: getFiles(getProperty(props, 'Logo', 'logo', 'LogoUrl', 'logo_url')),
    websiteUrl: getUrl(getProperty(props, 'WebsiteUrl', 'websiteUrl', 'Website', 'website')),
    country: getPlainText(getProperty(props, 'Country', 'country', '국가')),
    capsuleCount: getNumber(getProperty(props, 'CapsuleCount', 'capsuleCount', 'Capsule Count')) ?? 0,
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
    imageUrl: getFiles(getProperty(props, 'Image', 'image', 'ImageUrl', 'image_url')),
    intensity,
    flavorNotes: getMultiSelect(getProperty(props, 'FlavorNotes', 'flavorNotes', 'Flavor Notes', 'flavor_notes')),
    isLimitedEdition: getCheckbox(getProperty(props, 'IsLimitedEdition', 'isLimitedEdition', 'Limited Edition')),
    isDiscontinued: getCheckbox(getProperty(props, 'IsDiscontinued', 'isDiscontinued', 'Discontinued')),
    averageRating: getNumber(getProperty(props, 'AverageRating', 'averageRating', 'Average Rating')),
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
    const response = await notion.dataSources.query({
      data_source_id: BRAND_DATABASE_ID,
    });

    return response.results
      .filter(isFullPage)
      .map(mapNotionPageToBrand);
  } catch (error) {
    console.error('[Notion] getBrands 오류:', error);
    return [];
  }
}

/** slug로 브랜드 단건 조회 */
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: BRAND_DATABASE_ID,
      filter: {
        or: [
          { property: 'Slug', rich_text: { equals: slug } },
          { property: 'slug', rich_text: { equals: slug } },
        ],
      },
    });

    const page = response.results.filter(isFullPage)[0];
    if (!page) return null;
    return mapNotionPageToBrand(page);
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

    const response = await notion.dataSources.query({
      data_source_id: CAPSULE_DATABASE_ID,
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

/** slug로 캡슐 단건 조회 */
export async function getCapsuleBySlug(slug: string): Promise<Capsule | null> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: CAPSULE_DATABASE_ID,
      filter: {
        or: [
          { property: 'Slug', rich_text: { equals: slug } },
          { property: 'slug', rich_text: { equals: slug } },
        ],
      },
    });

    const page = response.results.filter(isFullPage)[0];
    if (!page) return null;

    // relation에서 brandId 추출 후 브랜드 정보 1회 조회
    const brandIds = getRelation(
      getProperty(page.properties, 'Brand', 'brand', 'BrandId', 'brandId'),
    );
    const brandId = brandIds[0] ?? '';
    const brand = brandId ? await getBrandById(brandId) : null;

    return mapNotionPageToCapsule(page, brand?.name ?? '', brand?.slug ?? '');
  } catch (error) {
    console.error('[Notion] getCapsuleBySlug 오류:', error);
    return null;
  }
}
