import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
