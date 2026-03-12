import { z } from 'zod';

export const reviewSchema = z.object({
  capsuleId: z.string().min(1),
  capsuleSlug: z.string().min(1),
  authorNickname: z.string().min(1).max(20),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10).max(500),
  turnstileToken: z.string().min(1),
});

export const postSchema = z.object({
  title: z.string().min(2).max(100),
  content: z.string().min(10).max(5000),
  category: z.enum(['정보공유', '추천', '질문', '잡담']),
  authorNickname: z.string().min(1).max(20),
  turnstileToken: z.string().min(1),
});

export const commentSchema = z.object({
  postId: z.string().min(1),
  authorNickname: z.string().min(1).max(20),
  content: z.string().min(1).max(500),
  turnstileToken: z.string().min(1),
});
