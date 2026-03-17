import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { reviewSchema } from "@/lib/validations";
import { mapRowToReview, type ReviewRow } from "@/lib/mappers";
import type { PaginatedResponse, Review } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const capsuleSlug = searchParams.get("capsuleSlug");

  if (!capsuleSlug) {
    return NextResponse.json(
      { error: "capsuleSlug is required" },
      { status: 400 },
    );
  }

  // cursor: ISO 문자열 형식의 created_at 값 (이전 페이지의 마지막 항목)
  const cursor = searchParams.get("cursor");
  // limit 상한을 20으로 제한 (DoS 방어), 기본값 5
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "5", 10), 20);

  const supabase = createServerSupabaseClient();
  // N+1 패턴: limit+1개 조회하여 다음 페이지 존재 여부 판별
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("capsule_slug", capsuleSlug)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  // cursor가 있으면 해당 시점 이전 데이터만 조회
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data as ReviewRow[];
  // limit+1번째 항목이 있으면 다음 페이지 존재
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  // 다음 커서는 현재 페이지 마지막 항목의 created_at
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  const response: PaginatedResponse<Review> = {
    data: items.map(mapRowToReview),
    nextCursor,
    hasMore,
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Turnstile 검증
  const turnstileRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: parsed.data.turnstileToken,
      }),
    },
  );
  const turnstileData = await turnstileRes.json();
  if (!turnstileData.success) {
    return NextResponse.json({ error: "CAPTCHA 검증 실패" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      capsule_id: parsed.data.capsuleId,
      capsule_slug: parsed.data.capsuleSlug,
      author_nickname: parsed.data.authorNickname,
      rating: parsed.data.rating,
      content: parsed.data.content,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
