import { CapsuleCard } from "./capsule-card";
import type { Capsule } from "@/types";
import type { ServiceRating } from "@/types/review";

interface CapsuleGridProps {
  capsules: Capsule[];
  // 슬러그를 키로 하는 서비스 평점 맵 (선택적)
  serviceRatings?: Record<string, ServiceRating>;
}

export function CapsuleGrid({ capsules, serviceRatings }: CapsuleGridProps) {
  if (capsules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 캡슐이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {capsules.map((capsule) => (
        <CapsuleCard
          key={capsule.id}
          capsule={capsule}
          serviceRating={serviceRatings?.[capsule.slug]}
        />
      ))}
    </div>
  );
}
