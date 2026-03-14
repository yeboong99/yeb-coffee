import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntensityBadge } from "@/components/capsule/intensity-badge";
import type { Capsule } from "@/types";
import type { ServiceRating } from "@/types/review";

interface CapsuleCardProps {
  capsule: Capsule;
  // 커뮤니티 서비스 자체 평점 (선택적)
  serviceRating?: ServiceRating;
}

export function CapsuleCard({ capsule, serviceRating }: CapsuleCardProps) {
  // 쿠팡 또는 커뮤니티 평점이 하나라도 있으면 평점 섹션 표시
  const hasRating = capsule.coupangRating !== null || serviceRating !== undefined;

  return (
    <Link href={`/capsules/${capsule.slug}`}>
      {/* 호버 시 카드 살짝 위로 이동 + 그림자 효과 */}
      <Card className="hover:border-primary/50 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
        {/* 이미지 패딩 래퍼 - 테두리에 붙지 않도록 */}
        {capsule.imageUrl && (
          <div className="p-3 pb-0">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={capsule.imageUrl}
                alt={capsule.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        <CardHeader className="pb-2">
          {/* 첫 번째 행: 왼쪽 캡슐 이름 + 오른쪽 이중 평점 */}
          <div className="flex items-start justify-between gap-2">
            {/* 이름 영역 - 길 경우 말줄임 처리 */}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{capsule.name}</CardTitle>
              {capsule.isLimitedEdition && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  한정판
                </Badge>
              )}
            </div>

            {/* 평점 영역 - 쿠팡 / 커뮤니티 세로 두 줄 */}
            {hasRating && (
              <div className="shrink-0 text-right space-y-0.5">
                {capsule.coupangRating !== null && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">쿠팡</span>{" "}
                    ★ {capsule.coupangRating.toFixed(1)}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">커뮤니티</span>{" "}
                  {serviceRating?.avgRating !== null && serviceRating?.avgRating !== undefined
                    ? `★ ${serviceRating.avgRating.toFixed(1)}`
                    : "아직 없음"}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {capsule.description}
          </p>

          {/* 강도 뱃지 - flavorNotes 위 독립 행 */}
          {capsule.intensity !== null && (
            <div className="mb-2">
              <IntensityBadge intensity={capsule.intensity} />
            </div>
          )}

          {/* 향미 뱃지 */}
          {capsule.flavorNotes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {capsule.flavorNotes.slice(0, 3).map((note) => (
                <Badge key={note} variant="outline" className="text-xs">
                  {note}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
