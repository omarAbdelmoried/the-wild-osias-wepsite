import BlogCard from "./BlogCard";
import BlogRealtime from "./BlogRealtime";
import Empty from "@/components/Empty";
import { getBlogPosts } from "../services/plog.api";
import { BlogPostWithImages } from "../types/blog";

export const metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <>
      <BlogRealtime />
      <header className="mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl text-accent-400 mb-4">
          The Wild Oasis Journal
        </h1>
        <p className="text-primary-200 text-lg max-w-2xl">
          Stories, ideas, and inspiration from the mountains.
        </p>
      </header>
      {posts.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post: BlogPostWithImages) => (
            <BlogCard post={post} key={post.id} />
          ))}
        </div>
      ) : (
        <Empty resource="blog posts" />
      )}
    </>
  );
}
