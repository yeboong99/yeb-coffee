"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { createPost } from "@/lib/api";
import { toast } from "sonner";
import type { PostCategory } from "@/types";

const formSchema = z.object({
  title: z
    .string()
    .min(2, "2자 이상 입력해주세요.")
    .max(100, "100자 이하로 입력해주세요."),
  content: z
    .string()
    .min(10, "10자 이상 입력해주세요.")
    .max(5000, "5000자 이하로 입력해주세요."),
  category: z.enum(["정보공유", "추천", "질문", "잡담"] as const),
  authorNickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(20, "20자 이하로 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

const CATEGORIES: PostCategory[] = ["정보공유", "추천", "질문", "잡담"];

export function PostForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cloudflare Turnstile 인증 토큰 상태
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormValues) => {
    // Turnstile 인증 토큰이 없으면 제출 차단
    if (!turnstileToken) {
      toast.error("CAPTCHA 인증을 완료해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const post = await createPost({
        ...values,
        turnstileToken,
      });
      toast.success("게시글이 등록되었습니다.");
      router.push(`/community/${post.id}`);
    } catch {
      toast.error("게시글 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label>카테고리</Label>
        <Select
          onValueChange={(v) =>
            setValue("category", v as PostCategory, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>제목</Label>
        <Input {...register("title")} placeholder="제목을 입력해주세요." />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>내용</Label>
        <Textarea
          {...register("content")}
          placeholder="내용을 입력해주세요. (10-5000자)"
          rows={8}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>닉네임</Label>
        <Input {...register("authorNickname")} placeholder="닉네임 입력" />
        {errors.authorNickname && (
          <p className="text-sm text-destructive">
            {errors.authorNickname.message}
          </p>
        )}
      </div>

      {/* Cloudflare Turnstile CAPTCHA 위젯 */}
      <div className="space-y-1.5">
        <TurnstileWidget
          onSuccess={setTurnstileToken}
          onError={() => {
            setTurnstileToken("");
            toast.error("CAPTCHA 인증에 실패했습니다. 다시 시도해주세요.");
          }}
          onExpire={() => {
            setTurnstileToken("");
            toast.error("CAPTCHA 인증이 만료되었습니다. 다시 인증해주세요.");
          }}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !turnstileToken}
          className="flex-1"
        >
          {isSubmitting ? "등록 중..." : "게시글 등록"}
        </Button>
      </div>
    </form>
  );
}
