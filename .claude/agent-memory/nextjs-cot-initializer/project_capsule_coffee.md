---
name: 캡슐 커피 커뮤니티 프로젝트 초기화 완료
description: MVP 초기화 완료 상태 - placeholder 데이터로 모든 라우트 구현, Notion/Supabase 연동 대기 중
type: project
---

캡슐 커피 커뮤니티 MVP 초기화가 2026-03-12에 완료되었습니다.

**아키텍처**: Notion CMS (브랜드/캡슐) + Supabase (리뷰/게시글/댓글) + Vercel 배포 + Cloudflare Turnstile

**URL 패턴**: `/brands/[brandSlug]` + `/capsules/[capsuleSlug]` 분리 구조

**현재 상태**:
- 모든 페이지 placeholder 데이터로 구현 완료
- API 라우트 4개 (reviews, posts, comments, turnstile) 구현 완료
- 빌드 성공 확인 (pnpm build clean)
- Turnstile 토큰은 "dev-bypass" 임시값 사용 중

**다음 단계**:
1. Supabase 테이블 생성 (reviews, posts, comments)
2. Notion 데이터베이스 연동 (브랜드/캡슐 실데이터)
3. Cloudflare Turnstile 위젯 컴포넌트 구현
4. 환경변수 설정 (.env.local)

**Why:** PRD 기반 캡슐 커피 커뮤니티 서비스, 노션 CMS를 백엔드로 활용하여 비개발자도 콘텐츠 관리 가능하게 함

**How to apply:** 앞으로 추가 기능 구현 시 placeholder TODO 주석이 있는 곳부터 실데이터 연동 작업 진행
