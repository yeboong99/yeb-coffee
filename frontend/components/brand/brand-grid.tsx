import { BrandCard } from "./brand-card";
import type { Brand } from "@/types";

interface BrandGridProps {
  brands: Brand[];
}

export function BrandGrid({ brands }: BrandGridProps) {
  // 브랜드가 없을 경우 빈 상태 표시
  if (brands.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 브랜드가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}
