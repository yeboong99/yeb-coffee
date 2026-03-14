export interface Review {
  id: string;
  capsuleId: string;
  capsuleSlug: string;
  authorNickname: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  createdAt: string;
}

export interface CreateReviewInput {
  capsuleId: string;
  capsuleSlug: string;
  authorNickname: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  turnstileToken: string;
}

// 커뮤니티 서비스 자체 평점 (Supabase 집계)
export interface ServiceRating {
  avgRating: number | null;
  reviewCount: number;
}
