import { getBlogPost } from "@/features/blog/services/plog.api";
import BlogPostPage from "@/features/blog/components/BlogPostPage";

export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.slug);
  return { title: post.title, description: post.excerpt };
}

export default async function Page({ params }) {
  const slug = params.slug;
  return <BlogPostPage slug={slug} />;
}
