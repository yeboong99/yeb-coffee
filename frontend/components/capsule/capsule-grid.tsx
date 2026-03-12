import { CapsuleCard } from "./capsule-card";
import type { Capsule } from "@/types";

interface CapsuleGridProps {
  capsules: Capsule[];
}

export function CapsuleGrid({ capsules }: CapsuleGridProps) {
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
        <CapsuleCard key={capsule.id} capsule={capsule} />
      ))}
    </div>
  );
}
