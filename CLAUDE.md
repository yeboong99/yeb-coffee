# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

Next.js 16 기반 프론트엔드 웹 애플리케이션.

## 기술 스택

- **프론트엔드:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, React Query v5, pnpm

## 프론트엔드 구조

`frontend/` 디렉토리가 프로젝트 루트입니다.

- `app/(main)/` - Route Group: 홈(/), 문서(/docs), 예제(/examples), 상태(/status)
- `components/` - home, layout, status, docs, examples, ui(shadcn ~30개)
- `lib/` - api.ts, query-provider.tsx, utils.ts

## 주요 설정 파일

- `frontend/next.config.ts` - Next.js 설정
- `frontend/package.json` - 의존성 및 스크립트

## 로컬 개발

```bash
cd frontend
pnpm install
pnpm dev
```

---

## 이 프로젝트는 현재 스타터킷 상태입니다.

- 이 스타터킷을 이용한 첫 claude /init 을 실행할 경우 기획부터 하면 된다고 안내하세요.
