export interface Comment {
  id: string;
  postId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
  postId: string;
  authorNickname: string;
  content: string;
  turnstileToken: string;
}
