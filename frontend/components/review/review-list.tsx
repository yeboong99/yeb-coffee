import { StarRating } from "./star-rating";
import { Separator } from "@/components/ui/separator";
import type { Review } from "@/types";

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
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
