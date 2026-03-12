import type {
  Post,
  Review,
  Comment,
  CreateReviewInput,
  CreatePostInput,
  CreateCommentInput,
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

export async function getReviews(capsuleSlug: string): Promise<Review[]> {
  const res = await fetch(`${BASE_URL}/api/reviews?capsuleSlug=${capsuleSlug}`);
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

export async function getPosts(category?: string): Promise<Post[]> {
  const url = category
    ? `${BASE_URL}/api/posts?category=${encodeURIComponent(category)}`
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
