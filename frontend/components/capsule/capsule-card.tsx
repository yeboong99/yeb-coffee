import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Capsule } from "@/types";

interface CapsuleCardProps {
  capsule: Capsule;
}

export function CapsuleCard({ capsule }: CapsuleCardProps) {
  return (
    <Link href={`/capsules/${capsule.slug}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{capsule.name}</CardTitle>
            {capsule.isLimitedEdition && (
              <Badge variant="secondary" className="shrink-0 text-xs">한정판</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {capsule.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            {capsule.intensity !== null && (
              <span className="text-muted-foreground">강도 {capsule.intensity}</span>
            )}
            {capsule.averageRating !== null && (
              <span className="text-muted-foreground">
                ★ {capsule.averageRating.toFixed(1)} ({capsule.reviewCount})
              </span>
            )}
          </div>
          {capsule.flavorNotes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
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
