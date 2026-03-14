import { HeroSection } from "@/components/home/hero-section";
import { BrandShowcase } from "@/components/home/brand-showcase";
import { PopularPosts } from "@/components/home/popular-posts";
import { getBrands } from "@/lib/notion";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

export default async function HomePage() {
  // 전체 브랜드 중 상위 3개만 홈에 표시
  const allBrands = await getBrands();
  const brands = allBrands.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <HeroSection />
      <BrandShowcase brands={brands} />
      <PopularPosts />
    </div>
  );
}
