import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IntensityBadge } from "@/components/capsule/intensity-badge";
import type { Capsule } from "@/types";
import type { ServiceRating } from "@/types/review";

interface CapsuleDetailProps {
  capsule: Capsule;
  // 커뮤니티 서비스 자체 평점 (선택적)
  serviceRating?: ServiceRating;
}

export function CapsuleDetail({ capsule, serviceRating }: CapsuleDetailProps) {
  return (
    <div className="space-y-6">
      {capsule.imageUrl && (
        <div className="relative w-full max-h-80 overflow-hidden rounded-lg mb-6">
          <img
            src={capsule.imageUrl}
            alt={capsule.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div>
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-3xl font-bold">{capsule.name}</h1>
          {capsule.isLimitedEdition && (
            <Badge variant="secondary">한정판</Badge>
          )}
          {capsule.isDiscontinued && <Badge variant="destructive">단종</Badge>}
        </div>
        <p className="text-muted-foreground">{capsule.brandName}</p>
      </div>

      <Separator />

      <p className="text-base leading-relaxed">{capsule.description}</p>

      {/* 정보 그리드: 강도 / 쿠팡 평점 / 커뮤니티 평점 / 리뷰 수 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {capsule.intensity !== null && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">강도</p>
            <IntensityBadge intensity={capsule.intensity} />
          </div>
        )}

        {/* 쿠팡 평점 (Notion에서 관리) */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">쿠팡 평점</p>
          {capsule.coupangRating !== null ? (
            <p className="font-semibold">
              ★ {capsule.coupangRating.toFixed(1)} / 5
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>

        {/* 커뮤니티 평점 (Supabase 집계) */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">커뮤니티 평점</p>
          {serviceRating?.avgRating !== null &&
          serviceRating?.avgRating !== undefined ? (
            <p className="font-semibold">
              ★ {serviceRating.avgRating.toFixed(1)} / 5
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">아직 없음</p>
          )}
        </div>

        {/* 리뷰 수: 커뮤니티 평점이 있으면 serviceRating.reviewCount, 아니면 Notion 값 */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">리뷰 수</p>
          <p className="font-semibold">
            {serviceRating !== undefined
              ? serviceRating.reviewCount
              : capsule.reviewCount}
            개
          </p>
        </div>
      </div>

      {capsule.flavorNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">향미</p>
          <div className="flex flex-wrap gap-2">
            {capsule.flavorNotes.map((note) => (
              <Badge key={note} variant="outline">
                {note}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
