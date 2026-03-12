import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const placeholderBrands = [
  { name: "네스프레소", description: "오리지널 & 버츄오 캡슐", slug: "nespresso", capsuleCount: 40 },
  { name: "돌체구스토", description: "다양한 음료 캡슐", slug: "dolce-gusto", capsuleCount: 35 },
  { name: "버츄오", description: "버츄오 전용 캡슐", slug: "vertuo", capsuleCount: 20 },
];

export function BrandShowcase() {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">인기 브랜드</h2>
        <Button asChild variant="ghost">
          <Link href="/brands">전체 보기</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {placeholderBrands.map((brand) => (
          <Link key={brand.slug} href={`/brands/${brand.slug}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 text-lg">
                  ☕
                </div>
                <CardTitle className="text-lg">{brand.name}</CardTitle>
                <CardDescription>
                  {brand.description} · {brand.capsuleCount}종
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
