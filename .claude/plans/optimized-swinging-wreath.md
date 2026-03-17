# Task 18: GET /api/posts 커서 기반 페이지네이션 추가

## Context

현재 `GET /api/posts`는 단순 배열을 반환하며, cursor/limit 파라미터가 없고 DB 레코드를 snake_case 그대로 노출한다. 무한 스크롤(F021) 구현을 위해 커서 기반 페이지네이션이 필요하다.

- 의존 태스크 12 (`PaginatedResponse<T>` 타입) → **done**
- 의존 태스크 13 (`lib/mappers.ts`, `mapRowToPost`) → **done**

## 담당 에이전트

`nextjs-supabase-dev`

## 수정 대상 파일

- **`frontend/app/api/posts/route.ts`** — GET 핸들러만 수정 (POST 핸들러 유지)

## 구현 계획

### 1단계: Import 추가

```typescript
import { mapRowToPost, type PostRow } from '@/lib/mappers';
import type { PaginatedResponse } from '@/types';
import type { Post } from '@/types';
```

### 2단계: GET 핸들러 수정

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const cursor = searchParams.get('cursor');           // ISO 문자열 (created_at)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50);

  const supabase = createServerSupabaseClient();
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit + 1);  // N+1 패턴으로 hasMore 판별

  if (category) {
    query = query.eq('category', category);
  }

  if (cursor) {
    query = query.lt('created_at', cursor);  // cursor 이전 데이터
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data as PostRow[];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  const response: PaginatedResponse<Post> = {
    data: items.map(mapRowToPost),
    nextCursor,
    hasMore,
  };

  return NextResponse.json(response);
}
```

## 핵심 로직

| 포인트 | 설명 |
|--------|------|
| `limit + 1` 조회 | 한 개 더 가져와 hasMore 판별 (슬라이스 후 반환) |
| `cursor` 없음 | 첫 페이지 반환 (하위 호환성 유지) |
| `cursor` 있음 | `created_at < cursor` 조건으로 이전 데이터 조회 |
| `limit` 상한 | 최대 50 (DoS 방어) |
| 응답 형식 | `{ data: Post[], nextCursor: string \| null, hasMore: boolean }` |

## 검증 방법

### 0단계: 테스트 데이터 삽입 (직접 Supabase SQL 실행)

아래 쿼리를 Supabase SQL 에디터에서 실행하세요. 25개 게시글이 생성됩니다 (limit=5 기준 5페이지).

```sql
INSERT INTO posts (id, title, content, category, author_nickname, view_count, comment_count, created_at, updated_at)
VALUES
  (gen_random_uuid(), '버츄오 플러스 vs 오리지널 라인 차이점 총정리', '많은 분들이 헷갈려하시는 버츄오와 오리지널 라인의 차이를 정리해봤습니다. 버츄오는 바코드 인식 방식으로 캡슐마다 최적의 추출 조건을 자동 설정하고, 오리지널은 압력 방식으로 에스프레소 맛이 더 진합니다. 어떤 머신을 살지 고민이신 분들께 도움이 됐으면 해요!', '정보공유', '커피러버김민준', 48, 12, NOW() - INTERVAL '1 hours', NOW() - INTERVAL '1 hours'),
  (gen_random_uuid(), '아이스 아메리카노 맛있게 만드는 캡슐 추천해요', '여름에 아이스 아메리카노 즐기시는 분들 많으시죠? 저는 인텐시티 9 이상인 캡슐을 더블 에스프레소로 추출해서 얼음 가득한 잔에 부어 마시는 걸 즐겨요. 특히 카사 코라지오가 산미도 있고 시원하게 마시기 딱이더라고요. 다들 어떤 캡슐로 아이스 즐기세요?', '추천', '아이스커피왕이수진', 35, 8, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), '버츄오 넥스트 바코드 인식이 안 될 때 해결 방법 아시는 분?', '새로 산 버츄오 넥스트인데 가끔 캡슐 바코드가 인식이 안 돼서 에러가 나요. 캡슐을 닦아봐도 그렇고, 혹시 같은 증상 겪어보신 분 계신가요? 해결 방법 공유해주시면 감사하겠습니다.', '질문', '버츄오뉴비박성호', 22, 6, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), '오늘 드디어 첫 네스프레소 머신 개봉했어요!', '오랫동안 고민하다가 어썸 레드 색상으로 구매했습니다. 박스 열었을 때 너무 예뻐서 사진 찍느라 추출을 30분 뒤에야 했네요 ㅋㅋ 첫 캡슐은 리스트레또로 시작했는데 생각보다 훨씬 맛있었어요. 이제 캡슐 덕후의 길로 들어선 것 같습니다.', '잡담', '네스프레소새내기정유나', 67, 21, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
  (gen_random_uuid(), '에스프레소 입문자에게 추천하는 캡슐 3가지', '처음 네스프레소 사셨을 때 어떤 캡슐부터 시작하셨나요? 저는 다양하게 써본 결과 입문자에게는 1) 리스트레또 (강렬하지만 짧게), 2) 카푸치노 캡슐 (우유 거품 편하게), 3) 볼루토 (부드럽고 밸런스 좋음) 이 세 가지를 추천드려요.', '추천', '캡슐마스터오준혁', 89, 17, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
  (gen_random_uuid(), '캡슐 커피 머신 물때 제거 얼마나 자주 하세요?', '사용 설명서에는 3개월에 한 번이라고 하는데, 실제로 커피 맛이 달라지는 걸 느끼면 더 자주 해야 할 것 같기도 하고요. 여러분은 디스케일링 주기를 어떻게 잡으세요? 물이 세면 더 자주 해야 한다는 말도 있던데 맞는 얘기인가요?', '질문', '깔끔한커피한지원', 31, 9, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
  (gen_random_uuid(), '캡슐 커피 덕에 월 카페 지출이 7만원 줄었어요', '매일 카페 가던 습관을 캡슐 머신으로 바꾼 지 3개월째입니다. 초기 비용 제외하면 한 잔에 700원 정도라 아메리카노 4,000원짜리 사 먹는 것보다 훨씬 절약이 되더라고요. 무엇보다 출근 전에 집에서 만들어 텀블러에 담아 가는 루틴이 생긴 게 좋아요.', '잡담', '절약왕최민서', 112, 28, NOW() - INTERVAL '7 hours', NOW() - INTERVAL '7 hours'),
  (gen_random_uuid(), '디카페인 캡슐 중에 맛있는 거 있을까요?', '임신 중이라 카페인을 끊었는데 커피 향이 너무 그리워서요. 디카페인 캡슐 드셔보신 분들, 카페인 있는 것과 맛 차이가 많이 나나요? 그나마 맛있는 디카페인 캡슐 추천해 주시면 감사하겠습니다.', '질문', '임산부커피러버강하은', 44, 13, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
  (gen_random_uuid(), '네스프레소 캡슐 리사이클링 하시는 분 계세요?', '네스프레소 공식 리사이클링 백을 받아서 써본 적 있는데 생각보다 반납 절차가 번거롭더라고요. 돌려주는 곳도 한정적이고. 다들 다 쓴 캡슐 어떻게 처리하시나요? 환경이 신경 쓰이긴 하는데 방법이 마땅치 않아서요.', '정보공유', '환경지킴이이지훈', 58, 15, NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours'),
  (gen_random_uuid(), '볼루토 캡슐 한 달 써본 후기', '버츄오 라인 캡슐 중에 볼루토가 입문용으로 가장 많이 추천되던데, 직접 한 달 써보니 정말 밸런스가 좋네요. 산미도 쓴맛도 강하지 않고 부드럽게 마시기 좋았어요. 다만 좀 더 진하고 개성 있는 맛을 원하신다면 스탁 혼다라 쪽을 추천드려요.', '정보공유', '한달사용기윤서연', 76, 19, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),
  (gen_random_uuid(), '사무실에 캡슐 머신 들여놨더니 팀원들 반응이 너무 좋아요', '팀 복지 차원에서 네스프레소 에센차 미니를 사무실에 뒀더니 아침마다 팀원들이 줄 서서 마시네요. 캡슐 비용 공동 부담하자고 했더니 다들 너무 좋아해서 뿌듯합니다. 혹시 사무실용으로 쓰시는 분들, 캡슐 대량 구매 팁 공유해주실 수 있나요?', '잡담', '팀장커피담당자신동욱', 93, 24, NOW() - INTERVAL '11 hours', NOW() - INTERVAL '11 hours'),
  (gen_random_uuid(), '선물용 캡슐 세트 고를 때 참고하세요', '부모님 생신 선물로 캡슐 세트 알아보다가 정리해봤습니다. 네스프레소는 공식몰에서 머신+캡슐 패키지 구성이 가능하고, 별도로 캡슐만 살 때는 버라이어티 팩이 맛을 다양하게 경험할 수 있어 선물용으로 좋아요. 처음 선물하는 분들께 참고가 되셨으면 해요!', '추천', '선물전문가황지은', 55, 11, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
  (gen_random_uuid(), '캡슐 유통기한 지난 거 마셔도 되나요?', '냉장고 정리하다가 유통기한이 두 달 지난 캡슐을 발견했어요. 밀봉 상태이긴 한데 마셔도 괜찮을까요? 알루미늄 캡슐이라 쉽게 상하진 않을 것 같은데 혹시 아시는 분 계시면 알려주세요.', '질문', '절약정신투철한류민아', 27, 7, NOW() - INTERVAL '13 hours', NOW() - INTERVAL '13 hours'),
  (gen_random_uuid(), '캡슐 커피 하루 몇 잔 드세요? 저는 벌써 네 잔째인데...', '아침에 일어나서 한 잔, 출근하고 한 잔, 점심 후 한 잔, 오후 늘어질 때 한 잔... 이게 일상이 돼버렸어요. 여러분은 하루에 몇 잔 드세요? 혹시 카페인 과다 섭취 걱정 안 하세요? 저도 슬슬 줄여야 하나 싶어서요.', '잡담', '카페인중독자임현우', 84, 32, NOW() - INTERVAL '14 hours', NOW() - INTERVAL '14 hours'),
  (gen_random_uuid(), '인텐시티별로 다른 캡슐 추출 맛 비교해봤습니다', '인텐시티 1~13까지 다양한 캡슐을 직접 추출해서 맛을 비교해봤어요. 1~4는 산미가 강하고 가벼운 편, 5~8은 균형 잡힌 맛, 9~11은 쓴맛과 바디감이 올라가고, 12~13은 매우 진하고 강렬한 에스프레소 느낌입니다. 처음에는 중간 강도부터 시작해서 취향을 찾아가시는 걸 추천드려요!', '정보공유', '인텐시티탐구자송가람', 134, 38, NOW() - INTERVAL '15 hours', NOW() - INTERVAL '15 hours');
```

### 1단계: 정적 검사
```bash
cd frontend && npm run typecheck
npm run build
```

### 2단계: Playwright MCP로 API 동작 테스트

개발 서버(`pnpm dev`) 실행 후 Playwright MCP로 아래 시나리오 검증:

1. **첫 페이지 (cursor 없음)**
   - `browser_navigate` → `http://localhost:3000/api/posts?limit=5`
   - 응답: `{ data: [...5개], nextCursor: "...", hasMore: true }` 확인

2. **두 번째 페이지 (cursor 있음)**
   - 첫 페이지의 `nextCursor` 값을 cursor 파라미터로 사용
   - `browser_navigate` → `http://localhost:3000/api/posts?limit=5&cursor={nextCursor}`
   - 응답: cursor 이전 데이터 5개 반환 확인

3. **카테고리 + cursor 조합**
   - `browser_navigate` → `http://localhost:3000/api/posts?category=추천&limit=3`
   - 추천 카테고리만 필터링 후 cursor 연속 조회 확인

4. **limit 상한 테스트**
   - `browser_navigate` → `http://localhost:3000/api/posts?limit=100`
   - 최대 50개만 반환 확인
