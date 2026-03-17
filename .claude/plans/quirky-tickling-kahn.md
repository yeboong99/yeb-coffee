# Task 17: 홈 페이지에 TopCapsules 컴포넌트 삽입

## Context

Task 17의 목표는 `frontend/app/(main)/page.tsx`에서 `BrandShowcase` 아래, `PopularPosts` 위에 `TopCapsules` 컴포넌트를 삽입하는 것입니다. 의존 태스크 14(mappers 리팩토링), 16(TopCapsules 컴포넌트 구현)이 모두 완료된 상태입니다.

## 현재 상태 분석

**이미 구현 완료된 것으로 확인됨:**

`frontend/app/(main)/page.tsx` 파일을 확인한 결과:
- line 4: `import { TopCapsules } from "@/components/home/top-capsules";` ✅
- line 36: `<TopCapsules />` 이미 `BrandShowcase`와 `PopularPosts` 사이에 삽입 ✅
- line 11: `export const revalidate = 3600;` 유지 ✅
- `frontend/components/home/top-capsules.tsx` 파일 존재 ✅

## 작업 계획

Task 17의 코드 변경 사항은 **이미 적용**되어 있습니다. 따라서 nextjs-supabase-dev 에이전트가 수행할 작업은:

### 1. 검증 (Verification)
- `npm run build` 실행하여 빌드 성공 확인
- `npm run typecheck` 타입 에러 없음 확인

### 2. 태스크 상태 업데이트
- Task 17 상태를 `pending` → `done`으로 변경

## 핵심 파일

- `frontend/app/(main)/page.tsx` — 이미 완료, 변경 불필요
- `frontend/components/home/top-capsules.tsx` — Task 16에서 구현 완료

## 검증 방법

```bash
cd frontend
npm run build   # 빌드 성공 확인
npm run typecheck  # 타입 에러 없음 확인
```
