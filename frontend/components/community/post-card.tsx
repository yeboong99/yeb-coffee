import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye } from "lucide-react";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/community/${post.id}`}>
      <Card className="card-ring-hover hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer">
        <CardContent className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Badge variant="secondary" className="shrink-0">{post.category}</Badge>
            <div className="min-w-0">
              <p className="font-medium truncate">{post.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {post.authorNickname} · {new Date(post.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
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
  );
}
