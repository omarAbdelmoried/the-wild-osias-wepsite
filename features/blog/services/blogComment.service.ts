"use server";

import { auth } from "@/features/authontaction/services/auth";
import { getGuest } from "@/features/gustes/services/guest.service";
import { getServerSupabase } from "@/lib/server-supabase";

export async function createBlogComment({
  postId,
  parentId,
  content,
}: {
  postId: number;
  parentId: number | null;
  content: string;
}) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Please sign in to comment");

  const safePostId = Number(postId);
  const safeParentId = parentId == null ? null : Number(parentId);
  const safeContent = typeof content === "string" ? content.trim() : "";

  if (!Number.isInteger(safePostId)) throw new Error("Invalid post");
  if (safeParentId !== null && !Number.isInteger(safeParentId)) {
    throw new Error("Invalid comment parent");
  }
  if (!safeContent || safeContent.length > 5000) {
    throw new Error(
      "Comment content is required and must be under 5000 characters",
    );
  }

  const guest = await getGuest(session.user.email);
  if (!guest) throw new Error("Your guest profile could not be found");

  let blogSupabase;
  try {
    blogSupabase = getServerSupabase();
  } catch (error) {
    console.error(error);
    throw new Error("Comment service is not configured on the server");
  }

  const { data: post, error: postError } = await blogSupabase
    .from("blog_posts")
    .select("id")
    .eq("id", safePostId)
    .eq("status", "published")
    .maybeSingle();

  if (postError || !post) {
    throw new Error("Comments are only available on published posts");
  }

  const { data, error } = await blogSupabase
    .from("blog_comments")
    .insert({
      postId: safePostId,
      parentId: safeParentId,
      authorId: guest.id,
      authorName: guest.fullName || session.user.name || "Guest",
      authorEmail: guest.email,
      content: safeContent,
      status: "approved",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23514" || error.code === "23503") {
      throw new Error(error.message);
    }
    console.error(error, error.message);
    throw new Error("Comment could not be posted");
  }

  return data;
}

export async function deleteBlogComment({ id }: { id: number }) {
  const session = await auth();
  if (!session?.user?.email)
    throw new Error("Please sign in to delete comments");

  const commentId = Number(id);
  if (!Number.isInteger(commentId)) throw new Error("Invalid comment");

  const guest = await getGuest(session.user.email);
  if (!guest) throw new Error("Your guest profile could not be found");

  let blogSupabase;
  try {
    blogSupabase = getServerSupabase();
  } catch (error) {
    console.error(error);
    throw new Error("Comment service is not configured on the server");
  }

  const { error } = await blogSupabase
    .from("blog_comments")
    .delete()
    .eq("id", commentId)
    .eq("authorId", guest.id);

  if (error) {
    console.error(error);
    throw new Error("Comment could not be deleted");
  }

  return { id: commentId };
}
