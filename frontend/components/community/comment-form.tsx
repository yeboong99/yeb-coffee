"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { createComment } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
  authorNickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(20, "20자 이하로 입력해주세요."),
  content: z
    .string()
    .min(1, "내용을 입력해주세요.")
    .max(500, "500자 이하로 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

interface CommentFormProps {
  postId: string;
  onSuccess?: () => void;
}

export function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cloudflare Turnstile 인증 토큰 상태
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
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
      await createComment({
        postId,
        authorNickname: values.authorNickname,
        content: values.content,
        turnstileToken,
      });
      toast.success("댓글이 등록되었습니다.");
      reset();
      setTurnstileToken("");
      // 서버 컴포넌트(CommentList) 데이터 재조회를 위해 페이지 갱신
      router.refresh();
      onSuccess?.();
    } catch {
      toast.error("댓글 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label>닉네임</Label>
        <Input {...register("authorNickname")} placeholder="닉네임 입력" />
        {errors.authorNickname && (
          <p className="text-sm text-destructive">
            {errors.authorNickname.message}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>댓글</Label>
        <Textarea
          {...register("content")}
          placeholder="댓글을 입력해주세요."
          rows={3}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
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

      <Button
        type="submit"
        disabled={isSubmitting || !turnstileToken}
        className="w-full"
      >
        {isSubmitting ? "등록 중..." : "댓글 등록"}
      </Button>
    </form>
  );
}
