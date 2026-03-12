import { HeroSection } from "@/components/home/hero-section";
import { BrandShowcase } from "@/components/home/brand-showcase";
import { PopularPosts } from "@/components/home/popular-posts";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <HeroSection />
      <BrandShowcase />
      <PopularPosts />
    </div>
  );
}
