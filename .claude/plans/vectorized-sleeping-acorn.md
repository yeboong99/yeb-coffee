# Task 14: 기존 인라인 매퍼를 lib/mappers.ts import로 교체

## Context
코드 중복 제거 리팩토링 작업. PostRow, ReviewRow 인터페이스와 변환 함수들이 여러 파일에 인라인으로 중복 정의되어 있던 것을 `lib/mappers.ts`에 중앙화하고, 각 사용처에서 import로 교체하는 작업.

## 현재 상태: 이미 완료됨

탐색 결과, 3개 파일 모두 이미 `@/lib/mappers`에서 import를 사용하고 있으며 인라인 정의가 없습니다.

### 확인된 파일 상태

| 파일 | import 사용 | 인라인 정의 |
|------|------------|------------|
| `frontend/app/(main)/page.tsx:6` | ✅ `import { mapRowToPost, type PostRow } from "@/lib/mappers"` | 없음 |
| `frontend/app/(main)/community/page.tsx:7` | ✅ `import { mapRowToPost, type PostRow } from "@/lib/mappers"` | 없음 |
| `frontend/components/review/review-list.tsx:4` | ✅ `import { mapRowToReview, type ReviewRow } from "@/lib/mappers"` | 없음 |

### lib/mappers.ts 구성
- `PostRow` 인터페이스 (4-14줄)
- `ReviewRow` 인터페이스 (17-25줄)
- `mapRowToPost()` 함수 (28-40줄)
- `mapRowToReview()` 함수 (43-53줄)

## 실행 계획

코드 변경 불필요. 태스크 상태만 `done`으로 업데이트한다.

### 검증
- `npm run build` 성공 확인
- `npm run typecheck` 타입 에러 없음 확인

## 수정 파일
없음 (이미 완료된 상태)
