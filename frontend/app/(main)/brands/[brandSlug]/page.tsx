import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CapsuleGrid } from "@/components/capsule/capsule-grid";
import { ChevronLeft } from "lucide-react";
import type { Brand, Capsule } from "@/types";

// TODO: 노션 CMS에서 실제 데이터 가져오기
const placeholderBrands: Record<string, Brand> = {
  nespresso: {
    id: "1",
    slug: "nespresso",
    name: "네스프레소",
    description: "오리지널 라인 캡슐 커피 브랜드",
    logoUrl: null,
    websiteUrl: "https://www.nespresso.com",
    country: "스위스",
    capsuleCount: 3,
  },
};

const placeholderCapsules: Record<string, Capsule[]> = {
  nespresso: [
    {
      id: "c1",
      slug: "ristretto",
      brandId: "1",
      brandName: "네스프레소",
      brandSlug: "nespresso",
      name: "리스트레토",
      description: "강렬하고 진한 에스프레소. 로스팅한 시리얼과 우디한 향이 특징입니다.",
      imageUrl: null,
      intensity: 10,
      flavorNotes: ["로스팅", "우디", "시리얼"],
      isLimitedEdition: false,
      isDiscontinued: false,
      averageRating: 4.3,
      reviewCount: 24,
    },
    {
      id: "c2",
      slug: "roma",
      brandId: "1",
      brandName: "네스프레소",
      brandSlug: "nespresso",
      name: "로마",
      description: "풀바디 에스프레소. 강하고 진한 바디감에 우디한 노트가 특징입니다.",
      imageUrl: null,
      intensity: 8,
      flavorNotes: ["우디", "시리얼", "다크초콜릿"],
      isLimitedEdition: false,
      isDiscontinued: false,
      averageRating: 4.1,
      reviewCount: 18,
    },
    {
      id: "c3",
      slug: "volluto",
      brandId: "1",
      brandName: "네스프레소",
      brandSlug: "nespresso",
      name: "볼루토",
      description: "달콤하고 가벼운 에스프레소. 과일향과 쌉쌀한 시리얼이 조화롭습니다.",
      imageUrl: null,
      intensity: 4,
      flavorNotes: ["과일", "시리얼", "꿀"],
      isLimitedEdition: false,
      isDiscontinued: false,
      averageRating: 3.9,
      reviewCount: 12,
    },
  ],
};

interface Props {
  params: Promise<{ brandSlug: string }>;
}

export default async function BrandPage({ params }: Props) {
  const { brandSlug } = await params;
  const brand = placeholderBrands[brandSlug];

  if (!brand) {
    notFound();
  }

  const capsules = placeholderCapsules[brandSlug] ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/brands">
          <ChevronLeft className="h-4 w-4 mr-1" />
          브랜드 목록
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
        <p className="text-muted-foreground">{brand.description}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {brand.country} · {brand.capsuleCount}종
        </p>
      </div>

      <CapsuleGrid capsules={capsules} />
    </div>
  );
}
