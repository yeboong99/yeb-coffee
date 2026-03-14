import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandCard } from "@/components/brand/brand-card";
import type { Brand } from "@/types";

interface BrandShowcaseProps {
  brands: Brand[];
}

export function BrandShowcase({ brands }: BrandShowcaseProps) {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">인기 브랜드</h2>
        <Button asChild variant="ghost">
          <Link href="/brands">전체 보기</Link>
        </Button>
      </div>
      {brands.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          등록된 브랜드가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* BrandCard 내부에 Link 포함 - 중복 Link 래퍼 없음 */}
          {brands.map((brand) => (
            <BrandCard key={brand.slug} brand={brand} />
          ))}
        </div>
      )}
    </section>
  );
}
