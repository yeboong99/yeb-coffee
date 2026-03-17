"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostCategory } from "@/types";

// 카테고리 목록
const CATEGORIES: (PostCategory | "전체")[] = [
  "전체",
  "정보공유",
  "추천",
  "질문",
  "잡담",
];

/**
 * 카테고리 탭 클라이언트 컴포넌트
 * 탭 클릭 시 URL searchParams를 변경하여 서버 컴포넌트(community/page.tsx) 재렌더링을 트리거합니다.
 */
export function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL searchParams에서 현재 카테고리 읽기 (없으면 "전체")
  const currentCategory = searchParams.get("category") ?? "전체";

  const handleTabChange = (value: string) => {
    if (value === "전체") {
      router.push("/community");
    } else {
      router.push(`/community?category=${encodeURIComponent(value)}`);
    }
  };

  return (
    <Tabs value={currentCategory} onValueChange={handleTabChange}>
      <TabsList className="mb-6">
        {CATEGORIES.map((cat) => (
          <TabsTrigger key={cat} value={cat}>
            {cat}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
