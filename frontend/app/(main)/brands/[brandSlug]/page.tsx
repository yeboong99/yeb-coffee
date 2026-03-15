import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CapsuleListWithFilters } from "@/components/capsule/capsule-list-with-filters";
import { ChevronLeft } from "lucide-react";
import { getBrands, getBrandBySlug, getCapsulesByBrandId } from "@/lib/notion";
import { getServiceRatings } from "@/lib/supabase";

// ISR: 1시간마다 재검증
export const revalidate = 3600;

// 빌드 시 알려진 브랜드 슬러그를 정적으로 생성
export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({ brandSlug: brand.slug }));
}

interface Props {
  params: Promise<{ brandSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug);

  if (!brand) {
    return { title: "브랜드를 찾을 수 없습니다" };
  }

  return {
    title: brand.name,
    description: brand.description || `${brand.name}의 캡슐 커피 라인업을 확인하세요.`,
  };
}

export default async function BrandPage({ params }: Props) {
  const { brandSlug } = await params;

  // 브랜드 조회: 없으면 404
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) {
    notFound();
  }

  // 해당 브랜드의 캡슐 목록 조회
  const capsules = await getCapsulesByBrandId(brand.id);

  // 커뮤니티 서비스 평점 일괄 조회 (슬러그 배열로 한 번에 요청)
  const capsuleSlugs = capsules.map((c) => c.slug);
  const serviceRatings = capsuleSlugs.length > 0
    ? await getServiceRatings(capsuleSlugs)
    : {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/brands">
          <ChevronLeft className="h-4 w-4 mr-1" />
          브랜드 목록
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">{brand.name}</h1>
        {/* 국가 및 캡슐 수 정보: country가 없을 경우 구분자(·)도 함께 숨김 */}
        <p className="text-xs text-muted-foreground mb-2">
          {brand.country && (
            <>
              <span>{brand.country}</span>
              <span className="mx-1">·</span>
            </>
          )}
          <span>{brand.capsuleCount}종</span>
        </p>
        <p className="text-muted-foreground">{brand.description}</p>
      </div>

      <CapsuleListWithFilters capsules={capsules} serviceRatings={serviceRatings} />
    </div>
  );
}
