import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ServiceRating } from '@/types/review';

// 브라우저 클라이언트 (싱글톤, lazy)
let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
    }
    _supabase = createClient(url, anonKey);
  }
  return _supabase;
}

// 브라우저 클라이언트 직접 접근 (환경 변수가 있는 경우에만 사용)
export const supabase = {
  get client() {
    return getSupabaseClient();
  },
};

// 서버 클라이언트 (서비스 롤, API 라우트 전용)
export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase 서버 환경 변수가 설정되지 않았습니다.');
  }
  return createClient(url, serviceKey);
}

// ============================================================
// 서비스 평점 조회 함수 (capsule_review_stats 뷰 사용)
// ============================================================

/** 단일 캡슐 서비스 평점 조회 */
export async function getServiceRating(capsuleSlug: string): Promise<ServiceRating> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('capsule_review_stats')
    .select('avg_rating, review_count')
    .eq('capsule_slug', capsuleSlug)
    .single();

  if (error || !data) {
    return { avgRating: null, reviewCount: 0 };
  }

  return {
    avgRating: data.avg_rating,
    reviewCount: data.review_count,
  };
}

/** 복수 캡슐 서비스 평점 일괄 조회 */
export async function getServiceRatings(
  capsuleSlugs: string[]
): Promise<Record<string, ServiceRating>> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('capsule_review_stats')
    .select('capsule_slug, avg_rating, review_count')
    .in('capsule_slug', capsuleSlugs);

  if (error || !data) {
    return {};
  }

  // 슬러그를 키로 하는 맵으로 변환
  return data.reduce((acc, row) => {
    acc[row.capsule_slug] = {
      avgRating: row.avg_rating,
      reviewCount: row.review_count,
    };
    return acc;
  }, {} as Record<string, ServiceRating>);
}
