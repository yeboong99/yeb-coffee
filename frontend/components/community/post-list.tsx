import { PostCard } from "./post-card";
import type { Post } from "@/types";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
