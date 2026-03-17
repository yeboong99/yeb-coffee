"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "@/lib/api";
import { PostCard } from "./post-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginatedResponse } from "@/types";
import type { Post } from "@/types";

interface Props {
  initialData: PaginatedResponse<Post>;
  category?: string;
}

export function PostListInfinite({ initialData, category }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts", category ?? "all"],
      queryFn: ({ pageParam }) =>
        getPosts({
          category,
          cursor: pageParam as string | undefined,
          limit: 10,
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
      initialData: {
        pages: [initialData],
        pageParams: [undefined],
      },
    });

  // IntersectionObserver로 하단 감지 시 다음 페이지 로드
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div>
      <div className="flex flex-col gap-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* 스켈레톤 로딩 */}
      {isFetchingNextPage && (
        <div className="flex flex-col gap-2 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* 하단 감지 요소 */}
      <div ref={bottomRef} className="h-1" />

      {/* 모든 게시글 로드 완료 */}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          모든 게시글을 확인했습니다.
        </p>
      )}
    </div>
  );
}
