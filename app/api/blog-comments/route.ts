import { NextResponse } from "next/server";
import { auth } from "@/features/authontaction/services/auth";
import { getGuest } from "@/features/gustes/services/guest.service";
import { getServerSupabase } from "@/lib/server-supabase";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return errorResponse("Please sign in to comment", 401);
  const body = await request.json().catch(() => null);
  const postId = Number(body?.postId);
  const parentId = body?.parentId == null ? null : Number(body.parentId);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!Number.isInteger(postId) || !content || content.length > 5000) {
    return errorResponse("Comment content is required and must be under 5000 characters");
  }
  if (parentId !== null && !Number.isInteger(parentId)) return errorResponse("Invalid comment parent");
  const guest = await getGuest(session.user.email);
  if (!guest) return errorResponse("Your guest profile could not be found", 403);
  let supabase;
  try {
    supabase = getServerSupabase();
  } catch (error) {
    console.error(error);
    return errorResponse("Comment service is not configured on the server", 503);
  }
  const { data: post, error: postError } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("id", postId)
    .eq("status", "published")
    .maybeSingle();
  if (postError || !post) return errorResponse("Comments are only available on published posts", 404);
  const { data, error } = await supabase.from("blog_comments").insert({
    postId,
    parentId,
    authorId: guest.id,
    authorName: guest.fullName || session.user.name || "Guest",
    authorEmail: guest.email,
    content,
    status: "pending",
  }).select().single();
  if (error) {
    if (error.code === "23514" || error.code === "23503") return errorResponse(error.message);
    console.error(error);
    return errorResponse("Comment could not be posted", 500);
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return errorResponse("Please sign in to delete comments", 401);
  const body = await request.json().catch(() => null);
  const commentId = Number(body?.id);
  if (!Number.isInteger(commentId)) return errorResponse("Invalid comment");
  const guest = await getGuest(session.user.email);
  if (!guest) return errorResponse("Your guest profile could not be found", 403);
  let supabase;
  try {
    supabase = getServerSupabase();
  } catch (error) {
    console.error(error);
    return errorResponse("Comment service is not configured on the server", 503);
  }
  const { error } = await supabase.from("blog_comments").delete().eq("id", commentId).eq("authorId", guest.id);
  if (error) {
    console.error(error);
    return errorResponse("Comment could not be deleted", 500);
  }
  return NextResponse.json({ id: commentId });
}