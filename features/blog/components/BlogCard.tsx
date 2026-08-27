import Link from "next/link";
import type { BlogPostWithImages } from "../types/blog";
import BlogGallery from "./BlogGallery";
import { isValidImageSource } from "../ustlis/isValidImageSource";

type BlogCardProps = {
  post: BlogPostWithImages;
};

function getCardTilt(id: number) {
  const lastCharacter = String(id || 0).charCodeAt(0);
  return lastCharacter % 2 === 0 ? "rotate-[0.45deg]" : "-rotate-[0.45deg]";
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article
      className={`group relative overflow-hidden border-2 border-primary-800 bg-primary-900/40 shadow-[7px_8px_0_0_rgba(34,40,48,0.75)] transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 hover:shadow-[10px_12px_0_0_rgba(34,40,48,0.75)] ${getCardTilt(post.id)}`}
    >
      {/* <span className="pointer-events-none absolute right-4 top-4 z-10 rotate-6 border border-accent-400/60 px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-accent-300 opacity-80">
        Field notes
      </span> */}
      <BlogGallery
        images={post.coverImages.filter(isValidImageSource)}
        title={post.title}
        actionFullscreen={false}
      />
      <div className="relative p-5 pb-6 sm:p-7 sm:pb-8">
        <span className="absolute -top-3 left-6 bg-accent-400 px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-950">
          {new Date(post.publishedAt).toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          })}
        </span>
        <h2 className="mb-4 max-w-[16ch] text-3xl leading-[0.95] text-primary-50 transition-colors group-hover:text-accent-300">
          {post.title}
        </h2>
        <p className="mb-6 max-w-[42ch] text-primary-200/90">{post.excerpt}</p>
        <p className="mb-5 rotate-[-1deg] text-sm text-primary-300">
          By {post.author || "The Wild Oasis team"}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 border-b border-accent-400/70 pb-1 text-accent-400 transition-all group-hover:gap-3 group-hover:text-accent-300"
        >
          Read the note <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
