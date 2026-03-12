import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
        최고의 캡슐 커피를 찾아보세요
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        네스프레소, 돌체구스토, 버츄오 캡슐의 상세 정보와 커뮤니티 리뷰를 한곳에서 확인하세요.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/brands">브랜드 탐색</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/community">커뮤니티</Link>
        </Button>
      </div>
    </section>
  );
}
