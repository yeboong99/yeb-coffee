import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostList } from "@/components/community/post-list";
import { PenSquare } from "lucide-react";
import type { Post, PostCategory } from "@/types";

// TODO: Supabase에서 실제 데이터 가져오기
const placeholderPosts: Post[] = [
  {
    id: "1",
    title: "네스프레소 버츄오 넥스트 추천 캡슐 TOP 5",
    content: "오늘은 버츄오 넥스트와 잘 어울리는 캡슐 5가지를 소개합니다...",
    category: "추천",
    authorNickname: "커피러버",
    viewCount: 320,
    commentCount: 12,
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "2",
    title: "돌체구스토 캡슐 보관 방법 공유합니다",
    content: "캡슐을 오래 신선하게 보관하는 방법에 대해 알아봤습니다...",
    category: "정보공유",
    authorNickname: "에스프레소마스터",
    viewCount: 185,
    commentCount: 7,
    createdAt: "2026-03-09T14:00:00Z",
    updatedAt: "2026-03-09T14:00:00Z",
  },
  {
    id: "3",
    title: "오리지널 vs 버츄오 어떤 머신이 더 좋나요?",
    content: "처음 구매를 고려 중인데 두 머신의 차이가 궁금합니다...",
    category: "질문",
    authorNickname: "커피초보",
    viewCount: 410,
    commentCount: 28,
    createdAt: "2026-03-08T09:00:00Z",
    updatedAt: "2026-03-08T09:00:00Z",
  },
  {
    id: "4",
    title: "오늘 새로 나온 한정판 캡슐 사봤어요",
    content: "오늘 동네 매장에 들렀다가 한정판 캡슐을 발견해서 바로 구매했습니다...",
    category: "잡담",
    authorNickname: "네스프레소팬",
    viewCount: 95,
    commentCount: 4,
    createdAt: "2026-03-07T18:00:00Z",
    updatedAt: "2026-03-07T18:00:00Z",
  },
];

const CATEGORIES: (PostCategory | "전체")[] = ["전체", "정보공유", "추천", "질문", "잡담"];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
          <p className="text-muted-foreground">캡슐 커피에 대한 정보와 경험을 나눠보세요.</p>
        </div>
        <Button asChild>
          <Link href="/community/write">
            <PenSquare className="h-4 w-4 mr-2" />
            글쓰기
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="전체">
        <TabsList className="mb-6">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="전체">
          <PostList posts={placeholderPosts} />
        </TabsContent>
        {(["정보공유", "추천", "질문", "잡담"] as PostCategory[]).map((cat) => (
          <TabsContent key={cat} value={cat}>
            <PostList posts={placeholderPosts.filter((p) => p.category === cat)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
