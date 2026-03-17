"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  // 하이드레이션 불일치 방지를 위한 마운트 감지 패턴 (next-themes 표준 관용구)
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      aria-label="테마 전환"
      className={`relative inline-flex h-7 w-[52px] items-center rounded-full transition-colors duration-300 focus:outline-none ${
        isDark ? "bg-gray-800" : "bg-gray-200"
      }`}
    >
      <span
        style={{
          transform: isDark ? "translateX(26px)" : "translateX(2px)",
          backgroundColor: isDark ? "#000" : "#fff",
          transition: "transform 300ms, background-color 300ms",
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full"
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-white" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-black" />
        )}
      </span>
    </button>
  );
}
