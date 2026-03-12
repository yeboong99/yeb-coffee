import { BrandGrid } from "@/components/brand/brand-grid";
import type { Brand } from "@/types";

// TODO: 노션 CMS에서 실제 데이터 가져오기
const placeholderBrands: Brand[] = [
  {
    id: "1",
    slug: "nespresso",
    name: "네스프레소",
    description: "오리지널 라인 캡슐 커피 브랜드",
    logoUrl: null,
    websiteUrl: "https://www.nespresso.com",
    country: "스위스",
    capsuleCount: 40,
  },
  {
    id: "2",
    slug: "dolce-gusto",
    name: "돌체구스토",
    description: "다양한 음료를 즐길 수 있는 캡슐",
    logoUrl: null,
    websiteUrl: "https://www.dolce-gusto.com",
    country: "스위스",
    capsuleCount: 35,
  },
  {
    id: "3",
    slug: "vertuo",
    name: "버츄오",
    description: "버츄오 전용 바코드 인식 캡슐",
    logoUrl: null,
    websiteUrl: "https://www.nespresso.com/vertuo",
    country: "스위스",
    capsuleCount: 20,
  },
  {
    id: "4",
    slug: "lavazza",
    name: "라바짜",
    description: "이탈리아 전통 에스프레소 브랜드",
    logoUrl: null,
    websiteUrl: "https://www.lavazza.com",
    country: "이탈리아",
    capsuleCount: 15,
  },
];

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">브랜드 탐색</h1>
        <p className="text-muted-foreground">다양한 캡슐 커피 브랜드를 만나보세요.</p>
      </div>
      <BrandGrid brands={placeholderBrands} />
    </div>
  );
}
