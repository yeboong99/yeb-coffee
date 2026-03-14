import { createServerSupabaseClient } from "@/lib/supabase";
import { StarRating } from "./star-rating";
import { Separator } from "@/components/ui/separator";
import type { Review } from "@/types";

interface ReviewListProps {
  capsuleSlug: string;
}

// Supabase reviews 테이블 레코드 타입 (snake_case)
interface ReviewRow {
  id: string;
  capsule_id: string;
  capsule_slug: string;
  author_nickname: string;
  rating: number;
  content: string;
  created_at: string;
}

// snake_case DB 레코드를 camelCase 타입으로 변환
function mapRowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    capsuleId: row.capsule_id,
    capsuleSlug: row.capsule_slug,
    authorNickname: row.author_nickname,
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function ReviewList({ capsuleSlug }: ReviewListProps) {
  // 서버에서 Supabase로 직접 리뷰 조회
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("capsule_slug", capsuleSlug)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        리뷰를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  const reviews: Review[] = (data as ReviewRow[]).map(mapRowToReview);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <div key={review.id}>
          <div className="space-y-2 py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{review.authorNickname}</span>
              <time className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("ko-KR")}
              </time>
            </div>
            <StarRating value={review.rating} size="sm" />
            <p className="text-sm leading-relaxed">{review.content}</p>
          </div>
          {index < reviews.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
