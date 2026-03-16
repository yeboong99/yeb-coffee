# Task 13: lib/mappers.ts 생성 및 공통 매퍼 함수 추출

## Context

현재 `mapRowToPost()`와 `mapRowToReview()` 함수가 여러 파일에 인라인으로 중복 정의되어 있어,
수정 시 모든 파일을 동시에 변경해야 하는 유지보수 문제가 있습니다.
이를 `frontend/lib/mappers.ts` 단일 파일로 추출해 단일 소스로 관리합니다.

## 현황 파악

| 중복 함수 | 위치 |
|---|---|
| `mapRowToPost` | `app/(main)/page.tsx` (25~37줄) |
| `mapRowToPost` | `app/(main)/community/page.tsx` (26~38줄) |
| `mapRowToReview` | `components/review/review-list.tsx` (22~32줄) |

## 구현 계획 (nextjs-supabase-dev 서브에이전트 담당)

### Step 1: `frontend/lib/mappers.ts` 신규 생성

아래 내용을 그대로 작성:
- `PostRow` 인터페이스
- `ReviewRow` 인터페이스
- `mapRowToPost(row: PostRow): Post` 함수
- `mapRowToReview(row: ReviewRow): Review` 함수

```typescript
import type { Post, PostCategory } from '@/types';
import type { Review } from '@/types';

export interface PostRow { ... }
export interface ReviewRow { ... }
export function mapRowToPost(row: PostRow): Post { ... }
export function mapRowToReview(row: ReviewRow): Review { ... }
```

### Step 2: 기존 인라인 정의 제거 및 import 교체

각 파일에서:
1. `PostRow` / `ReviewRow` 인터페이스 인라인 정의 삭제
2. 인라인 `mapRowToPost` / `mapRowToReview` 함수 정의 삭제
3. 파일 상단에 `import { mapRowToPost, PostRow } from '@/lib/mappers'` 추가
4. `review-list.tsx`에는 `import { mapRowToReview, ReviewRow } from '@/lib/mappers'` 추가

### 수정 대상 파일

- `frontend/lib/mappers.ts` — 신규 생성
- `frontend/app/(main)/page.tsx` — 인라인 정의 제거 + import 추가
- `frontend/app/(main)/community/page.tsx` — 인라인 정의 제거 + import 추가
- `frontend/components/review/review-list.tsx` — 인라인 정의 제거 + import 추가

## 검증

```bash
cd frontend
npm run typecheck   # 타입 에러 없음 확인
npm run build       # 빌드 성공 확인
```
