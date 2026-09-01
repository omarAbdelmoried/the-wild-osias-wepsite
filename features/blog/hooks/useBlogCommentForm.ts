"use client";

import { useForm } from "react-hook-form";

export type BlogCommentFormValues = {
  content: string;
};

export function useBlogCommentForm(
  defaultValues: BlogCommentFormValues = { content: "" },
) {
  return useForm<BlogCommentFormValues>({
    mode: "onSubmit",
    defaultValues,
  });
}
