import { HeroSection } from "@/components/home/hero-section";
import { BrandShowcase } from "@/components/home/brand-showcase";
import { PopularPosts } from "@/components/home/popular-posts";
import { getBrands } from "@/lib/notion";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Post, PostCategory } from "@/types";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

// Supabase posts 테이블 레코드 타입 (snake_case)
interface PostRow {
  id: string;
  title: string;
  content: string;
  category: string;
  author_nickname: string;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

// snake_case DB 레코드를 camelCase 타입으로 변환
function mapRowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category as PostCategory,
    authorNickname: row.author_nickname,
    viewCount: row.view_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function HomePage() {
  // 전체 브랜드 중 상위 3개만 홈에 표시
  const allBrands = await getBrands();
  const brands = allBrands.slice(0, 3);

  // 최근 7일 이내 게시글 중 조회수 상위 5개 조회
  const supabase = createServerSupabaseClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

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
      <PopularPosts posts={posts} />
    </div>
  );
}
