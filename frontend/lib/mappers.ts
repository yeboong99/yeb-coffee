import type { Post, PostCategory, Review } from '@/types';

// Supabase posts 테이블 레코드 타입 (snake_case)
export interface PostRow {
  id: string;
  title: string;
  content: string;
  category: string;
  author_nickname: string;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

// Supabase reviews 테이블 레코드 타입 (snake_case)
export interface ReviewRow {
  id: string;
  capsule_id: string;
  capsule_slug: string;
  author_nickname: string;
  rating: number;
  content: string;
  created_at: string;
}

// snake_case DB 레코드를 camelCase Post 타입으로 변환
export function mapRowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category as PostCategory,
    authorNickname: row.author_nickname,
    viewCount: row.view_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// snake_case DB 레코드를 camelCase Review 타입으로 변환
export function mapRowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    capsuleId: row.capsule_id,
    capsuleSlug: row.capsule_slug,
    authorNickname: row.author_nickname,
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    content: row.content,
    createdAt: row.created_at,
  };
}
