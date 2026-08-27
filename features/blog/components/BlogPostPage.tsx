import React from "react";
import BlogRealtime from "./BlogRealtime";
import BlogGallery from "./BlogGallery";
import Link from "next/dist/client/link";
import { getBlogPost } from "../services/plog.api";
import { isValidImageSource } from "../ustlis/isValidImageSource";
const BlogPostPage = async ({ slug }: { slug: string }) => {
  const post = await getBlogPost(slug);

  return (
    <>
      <BlogRealtime />
      <article className="max-w-4xl mx-auto">
        <Link href="/blog" className="text-accent-400 hover:text-accent-300">
          &larr; Back to blog
        </Link>
        <p className="text-accent-400 text-sm mt-8 mb-3">
          {new Date(post.publishedAt).toLocaleDateString()}
        </p>
        <h1 className="text-4xl sm:text-6xl text-primary-50 mb-4">
          {post.title}
        </h1>
        <p className="text-primary-300 text-lg mb-8">
          By {post.author || "The Wild Oasis team"}
        </p>
        <div className="mb-10">
          <BlogGallery
            images={(post.coverImages || []).filter(isValidImageSource)}
            title={post.title}
          />
        </div>
        <div
          className="prose prose-invert max-w-none text-primary-100 text-lg leading-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
};

export default BlogPostPage;
