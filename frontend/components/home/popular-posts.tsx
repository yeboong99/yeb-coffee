import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye } from "lucide-react";

const placeholderPosts = [
  {
    id: "1",
    title: "네스프레소 버츄오 넥스트 추천 캡슐 TOP 5",
    category: "추천",
    authorNickname: "커피러버",
    viewCount: 320,
    commentCount: 12,
    createdAt: "2026-03-10",
  },
  {
    id: "2",
    title: "돌체구스토 캡슐 보관 방법 공유합니다",
    category: "정보공유",
    authorNickname: "에스프레소마스터",
    viewCount: 185,
    commentCount: 7,
    createdAt: "2026-03-09",
  },
  {
    id: "3",
    title: "오리지널 vs 버츄오 어떤 머신이 더 좋나요?",
    category: "질문",
    authorNickname: "커피초보",
    viewCount: 410,
    commentCount: 28,
    createdAt: "2026-03-08",
  },
];

export function PopularPosts() {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">인기 게시글</h2>
        <Button asChild variant="ghost">
          <Link href="/community">전체 보기</Link>
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {placeholderPosts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
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
    </section>
  );
}
