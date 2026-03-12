import { Separator } from "@/components/ui/separator";
import type { Comment } from "@/types";

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        아직 댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {comments.map((comment, index) => (
        <div key={comment.id}>
          <div className="py-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{comment.authorNickname}</span>
              <time className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
              </time>
            </div>
            <p className="text-sm leading-relaxed">{comment.content}</p>
          </div>
          {index < comments.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
