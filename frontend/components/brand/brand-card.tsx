import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Brand } from "@/types";

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/brands/${brand.slug}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 text-lg">
            ☕
          </div>
          <CardTitle className="text-lg">{brand.name}</CardTitle>
          <CardDescription>
            {brand.description}
            {brand.capsuleCount > 0 && ` · ${brand.capsuleCount}종`}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
