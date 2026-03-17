import { createServerSupabaseClient } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";
import type { Comment } from "@/types";

interface CommentListProps {
  postId: string;
}

// Supabase comments 테이블 레코드 타입 (snake_case)
interface CommentRow {
  id: string;
  post_id: string;
  author_nickname: string;
  content: string;
  created_at: string;
}

// snake_case DB 레코드를 camelCase 타입으로 변환
function mapRowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorNickname: row.author_nickname,
    content: row.content,
    createdAt: row.created_at,
  };
}

/**
 * 댓글 목록 서버 컴포넌트
 * postId를 받아 Supabase에서 댓글을 직접 조회합니다.
 * CommentForm의 router.refresh() 호출 시 자동으로 재조회됩니다.
 */
export async function CommentList({ postId }: CommentListProps) {
  // 서버에서 Supabase로 직접 댓글 조회 (등록순 정렬)
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="text-center py-6 text-destructive text-sm">
        댓글을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  const comments: Comment[] = (data as CommentRow[]).map(mapRowToComment);

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
              <span className="text-sm font-medium">
                {comment.authorNickname}
              </span>
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
