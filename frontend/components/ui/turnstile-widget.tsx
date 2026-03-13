"use client";

import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  /** 인증 성공 시 호출되는 콜백 (토큰 전달) */
  onSuccess: (token: string) => void;
  /** 인증 실패 시 호출되는 콜백 */
  onError?: () => void;
  /** 인증 만료 시 호출되는 콜백 */
  onExpire?: () => void;
}

/**
 * Cloudflare Turnstile CAPTCHA 위젯 컴포넌트
 * 환경 변수 NEXT_PUBLIC_TURNSTILE_SITE_KEY가 설정되어 있어야 합니다.
 */
export function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // 사이트 키가 없는 경우 에러 로그만 출력하고 null 반환
  if (!siteKey) {
    console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY가 설정되지 않았습니다.");
    return null;
  }

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onSuccess}
      onError={onError}
      onExpire={onExpire}
      options={{
        theme: "auto",
        size: "normal",
      }}
    />
  );
}
