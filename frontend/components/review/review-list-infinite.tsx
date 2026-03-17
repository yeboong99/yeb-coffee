"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "./star-rating";
import { ReviewForm } from "./review-form";
import { getReviews } from "@/lib/api";
import type { Review, PaginatedResponse } from "@/types";

interface ReviewListInfiniteProps {
  capsuleId: string;
  capsuleSlug: string;
  /** 서버에서 미리 조회한 첫 페이지 데이터 (초기 렌더링 최적화) */
  initialData: PaginatedResponse<Review>;
}

export function ReviewListInfinite({
  capsuleId,
  capsuleSlug,
  initialData,
}: ReviewListInfiniteProps) {
  const queryClient = useQueryClient();

  // 커서 기반 무한 페이지네이션 쿼리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["reviews", capsuleSlug],
      queryFn: ({ pageParam }) =>
        getReviews(capsuleSlug, { cursor: pageParam, limit: 5 }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
      // 서버에서 받아온 초기 데이터로 첫 번째 페이지 미리 채움
      initialData: { pages: [initialData], pageParams: [undefined] },
    });

  // 전체 페이지에서 리뷰 목록을 하나의 배열로 평탄화
  const reviews = data.pages.flatMap((page) => page.data);

  // 리뷰 작성 성공 시 캐시 무효화로 목록 새로고침
  const handleReviewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["reviews", capsuleSlug] });
  };

  return (
    <>
      {/* 리뷰 목록 영역 */}
      <section aria-label="리뷰 목록">
        {reviews.length === 0 ? (
          // 리뷰가 없을 때 안내 메시지
          <div className="text-center py-8 text-muted-foreground">
            아직 리뷰가 없습니다.
          </div>
        ) : (
          <div>
            {reviews.map((review) => (
              <div key={review.id}>
                {/* 개별 리뷰 카드 */}
                <article
                  className="space-y-2 py-4"
                  aria-label={`${review.authorNickname}의 리뷰`}
                >
                  {/* 닉네임 + 작성 날짜 */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.authorNickname}</span>
                    <time
                      className="text-sm text-muted-foreground"
                      dateTime={review.createdAt}
                    >
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </time>
                  </div>

                  {/* 별점 */}
                  <StarRating value={review.rating} size="sm" />

                  {/* 리뷰 본문 */}
                  <p className="text-sm leading-relaxed">{review.content}</p>
                </article>

                {/* 리뷰 카드 사이 구분선 */}
                <Separator />
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼: 다음 페이지가 있을 때만 표시 */}
        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              aria-label="리뷰 더 불러오기"
            >
              {isFetchingNextPage ? (
                <>
                  {/* 로딩 스피너 */}
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  불러오는 중...
                </>
              ) : (
                "더보기"
              )}
            </Button>
          </div>
        )}
      </section>

      {/* 구분선 + 리뷰 작성 폼 */}
      <Separator className="my-10" />

      <section aria-label="리뷰 작성">
        <h2 className="text-xl font-bold mb-6">리뷰 작성</h2>
        <ReviewForm
          capsuleId={capsuleId}
          capsuleSlug={capsuleSlug}
          onSuccess={handleReviewSuccess}
        />
      </section>
    </>
  );
}
