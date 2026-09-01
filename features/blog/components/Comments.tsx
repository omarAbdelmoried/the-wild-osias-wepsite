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
      <h2 id="comments-heading" className="mb-8 text-3xl text-primary-50">
        Comments ({comments.length})
      </h2>
      {isLoading ? (
        <p className="text-primary-300">Loading comments...</p>
      ) : isError ? (
        <p className="text-red-300">
          Unable to load comments.
          <br />
          Please try again.
        </p>
      ) : !comments.length ? (
        <p className="text-primary-300">
          No comments yet.
          <br />
          Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-8">
          {topLevel.map((comment) => (
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
          ))}
        </div>
      )}
      {user ? (
        <form
          className="mt-10 space-y-3"
          onSubmit={handleCommentSubmit(async (values) => {
            const ok = await submitComment(values.content);
            if (ok) resetComment();
          })}
        >
          <label
            className="block text-lg font-semibold text-primary-100"
            htmlFor="comment"
          >
            Comment
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
            className="w-full border border-primary-700 bg-primary-900 p-3 text-primary-100"
            aria-invalid={Boolean(commentErrors.content)}
          />
          {commentErrors.content ? (
            <p className="text-sm text-red-300">
              {commentErrors.content.message}
            </p>
          ) : null}
          <button
            disabled={createCommentMutation.isPending || isCommentSubmitting}
            className="bg-accent-500 px-5 py-3 font-semibold text-primary-950"
          >
            {createCommentMutation.isPending || isCommentSubmitting
              ? "Posting..."
              : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="mt-10 text-primary-300">
          <Link
            className="font-semibold text-accent-400 hover:text-accent-300"
            href={`/login?callbackUrl=${encodeURIComponent(`/blog/${postSlug}`)}`}
          >
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}
      {message ? (
        <p className="mt-4 text-sm text-primary-300" role="status">
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
    <article className="border-b border-primary-800 pb-7">
      <CommentBody
        comment={comment}
        user={user}
        deleting={deleting}
        onDelete={onDelete}
      />
      {user ? (
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-accent-400 hover:text-accent-300"
          onClick={() =>
            setActiveReply(activeReply === comment.id ? null : comment.id)
          }
        >
          Reply
        </button>
      ) : null}
      {activeReply === comment.id ? (
        <form
          className="mt-4 space-y-3 pl-4 sm:pl-8"
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
            className="w-full border border-primary-700 bg-primary-900 p-3 text-primary-100"
            aria-invalid={Boolean(replyErrors.content)}
          />
          <div className="flex gap-4">
            <button
              disabled={createCommentMutation.isPending || isReplySubmitting}
              className="bg-accent-500 px-4 py-2 font-semibold text-primary-950"
            >
              {createCommentMutation.isPending || isReplySubmitting
                ? "Posting..."
                : "Reply"}
            </button>
            <button
              type="button"
              onClick={() => setActiveReply(null)}
              className="px-4 py-2 text-primary-300"
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
      <div className="mt-6 space-y-6 pl-4 sm:pl-8">
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
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <strong className="text-primary-50">{comment.authorName}</strong>
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
          className="mt-3 text-sm text-red-300 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      ) : null}
    </div>
  );
}
