# 사이트명 및 파비콘 변경 플랜

## Context
브랜딩 변경 요청: 사이트명을 "캡슐 커피 커뮤니티"에서 "Yeb Coffee"로, 파비콘을 커피 이모지(☕)로 변경한다.

---

## 변경 파일

### 1. `frontend/app/layout.tsx`
metadata의 title을 "Yeb Coffee"로 변경

```tsx
// 변경 전
export const metadata: Metadata = {
  title: {
    default: "캡슐 커피 커뮤니티",
    template: "%s | 캡슐 커피 커뮤니티",
  },
  ...
};

// 변경 후
export const metadata: Metadata = {
  title: {
    default: "Yeb Coffee",
    template: "%s | Yeb Coffee",
  },
  ...
};
```

---

### 2. `frontend/components/layout/footer.tsx`
copyright 텍스트 변경

```tsx
// 변경 전
<span>© {new Date().getFullYear()} 캡슐 커피 커뮤니티</span>

// 변경 후
<span>© {new Date().getFullYear()} Yeb Coffee</span>
```

---

### 3. `frontend/app/icon.tsx` (신규 생성)
Next.js App Router의 `icon.tsx` 파일을 생성하여 커피 이모지(☕) 파비콘으로 설정.
`ImageResponse`를 사용해 32x32 PNG를 동적 생성하며, `app/favicon.ico`보다 우선 적용된다.

```tsx
import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ☕
      </div>
    ),
    { ...size },
  );
}
```

> 기존 `app/favicon.ico`는 레거시 브라우저용으로 유지한다.

---

## 검증 방법

1. `cd frontend && pnpm dev` 로 로컬 서버 실행
2. `http://localhost:3000` 접속 후 확인:
   - 브라우저 탭 제목이 "Yeb Coffee"로 표시
   - 브라우저 탭 파비콘이 ☕ 커피 이모지로 표시
   - 페이지별 탭 제목이 "{페이지명} | Yeb Coffee" 형식
3. 푸터에서 "Yeb Coffee" 텍스트 확인
4. `pnpm run check-all && pnpm run build` 통과 확인
