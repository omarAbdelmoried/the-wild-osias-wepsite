import supabase from "@/shared/api/supabase";
import { notFound } from "next/navigation";
import { BlogPostWithImages } from "../types/blog";

export async function getBlogPosts(): Promise<BlogPostWithImages[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_post_images(*)")
    .eq("status", "published")
    .order("publishedAt", { ascending: false });
  if (error) {
    console.error(error);
    throw new Error("Blog posts could not be loaded");
  }
  return (data ?? []).map((post) => ({
    ...post,
    coverImages:
      post.blog_post_images
        ?.sort((a, b) => a.displayOrder - b.displayOrder)
        .map((image) => image.imageUrl) ||
      (post.coverImage ? [post.coverImage] : []),
  }));
}

export async function getBlogPost(slug: string): Promise<BlogPostWithImages> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_post_images(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error) notFound();
  return {
    ...data,
    coverImages:
      data.blog_post_images
        ?.sort((a, b) => a.displayOrder - b.displayOrder)
        .map((image) => image.imageUrl) ||
      (data.coverImage ? [data.coverImage] : []),
  };
}
