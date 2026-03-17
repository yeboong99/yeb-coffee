export type { Brand } from "./brand";
export type { Capsule, IntensityLevel, FlavorNote } from "./capsule";
export type { Review, CreateReviewInput } from "./review";
export type { Post, PostCategory, CreatePostInput } from "./post";
export type { Comment, CreateCommentInput } from "./comment";

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
