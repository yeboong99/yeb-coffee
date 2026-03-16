import Link from 'next/link';
import Image from 'next/image';
import { getAllCapsules } from '@/lib/notion';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { Capsule } from '@/types';

interface ReviewStat {
  capsule_slug: string;
  avg_rating: number;
  review_count: number;
}

/** capsule_review_stats 뷰에서 평점 통계 조회 */
async function fetchReviewStats(): Promise<ReviewStat[] | null> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('capsule_review_stats')
      .select('capsule_slug, avg_rating, review_count');
    return (data as ReviewStat[]) ?? null;
  } catch {
    return null;
  }
}

export async function TopCapsules() {
  // Notion + Supabase 병렬 조회
  const [allCapsules, statsResult] = await Promise.all([
    getAllCapsules().catch(() => [] as Capsule[]),
    fetchReviewStats(),
  ]);

  // 쿠팡 평점 Top 5 (coupangRating DESC, null 제외)
  const coupangTop5 =
    allCapsules.length > 0
      ? [...allCapsules]
          .filter((c: Capsule) => c.coupangRating !== null)
          .sort((a: Capsule, b: Capsule) => (b.coupangRating ?? 0) - (a.coupangRating ?? 0))
          .slice(0, 5)
      : null;

  // 서비스 평점 Top 5 (review_count >= 5, avg_rating DESC)
  const capsuleMap = new Map<string, Capsule>(allCapsules.map((c: Capsule) => [c.slug, c]));
  const serviceTop5 = statsResult
    ? statsResult
        .filter((s: ReviewStat) => s.review_count >= 5)
        .sort((a: ReviewStat, b: ReviewStat) => b.avg_rating - a.avg_rating)
        .slice(0, 5)
        .map((s: ReviewStat) => ({ stat: s, capsule: capsuleMap.get(s.capsule_slug) }))
        .filter((item: { stat: ReviewStat; capsule: Capsule | undefined }) => item.capsule !== undefined)
    : null;

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">캡슐 Top 5 랭킹</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 쿠팡 평점 Top 5 */}
        {coupangTop5 !== null && (
          <div>
            <h3 className="text-lg font-semibold mb-4">쿠팡 평점 Top 5</h3>
            <ol className="space-y-3">
              {coupangTop5.map((capsule: Capsule, i: number) => (
                <li key={capsule.id}>
                  <Link
                    href={`/capsules/${capsule.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    {capsule.imageUrl && (
                      <Image
                        src={capsule.imageUrl}
                        alt={capsule.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{capsule.name}</p>
                      <p className="text-sm text-muted-foreground">{capsule.brandName}</p>
                    </div>
                    <span className="text-sm font-semibold">{capsule.coupangRating?.toFixed(1)}점</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
        {/* 서비스 평점 Top 5 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">서비스 평점 Top 5</h3>
          {serviceTop5 === null || serviceTop5.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              아직 충분한 리뷰가 없습니다.
            </p>
          ) : (
            <ol className="space-y-3">
              {serviceTop5.map(
                (
                  item: { stat: ReviewStat; capsule: Capsule | undefined },
                  i: number,
                ) =>
                  item.capsule && (
                    <li key={item.capsule.id}>
                      <Link
                        href={`/capsules/${item.capsule.slug}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                        {item.capsule.imageUrl && (
                          <Image
                            src={item.capsule.imageUrl}
                            alt={item.capsule.name}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.capsule.name}</p>
                          <p className="text-sm text-muted-foreground">{item.capsule.brandName}</p>
                        </div>
                        <span className="text-sm font-semibold">
                          {item.stat.avg_rating.toFixed(1)}점
                        </span>
                      </Link>
                    </li>
                  ),
              )}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
