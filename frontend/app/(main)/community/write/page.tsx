import { PostForm } from "@/components/community/post-form";

export default function CommunityWritePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">게시글 작성</h1>
        <p className="text-muted-foreground">커뮤니티에 글을 남겨보세요.</p>
      </div>
      <PostForm />
    </div>
  );
}
