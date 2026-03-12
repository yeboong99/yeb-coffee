import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CommentList } from "@/components/community/comment-list";
import { CommentForm } from "@/components/community/comment-form";
import { ChevronLeft, Eye, MessageSquare } from "lucide-react";
import type { Post, Comment } from "@/types";

// TODO: Supabase에서 실제 데이터 가져오기
const placeholderPosts: Record<string, Post> = {
  "1": {
    id: "1",
    title: "네스프레소 버츄오 넥스트 추천 캡슐 TOP 5",
    content: `오늘은 버츄오 넥스트와 잘 어울리는 캡슐 5가지를 소개합니다.

1. **멜로지오** - 가장 무난하고 부드러운 커피. 처음 시작하기에 딱 좋습니다.
2. **스토르미오** - 강렬하고 진한 맛. 아침에 마시면 기운이 납니다.
3. **아르페지오** - 코코아 향이 나는 부드러운 에스프레소.
4. **탈리지오** - 견과류 향이 가득한 롱고.
5. **카프리치오** - 과일향과 산미가 특징인 가벼운 커피.

각 캡슐마다 강도와 향미가 달라서 취향에 맞게 골라보시길 추천드려요!`,
    category: "추천",
    authorNickname: "커피러버",
    viewCount: 320,
    commentCount: 2,
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  },
};

const placeholderComments: Record<string, Comment[]> = {
  "1": [
    {
      id: "cm1",
      postId: "1",
      authorNickname: "버츄오팬",
      content: "멜로지오 정말 맛있죠! 저도 추천합니다.",
      createdAt: "2026-03-10T11:00:00Z",
    },
    {
      id: "cm2",
      postId: "1",
      authorNickname: "커피입문자",
      content: "좋은 정보 감사합니다. 처음엔 멜로지오로 시작해봐야겠어요!",
      createdAt: "2026-03-10T13:00:00Z",
    },
  ],
};

interface Props {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: Props) {
  const { postId } = await params;
  const post = placeholderPosts[postId];

  if (!post) {
    notFound();
  }

  const comments = placeholderComments[postId] ?? [];

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
              {post.viewCount}
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
        <h2 className="text-lg font-bold mb-4">댓글 ({comments.length})</h2>
        <CommentList comments={comments} />
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-lg font-bold mb-4">댓글 작성</h2>
        <CommentForm postId={post.id} />
      </section>
    </div>
  );
}
