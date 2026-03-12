import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Capsule } from "@/types";

interface CapsuleDetailProps {
  capsule: Capsule;
}

export function CapsuleDetail({ capsule }: CapsuleDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-3xl font-bold">{capsule.name}</h1>
          {capsule.isLimitedEdition && <Badge variant="secondary">한정판</Badge>}
          {capsule.isDiscontinued && <Badge variant="destructive">단종</Badge>}
        </div>
        <p className="text-muted-foreground">{capsule.brandName}</p>
      </div>

      <Separator />

      <p className="text-base leading-relaxed">{capsule.description}</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {capsule.intensity !== null && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">강도</p>
            <p className="font-semibold">{capsule.intensity} / 13</p>
          </div>
        )}
        {capsule.averageRating !== null && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">평균 평점</p>
            <p className="font-semibold">★ {capsule.averageRating.toFixed(1)}</p>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">리뷰 수</p>
          <p className="font-semibold">{capsule.reviewCount}개</p>
        </div>
      </div>

      {capsule.flavorNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">향미</p>
          <div className="flex flex-wrap gap-2">
            {capsule.flavorNotes.map((note) => (
              <Badge key={note} variant="outline">{note}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
