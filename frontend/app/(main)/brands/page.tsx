import { BrandGrid } from "@/components/brand/brand-grid";
import { getBrands } from "@/lib/notion";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">브랜드 탐색</h1>
        <p className="text-muted-foreground">
          다양한 캡슐 커피 브랜드를 만나보세요.
        </p>
      </div>
      {brands.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          등록된 브랜드가 없습니다.
        </p>
      ) : (
        <BrandGrid brands={brands} />
      )}
    </div>
  );
}
