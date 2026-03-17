import type {
  Post,
  Review,
  Comment,
  CreateReviewInput,
  CreatePostInput,
  CreateCommentInput,
  PaginatedResponse,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

// Reviews
export async function createReview(input: CreateReviewInput): Promise<Review> {
  const res = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('리뷰 작성에 실패했습니다.');
  return res.json();
}

export async function getReviews(
  capsuleSlug: string,
  params?: { cursor?: string; limit?: number }
): Promise<PaginatedResponse<Review>> {
  const urlParams = new URLSearchParams({ capsuleSlug });
  if (params?.cursor) urlParams.set('cursor', params.cursor);
  if (params?.limit) urlParams.set('limit', String(params.limit));

  const res = await fetch(`${BASE_URL}/api/reviews?${urlParams.toString()}`);
  if (!res.ok) throw new Error('리뷰를 불러오지 못했습니다.');
  return res.json();
}

// Posts
export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('게시글 작성에 실패했습니다.');
  return res.json();
}

export async function getPosts(params?: {
  category?: string;
  cursor?: string;
  limit?: number;
}): Promise<PaginatedResponse<Post>> {
  const urlParams = new URLSearchParams();
  if (params?.category) urlParams.set('category', params.category);
  if (params?.cursor) urlParams.set('cursor', params.cursor);
  if (params?.limit) urlParams.set('limit', String(params.limit));

  const query = urlParams.toString();
  const url = query
    ? `${BASE_URL}/api/posts?${query}`
    : `${BASE_URL}/api/posts`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('게시글을 불러오지 못했습니다.');
  return res.json();
}

// Comments
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const res = await fetch(`${BASE_URL}/api/posts/${input.postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('댓글 작성에 실패했습니다.');
  return res.json();
}

export async function getComments(postId: string): Promise<Comment[]> {
  const res = await fetch(`${BASE_URL}/api/posts/${postId}/comments`);
  if (!res.ok) throw new Error('댓글을 불러오지 못했습니다.');
  return res.json();
}
