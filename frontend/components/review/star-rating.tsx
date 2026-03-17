"use client";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
}: StarRatingProps) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            sizeClass,
            "leading-none",
            interactive &&
              "cursor-pointer hover:scale-110 transition-transform",
            !interactive && "cursor-default",
            star <= value ? "text-yellow-400" : "text-muted-foreground/30",
          )}
          aria-label={`${star}점`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
