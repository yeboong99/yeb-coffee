import { cn } from "@/lib/utils";

interface IntensityBadgeProps {
  intensity: number;
}

export function IntensityBadge({ intensity }: IntensityBadgeProps) {
  // 강도 레벨에 따른 색상 결정
  const getColorClasses = (level: number) => {
    if (level <= 6)
      return {
        badge: "text-green-700 border-green-300 bg-green-50",
        bars: ["bg-green-600", "bg-green-200", "bg-green-200"],
      };
    if (level <= 9)
      return {
        badge: "text-orange-700 border-orange-300 bg-orange-50",
        bars: ["bg-orange-600", "bg-orange-600", "bg-orange-300"],
      };
    return {
      badge: "text-red-700 border-red-300 bg-red-50",
      bars: ["bg-red-600", "bg-red-600", "bg-red-600"],
    };
  };

  const { badge, bars } = getColorClasses(intensity);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        badge,
      )}
    >
      강도
      <span className="inline-flex items-center gap-0.5 mx-0.5">
        {bars.map((barColor, i) => (
          <span
            key={i}
            className={cn("inline-block w-[3px] h-3 rounded-sm", barColor)}
          />
        ))}
      </span>
      {intensity}
    </span>
  );
}
