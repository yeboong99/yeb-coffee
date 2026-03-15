import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye, TrendingUp } from "lucide-react";
import type { Post } from "@/types";

// 인기 게시글 컴포넌트 props
interface PopularPostsProps {
  posts: Post[];
}

export function PopularPosts({ posts }: PopularPostsProps) {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">인기 게시글</h2>
        <Button asChild variant="ghost">
          <Link href="/community">전체 보기</Link>
        </Button>
      </div>

      {/* 게시글이 없을 때 빈 상태 처리 */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <TrendingUp className="h-10 w-10 opacity-30" />
          <p className="text-sm">아직 인기 게시글이 없습니다.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/community/write">첫 게시글 작성하기</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/community/${post.id}`}>
              <Card className="card-ring-hover hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="font-medium truncate">{post.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {post.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.commentCount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
