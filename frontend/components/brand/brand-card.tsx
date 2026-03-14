import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Brand } from "@/types";

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/brands/${brand.slug}`}>
      <Card className="hover:border-primary/50 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
        <CardHeader>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={`${brand.name} 로고`}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-lg">☕</span>
            )}
          </div>
          <CardTitle className="text-lg">{brand.name}</CardTitle>
          {/* 국가 및 캡슐 수 정보 - 브랜드명 아래, 설명 위에 표시 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {brand.country && <span>{brand.country}</span>}
            {brand.country && brand.capsuleCount > 0 && <span>·</span>}
            {brand.capsuleCount > 0 && <span>{brand.capsuleCount}종</span>}
          </div>
          <CardDescription>
            {brand.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
