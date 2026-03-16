import { createServerSupabaseClient } from "@/lib/supabase";
import { StarRating } from "./star-rating";
import { Separator } from "@/components/ui/separator";
import { mapRowToReview, type ReviewRow } from "@/lib/mappers";
import type { Review } from "@/types";

interface ReviewListProps {
  capsuleSlug: string;
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
