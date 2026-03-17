"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { StarRating } from "./star-rating";
import { createReview } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
  authorNickname: z
    .string()
    .min(1, "닉네임을 입력해주세요.")
    .max(20, "20자 이하로 입력해주세요."),
  rating: z.number().int().min(1, "별점을 선택해주세요.").max(5),
  content: z
    .string()
    .min(10, "10자 이상 입력해주세요.")
    .max(500, "500자 이하로 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

interface ReviewFormProps {
  capsuleId: string;
  capsuleSlug: string;
  onSuccess?: () => void;
}

export function ReviewForm({
  capsuleId,
  capsuleSlug,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cloudflare Turnstile 인증 토큰 상태
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { rating: 0 },
  });

  const onSubmit = async (values: FormValues) => {
    // Turnstile 인증 토큰이 없으면 제출 차단
    if (!turnstileToken) {
      toast.error("CAPTCHA 인증을 완료해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        capsuleId,
        capsuleSlug,
        authorNickname: values.authorNickname,
        rating: values.rating as 1 | 2 | 3 | 4 | 5,
        content: values.content,
        turnstileToken,
      });
      toast.success("리뷰가 등록되었습니다.");
      reset();
      setRating(0);
      setTurnstileToken("");
      onSuccess?.(); // 콜백만 호출 (ReviewListInfinite가 invalidateQueries 처리)
    } catch {
      toast.error("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Label>별점</Label>
        <StarRating
          value={rating}
          interactive
          size="lg"
          onChange={(v) => {
            setRating(v);
            setValue("rating", v, { shouldValidate: true });
          }}
        />
        {errors.rating && (
          <p className="text-sm text-destructive">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>리뷰 내용</Label>
        <Textarea
          {...register("content")}
          placeholder="이 캡슐에 대한 솔직한 리뷰를 작성해주세요. (10-500자)"
          rows={4}
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
        {isSubmitting ? "등록 중..." : "리뷰 등록"}
      </Button>
    </form>
  );
}
