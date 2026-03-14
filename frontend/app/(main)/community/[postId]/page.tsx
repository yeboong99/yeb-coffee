import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CommentList } from "@/components/community/comment-list";
import { CommentForm } from "@/components/community/comment-form";
import { ChevronLeft, Eye, MessageSquare } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Post } from "@/types";

// 조회수가 매 요청마다 증가해야 하므로 동적 렌더링 사용
export const revalidate = 0;

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
    category: row.category as Post["category"],
    authorNickname: row.author_nickname,
    viewCount: row.view_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface Props {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: Props) {
  const { postId } = await params;

  const supabase = createServerSupabaseClient();

  // 단일 게시글 조회
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  // 게시글이 없거나 오류 시 404 처리
  if (error || !data) {
    notFound();
  }

  const post = mapRowToPost(data as PostRow);

  // 조회수 증가 (에러 무시 - 조회수 증가 실패가 페이지 렌더링을 막아선 안 됨)
  await supabase
    .from("posts")
    .update({ view_count: post.viewCount + 1 })
    .eq("id", postId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/community">
          <ChevronLeft className="h-4 w-4 mr-1" />
          커뮤니티
        </Link>
      </Button>

      <article className="space-y-4">
        <div className="space-y-2">
          <Badge variant="secondary">{post.category}</Badge>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post.authorNickname}</span>
            <time>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</time>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.viewCount + 1}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.commentCount}
            </span>
          </div>
        </div>

        <Separator />

        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap py-2">
          {post.content}
        </div>
      </article>

      <Separator className="my-8" />

      <section>
        <h2 className="text-lg font-bold mb-4">댓글 ({post.commentCount})</h2>
        {/* CommentList가 내부에서 Supabase 조회 - postId만 전달 */}
        <CommentList postId={postId} />
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-lg font-bold mb-4">댓글 작성</h2>
        <CommentForm postId={post.id} />
      </section>
    </div>
  );
}
