# Task 24: review-form.tsx에서 router.refresh() 제거

## Context
리뷰 목록 갱신 방식이 `router.refresh()` (서버 컴포넌트 재요청) 에서
`ReviewListInfinite` 내부의 `queryClient.invalidateQueries` (React Query 캐시 무효화) 로
변경되었다. 따라서 `review-form.tsx`에서 `router.refresh()` 호출과 관련 `useRouter` 의존성을
제거해야 한다.

## 담당 서브에이전트
- **nextjs-supabase-dev**: 코드 수정 담당 (UI 변경 없음)

## 수정 대상 파일
- `frontend/components/review/review-form.tsx`

## 변경 내용

### 1. import 제거 (line 4)
```diff
- import { useRouter } from "next/navigation";
```

### 2. router 변수 선언 제거 (line 32)
```diff
- const router = useRouter();
```

### 3. router.refresh() 호출 및 주석 제거 (line 70-71)
```diff
- // 서버 컴포넌트(ReviewList) 데이터 재조회를 위해 페이지 갱신
- router.refresh();
  onSuccess?.(); // 유지
```

## 변경 후 onSubmit 핵심 부분
```typescript
toast.success("리뷰가 등록되었습니다.");
reset();
setRating(0);
setTurnstileToken("");
onSuccess?.(); // 콜백만 호출 (ReviewListInfinite가 invalidateQueries 처리)
```

## 검증
1. `npm run typecheck` — 타입 에러 없음 확인
2. `npm run build` — 빌드 성공 확인
3. `useRouter` import 및 `router` 변수가 파일에서 완전히 제거됐는지 확인
