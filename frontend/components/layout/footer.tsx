import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto">
      <Separator />
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} 캡슐 커피 커뮤니티</span>
        <span>네스프레소, 돌체구스토, 버츄오 캡슐 정보 및 리뷰 커뮤니티</span>
      </div>
    </footer>
  );
}
