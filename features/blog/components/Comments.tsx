"use client";

import Link from "next/link";
import { useState } from "react";
import { useBlogCommentForm } from "../hooks/useBlogCommentForm";
import { useBlogComments } from "../hooks/useBlogComments";
import type { BlogComment } from "../types/comment";

type CommentsProps = {
  postId: number;
  postSlug: string;
  user: { id?: string; name?: string | null } | null;
};

function relativeDate(value: string) {
  const seconds = Math.max(0, (Date.now() - Date.parse(value)) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Comments({ postId, postSlug, user }: CommentsProps) {
  const [activeReply, setActiveReply] = useState<number | null>(null);
  const [isCommentsListCollapsed, setIsCommentsListCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const {
    comments,
    isLoading,
    isError,
    createCommentMutation,
    deleteCommentMutation,
  } = useBlogComments(postId);
  const {
    register: registerComment,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    formState: { errors: commentErrors, isSubmitting: isCommentSubmitting },
  } = useBlogCommentForm();

  async function submitComment(
    content: string,
    parentId: number | null = null,
  ) {
    const nextContent = content.trim();
    if (!nextContent) return false;
    setMessage("");

    try {
      await createCommentMutation.mutateAsync({
        parentId,
        content: nextContent,
      });
      setMessage("Your comment was submitted for review.");
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to post comment.",
      );
      return false;
    }
  }

  async function deleteComment(id: number) {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await deleteCommentMutation.mutateAsync({ id });
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete the comment.",
      );
    }
  }

  const topLevel = comments.filter((comment) => comment.parentId === null);
  return (
    <section
      className="mt-16 border-t border-primary-800 pt-10"
      aria-labelledby="comments-heading"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-accent-300/80">
            Community
          </p>
          <h2
            id="comments-heading"
            className="flex items-center gap-3 text-3xl font-semibold text-primary-50"
          >
            Comments
            <span className="inline-flex min-w-10 items-center justify-center rounded-full border border-primary-700 bg-primary-900 px-2.5 py-1 text-sm font-medium text-accent-200">
              {comments.length}
            </span>
          </h2>
        </div>
      </div>
      {user ? (
        <form
          className="my-10 rounded-2xl border border-primary-800 bg-primary-900/50 p-4 sm:p-5"
          onSubmit={handleCommentSubmit(async (values) => {
            const ok = await submitComment(values.content);
            if (ok) resetComment();
          })}
        >
          <label
            className="mb-3 block text-base font-semibold text-primary-100"
            htmlFor="comment"
          >
            Leave a comment
          </label>
          <textarea
            id="comment"
            {...registerComment("content", {
              required: "Comment is required.",
              maxLength: {
                value: 5000,
                message: "Comment must be 5000 characters or less.",
              },
            })}
            rows={4}
            className="w-full rounded-xl border border-primary-700 bg-primary-950/60 p-3.5 text-primary-100 shadow-inner outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-500/30"
            aria-invalid={Boolean(commentErrors.content)}
            placeholder="Share your thoughts..."
          />
          {commentErrors.content ? (
            <p className="mt-2 text-sm text-red-300">
              {commentErrors.content.message}
            </p>
          ) : null}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm text-primary-400">
              Keep it respectful and relevant.
            </span>
            <button
              disabled={createCommentMutation.isPending || isCommentSubmitting}
              className="rounded-xl bg-accent-400 px-5 py-3 text-sm font-semibold text-primary-950 transition hover:bg-accent-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createCommentMutation.isPending || isCommentSubmitting
                ? "Posting..."
                : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-10 rounded-2xl border border-primary-800 bg-primary-900/50 p-5 text-primary-300">
          <p>
            <Link
              className="font-semibold text-accent-400 transition hover:text-accent-300"
              href={`/login?callbackUrl=${encodeURIComponent(`/blog/${postSlug}`)}`}
            >
              Sign in
            </Link>{" "}
            to join the conversation.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-primary-800 bg-primary-900/40 p-6 text-primary-300">
          Loading comments...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-6 text-red-200">
          Unable to load comments.
          <br />
          Please try again.
        </div>
      ) : !comments.length ? (
        <div className="rounded-2xl border border-dashed border-primary-700 bg-primary-900/30 p-8 text-center text-primary-300">
          <p className="text-lg text-primary-100">No comments yet.</p>
          <p className="mt-2">Be the first to share your thoughts.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCommentsListCollapsed((value) => !value)}
              className="inline-flex items-center rounded-full border border-primary-700 bg-primary-900 px-3 py-1.5 text-sm font-medium text-primary-200 transition hover:border-primary-600 hover:text-primary-50"
              aria-expanded={!isCommentsListCollapsed}
            >
              {isCommentsListCollapsed ? "Show comments" : "Hide comments"}
            </button>
          </div>

          {!isCommentsListCollapsed
            ? topLevel.map((comment) => (
                <ReplyThread
                  key={comment.id}
                  comment={comment}
                  replies={comments.filter(
                    (reply) => reply.parentId === comment.id,
                  )}
                  user={user}
                  deleting={
                    deleteCommentMutation.isPending &&
                    deleteCommentMutation.variables?.id === comment.id
                  }
                  onDelete={deleteComment}
                  postId={postId}
                  setMessage={setMessage}
                  activeReply={activeReply}
                  setActiveReply={setActiveReply}
                />
              ))
            : null}
        </div>
      )}

      {message ? (
        <p
          className="mt-4 rounded-xl border border-accent-500/30 bg-accent-500/10 px-3 py-2 text-sm text-primary-200"
          role="status"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}

function ReplyThread({
  comment,
  replies,
  user,
  deleting,
  onDelete,
  postId,
  setMessage,
  activeReply,
  setActiveReply,
}: {
  comment: BlogComment;
  replies: BlogComment[];
  user: CommentsProps["user"];
  deleting: boolean;
  onDelete: (id: number) => void;
  postId: number;
  setMessage: (value: string) => void;
  activeReply: number | null;
  setActiveReply: (value: number | null) => void;
}) {
  const [isRepliesCollapsed, setIsRepliesCollapsed] = useState(true);
  const {
    register: registerReply,
    handleSubmit: handleReplySubmit,
    reset: resetReply,
    formState: { errors: replyErrors, isSubmitting: isReplySubmitting },
  } = useBlogCommentForm();
  const { createCommentMutation, deleteCommentMutation } =
    useBlogComments(postId);

  async function submitReply(content: string) {
    const nextContent = content.trim();
    if (!nextContent) return false;
    setMessage("");

    try {
      await createCommentMutation.mutateAsync({
        parentId: comment.id,
        content: nextContent,
      });
      setMessage("Your comment was submitted for review.");
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to post comment.",
      );
      return false;
    }
  }

  return (
    <article className="rounded-2xl border border-primary-800 bg-primary-950/35 p-4 sm:p-5">
      <CommentBody
        comment={comment}
        user={user}
        deleting={deleting}
        onDelete={onDelete}
      />

      {user ? (
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-300 transition hover:text-accent-200"
          onClick={() =>
            setActiveReply(activeReply === comment.id ? null : comment.id)
          }
        >
          <span className="text-base">↩</span>
          Reply
        </button>
      ) : null}

      {activeReply === comment.id ? (
        <form
          className="mt-4 space-y-3 rounded-xl border border-primary-800 bg-primary-900/40 p-3 sm:ml-8 sm:p-4"
          onSubmit={handleReplySubmit(async (values) => {
            const ok = await submitReply(values.content);
            if (ok) {
              resetReply();
              setActiveReply(null);
            }
          })}
        >
          <label className="sr-only" htmlFor={`reply-${comment.id}`}>
            Reply
          </label>
          <textarea
            id={`reply-${comment.id}`}
            {...registerReply("content", {
              required: "Reply is required.",
              maxLength: {
                value: 5000,
                message: "Reply must be 5000 characters or less.",
              },
            })}
            rows={3}
            placeholder={`Replying to ${comment.authorName}`}
            className="w-full rounded-xl border border-primary-700 bg-primary-950/60 p-3 text-primary-100 shadow-inner outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-500/30"
            aria-invalid={Boolean(replyErrors.content)}
          />
          <div className="flex flex-wrap gap-3">
            <button
              disabled={createCommentMutation.isPending || isReplySubmitting}
              className="rounded-xl bg-accent-400 px-4 py-2 text-sm font-semibold text-primary-950 transition hover:bg-accent-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createCommentMutation.isPending || isReplySubmitting
                ? "Posting..."
                : "Reply"}
            </button>
            <button
              type="button"
              onClick={() => setActiveReply(null)}
              className="rounded-xl border border-primary-700 px-4 py-2 text-sm text-primary-300 transition hover:border-primary-600 hover:text-primary-100"
            >
              Cancel
            </button>
          </div>
          {replyErrors.content ? (
            <p className="text-sm text-red-300">
              {replyErrors.content.message}
            </p>
          ) : null}
        </form>
      ) : null}

      {replies.length ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-primary-400">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
            <button
              type="button"
              onClick={() => setIsRepliesCollapsed((value) => !value)}
              className="text-sm font-medium text-accent-300 transition hover:text-accent-200"
              aria-expanded={!isRepliesCollapsed}
            >
              {isRepliesCollapsed ? "Show replies" : "Hide replies"}
            </button>
          </div>

          {!isRepliesCollapsed ? (
            <div className="space-y-4 border-l border-primary-800 pl-4 sm:ml-8 sm:pl-6">
              {replies.map((reply) => (
                <CommentBody
                  key={reply.id}
                  comment={reply}
                  user={user}
                  deleting={
                    deleteCommentMutation.isPending &&
                    deleteCommentMutation.variables?.id === reply.id
                  }
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function CommentBody({
  comment,
  user,
  deleting,
  onDelete,
}: {
  comment: BlogComment;
  user: CommentsProps["user"];
  deleting: boolean;
  onDelete: (id: number) => void;
}) {
  const isOwner = Boolean(user?.id && Number(user.id) === comment.authorId);

  return (
    <div className="rounded-xl border border-primary-800 bg-primary-900/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <strong className="text-primary-50">{comment.authorName}</strong>
          {isOwner ? (
            <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-200">
              You
            </span>
          ) : null}
        </div>
        <time className="text-sm text-primary-400" dateTime={comment.createdAt}>
          {relativeDate(comment.createdAt)}
        </time>
      </div>

      <p className="mt-3 whitespace-pre-wrap leading-7 text-primary-200">
        {comment.content}
      </p>

      {isOwner ? (
        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(comment.id)}
          className="mt-3 text-sm font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      ) : null}
    </div>
  );
}
