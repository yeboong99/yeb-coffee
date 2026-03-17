export type PostCategory = "정보공유" | "추천" | "질문" | "잡담";

export interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  authorNickname: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  category: PostCategory;
  authorNickname: string;
  turnstileToken: string;
}
