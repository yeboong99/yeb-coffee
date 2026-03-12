import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CapsuleDetail } from "@/components/capsule/capsule-detail";
import { ReviewList } from "@/components/review/review-list";
import { ReviewForm } from "@/components/review/review-form";
import { ChevronLeft } from "lucide-react";
import type { Capsule, Review } from "@/types";

// TODO: 노션 CMS에서 실제 데이터 가져오기
const placeholderCapsules: Record<string, Capsule> = {
  ristretto: {
    id: "c1",
    slug: "ristretto",
    brandId: "1",
    brandName: "네스프레소",
    brandSlug: "nespresso",
    name: "리스트레토",
    description: "강렬하고 진한 에스프레소. 로스팅한 시리얼과 우디한 향이 특징입니다. 남미와 아프리카에서 엄선된 원두로 블렌딩되었습니다.",
    imageUrl: null,
    intensity: 10,
    flavorNotes: ["로스팅", "우디", "시리얼"],
    isLimitedEdition: false,
    isDiscontinued: false,
    averageRating: 4.3,
    reviewCount: 2,
  },
};

// TODO: Supabase에서 실제 리뷰 데이터 가져오기
const placeholderReviews: Record<string, Review[]> = {
  ristretto: [
    {
      id: "r1",
      capsuleId: "c1",
      capsuleSlug: "ristretto",
      authorNickname: "커피매니아",
      rating: 5,
      content: "정말 진하고 강렬한 맛! 아침마다 한 잔씩 마시는데 하루를 시작하기에 딱 좋습니다.",
      createdAt: "2026-03-05T09:00:00Z",
    },
    {
      id: "r2",
      capsuleId: "c1",
      capsuleSlug: "ristretto",
      authorNickname: "에스프레소러버",
      rating: 4,
      content: "리스트레토 특유의 진함이 잘 살아있습니다. 우디한 향도 매력적이에요.",
      createdAt: "2026-03-08T14:30:00Z",
    },
  ],
};

interface Props {
  params: Promise<{ capsuleSlug: string }>;
}

export default async function CapsulePage({ params }: Props) {
  const { capsuleSlug } = await params;
  const capsule = placeholderCapsules[capsuleSlug];

  if (!capsule) {
    notFound();
  }

  const reviews = placeholderReviews[capsuleSlug] ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href={`/brands/${capsule.brandSlug}`}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {capsule.brandName}
        </Link>
      </Button>

      <CapsuleDetail capsule={capsule} />

      <Separator className="my-10" />

      <section>
        <h2 className="text-xl font-bold mb-6">리뷰 ({reviews.length})</h2>
        <ReviewList reviews={reviews} />
      </section>

      <Separator className="my-10" />

      <section>
        <h2 className="text-xl font-bold mb-6">리뷰 작성</h2>
        <ReviewForm capsuleId={capsule.id} capsuleSlug={capsule.slug} />
      </section>
    </div>
  );
}
