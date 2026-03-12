import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const BRAND_DATABASE_ID = process.env.NOTION_BRAND_DATABASE_ID!;
export const CAPSULE_DATABASE_ID = process.env.NOTION_CAPSULE_DATABASE_ID!;

// Notion 페이지 → Brand 변환 헬퍼는 각 서버 컴포넌트에서 구현
