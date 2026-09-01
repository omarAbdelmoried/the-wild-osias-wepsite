import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "@/shared/api/supabase";
import {
  createBlogComment,
  deleteBlogComment,
} from "../services/blogComment.service";
import type { BlogComment } from "../types/comment";

function sortComments(comments: BlogComment[]) {
  return [...comments].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );
}

async function fetchComments(postId: number): Promise<BlogComment[]> {
  const { data, error } = await supabase
    .from("blog_comments")
    .select("*")
    .eq("postId", postId)
    .eq("status", "approved")
    .order("createdAt", { ascending: true });

  if (error) throw new Error("Unable to load comments.");

  return sortComments((data as BlogComment[]) ?? []);
}

export function useBlogComments(postId: number) {
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blog-comments", postId],
    queryFn: () => fetchComments(postId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`blog-comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blog_comments",
          filter: `postId=eq.${postId}`,
        },
        (payload) => {
          const comment = payload.new as BlogComment | undefined;
          const deletedId = (payload.old as BlogComment | undefined)?.id;

          queryClient.setQueryData<BlogComment[]>(
            ["blog-comments", postId],
            (current = []) => {
              if (
                payload.eventType === "INSERT" &&
                comment?.status === "approved"
              ) {
                return current.some((item) => item.id === comment.id)
                  ? current
                  : sortComments([...current, comment]);
              }

              if (payload.eventType === "UPDATE") {
                if (!comment) return current;
                if (comment.status === "approved") {
                  return sortComments([
                    ...current.filter((item) => item.id !== comment.id),
                    comment,
                  ]);
                }
                return current.filter((item) => item.id !== comment.id);
              }

              if (payload.eventType === "DELETE" && deletedId) {
                return current.filter(
                  (item) =>
                    item.id !== deletedId && item.parentId !== deletedId,
                );
              }

              return current;
            },
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  const createCommentMutation = useMutation({
    mutationFn: ({
      parentId,
      content,
    }: {
      parentId: number | null;
      content: string;
    }) => createBlogComment({ postId, parentId, content }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["blog-comments", postId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteBlogComment({ id }),
    onSuccess: (_, { id }) => {
      queryClient.setQueryData<BlogComment[]>(
        ["blog-comments", postId],
        (current = []) =>
          current.filter((item) => item.id !== id && item.parentId !== id),
      );
    },
  });

  return {
    comments,
    isLoading,
    isError,
    createCommentMutation,
    deleteCommentMutation,
  };
}
