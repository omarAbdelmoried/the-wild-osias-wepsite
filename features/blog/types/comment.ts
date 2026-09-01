export type BlogComment = {
  id: number;
  postId: number;
  parentId: number | null;
  authorId: number | null;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};