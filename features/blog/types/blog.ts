export type BlogStatus = "draft" | "published" | (string & {});

export type BlogPostImage = {
  id: number;
  postId: number;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostWithImages = BlogPost & {
  blog_post_images?: BlogPostImage[] | null;
  coverImages: string[];
};
