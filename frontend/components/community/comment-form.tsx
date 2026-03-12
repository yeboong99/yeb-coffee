"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createComment } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
  authorNickname: z.string().min(1, "닉네임을 입력해주세요.").max(20, "20자 이하로 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요.").max(500, "500자 이하로 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

interface CommentFormProps {
  postId: string;
  onSuccess?: () => void;
}

export function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createComment({
        postId,
        authorNickname: values.authorNickname,
        content: values.content,
        turnstileToken: "dev-bypass", // TODO: Turnstile 위젯 연동
      });
      toast.success("댓글이 등록되었습니다.");
      reset();
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
          <p className="text-sm text-destructive">{errors.authorNickname.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>댓글</Label>
        <Textarea {...register("content")} placeholder="댓글을 입력해주세요." rows={3} />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "등록 중..." : "댓글 등록"}
      </Button>
    </form>
  );
}
