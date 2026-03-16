# Task 14: 기존 인라인 매퍼를 lib/mappers.ts import로 교체

## Context
Task 14는 3개 파일의 인라인 PostRow/ReviewRow 정의를 lib/mappers.ts에서 import로 교체하는 리팩토링 작업입니다.
그러나 탐색 결과, 이미 이전 작업(Task 13, mappers.ts 생성)에서 마이그레이션이 완료된 상태입니다.

## 현재 상태 (이미 완료됨)

| 파일 | 상태 | import 위치 |
|------|------|-------------|
| `frontend/app/(main)/page.tsx:6` | ✅ 완료 | `import { mapRowToPost, type PostRow } from "@/lib/mappers"` |
| `frontend/app/(main)/community/page.tsx:7` | ✅ 완료 | `import { mapRowToPost, type PostRow } from "@/lib/mappers"` |
| `frontend/components/review/review-list.tsx:4` | ✅ 완료 | `import { mapRowToReview, type ReviewRow } from "@/lib/mappers"` |
| `frontend/lib/mappers.ts` | ✅ 중앙 정의 | PostRow, ReviewRow, mapRowToPost, mapRowToReview 모두 정의됨 |

## 실행 계획

코드 변경 없음. 아래 한 가지 작업만 수행:

1. **Taskmaster Task 14 상태를 `done`으로 업데이트**
   - `mcp__taskmaster-ai__set_task_status` 호출: id=14, status=done

## 검증
- `npm run build` 빌드 성공 확인 (이미 성공 중일 것으로 예상)
- `npm run typecheck` 타입 에러 없음 확인
