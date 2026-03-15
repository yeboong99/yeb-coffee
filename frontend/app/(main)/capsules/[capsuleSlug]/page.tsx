import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CapsuleDetail } from "@/components/capsule/capsule-detail";
import { ReviewList } from "@/components/review/review-list";
import { ReviewForm } from "@/components/review/review-form";
import { ChevronLeft } from "lucide-react";
import { getCapsuleBySlug } from "@/lib/notion";
import { getServiceRating } from "@/lib/supabase";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

interface Props {
  params: Promise<{ capsuleSlug: string }>;
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

      <section>
        {/* Suspense로 감싸서 리뷰 로딩 중 Skeleton fallback 표시 */}
        <Suspense
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          }
        >
          <ReviewList capsuleSlug={capsule.slug} />
        </Suspense>
      </section>

      <Separator className="my-10" />

      <section>
        <h2 className="text-xl font-bold mb-6">리뷰 작성</h2>
        <ReviewForm capsuleId={capsule.id} capsuleSlug={capsule.slug} />
      </section>
    </div>
  );
}
