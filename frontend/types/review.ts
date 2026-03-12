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
