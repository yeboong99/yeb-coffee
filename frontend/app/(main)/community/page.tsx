import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostList } from "@/components/community/post-list";
import { CategoryTabs } from "@/components/community/category-tabs";
import { PenSquare } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { mapRowToPost, type PostRow } from "@/lib/mappers";
import type { Post } from "@/types";

// ISR: 60초마다 재검증
export const revalidate = 60;

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function CommunityPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const supabase = createServerSupabaseClient();

  // 카테고리 필터 적용하여 게시글 조회
  const query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  // 카테고리가 지정된 경우 필터 적용
  const { data, error } = category
    ? await query.eq("category", category)
    : await query;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-center py-16 text-destructive">
          게시글을 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  const posts: Post[] = (data as PostRow[]).map(mapRowToPost);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
          <p className="text-muted-foreground">캡슐 커피에 대한 정보와 경험을 나눠보세요.</p>
        </div>
        <Button asChild>
          <Link href="/community/write">
            <PenSquare className="h-4 w-4 mr-2" />
            글쓰기
          </Link>
        </Button>
      </div>

      {/* 카테고리 탭 - 클라이언트 컴포넌트 (URL searchParams 기반 탭 전환) */}
      <CategoryTabs />

      {/* 서버에서 필터링된 게시글 목록 */}
      <PostList posts={posts} />
    </div>
  );
}
