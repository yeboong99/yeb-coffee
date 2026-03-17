import { HeroSection } from "@/components/home/hero-section";
import { BrandShowcase } from "@/components/home/brand-showcase";
import { PopularPosts } from "@/components/home/popular-posts";
import { TopCapsules } from "@/components/home/top-capsules";
import { getBrands } from "@/lib/notion";
import { createServerSupabaseClient } from "@/lib/supabase";
import { mapRowToPost, type PostRow } from "@/lib/mappers";
import type { Post } from "@/types";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

export default async function HomePage() {
  // 전체 브랜드 중 상위 3개만 홈에 표시
  const allBrands = await getBrands();
  const brands = allBrands.slice(0, 3);

  // 최근 7일 이내 게시글 중 조회수 상위 5개 조회
  const supabase = createServerSupabaseClient();
  // eslint-disable-next-line react-hooks/purity -- 서버 컴포넌트(async function)에서 Date.now()는 안전하게 사용 가능
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .gte("created_at", sevenDaysAgo)
    .order("view_count", { ascending: false })
    .limit(5);

  // 오류 시 빈 배열로 fallback (홈 전체를 깨지 않음)
  const posts: Post[] = error ? [] : (data as PostRow[]).map(mapRowToPost);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <HeroSection />
      <BrandShowcase brands={brands} />
      <TopCapsules />
      <PopularPosts posts={posts} />
    </div>
  );
}
