import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CapsuleDetail } from "@/components/capsule/capsule-detail";
import { ReviewListInfinite } from "@/components/review/review-list-infinite";
import { ChevronLeft } from "lucide-react";
import { getCapsuleBySlug } from "@/lib/notion";
import { getServiceRating, createServerSupabaseClient } from "@/lib/supabase";
import { mapRowToReview, type ReviewRow } from "@/lib/mappers";
import type { PaginatedResponse, Review } from "@/types";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

interface Props {
  params: Promise<{ capsuleSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { capsuleSlug } = await params;
  const capsule = await getCapsuleBySlug(capsuleSlug);

  if (!capsule) {
    return { title: "캡슐을 찾을 수 없습니다" };
  }

  const flavorPart =
    capsule.flavorNotes.length > 0
      ? `, 향미: ${capsule.flavorNotes.join(", ")}`
      : "";
  const intensityPart =
    capsule.intensity != null ? ` — 강도 ${capsule.intensity}` : "";

  return {
    title: capsule.name,
    description: `${capsule.name}${intensityPart}${flavorPart}`,
  };
}

export default async function CapsulePage({ params }: Props) {
  const { capsuleSlug } = await params;

  // 캡슐 조회: 없으면 404
  const capsule = await getCapsuleBySlug(capsuleSlug);
  if (!capsule) {
    notFound();
  }

  // 커뮤니티 서비스 평점 단건 조회
  const serviceRating = await getServiceRating(capsuleSlug);

  // 서버 사이드에서 초기 리뷰 프리페치 (HTTP 홉 없이 Supabase 직접 쿼리)
  const REVIEW_LIMIT = 5;
  const supabaseServer = createServerSupabaseClient();
  const { data: reviewData } = await supabaseServer
    .from("reviews")
    .select("*")
    .eq("capsule_slug", capsuleSlug)
    .order("created_at", { ascending: false })
    .limit(REVIEW_LIMIT + 1); // N+1 패턴으로 hasMore 판별

  const reviewRows = (reviewData ?? []) as ReviewRow[];
  const hasMoreReviews = reviewRows.length > REVIEW_LIMIT;
  const reviewItems = hasMoreReviews
    ? reviewRows.slice(0, REVIEW_LIMIT)
    : reviewRows;
  const reviewNextCursor = hasMoreReviews
    ? reviewItems[reviewItems.length - 1].created_at
    : null;

  const initialReviews: PaginatedResponse<Review> = {
    data: reviewItems.map(mapRowToReview),
    nextCursor: reviewNextCursor,
    hasMore: hasMoreReviews,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href={`/brands/${capsule.brandSlug}`}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {capsule.brandName}
        </Link>
      </Button>

      <CapsuleDetail capsule={capsule} serviceRating={serviceRating} />

      <Separator className="my-10" />

      <ReviewListInfinite
        capsuleId={capsule.id}
        capsuleSlug={capsule.slug}
        initialData={initialReviews}
      />
    </div>
  );
}
