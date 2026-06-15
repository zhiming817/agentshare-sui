"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  id: string;
  nickname: string;
  avatar: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  user: User;
  replies?: Comment[];
}

interface CommentSectionProps {
  conversationId: string;
}

export function CommentSection({ conversationId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; nickname: string } | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/social/comment?conversationId=${conversationId}`
      );
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/social/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: newContent,
          parentId: replyTo?.id || undefined,
        }),
      });

      if (res.ok) {
        setNewContent("");
        setReplyTo(null);
        await fetchComments();
      }
    } catch (error) {
      console.error("Submit comment error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <div className="py-4 text-sm text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Replying to {replyTo.nickname}</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-primary hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={submitting || !newContent.trim()}
          className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* Comment List */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <CommentItem
                comment={comment}
                onReply={(id, nickname) => setReplyTo({ id, nickname })}
                formatDate={formatDate}
              />

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 space-y-3 border-l-2 border-border pl-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  formatDate,
}: {
  comment: Comment;
  onReply?: (id: string, nickname: string) => void;
  formatDate: (dateStr: string) => string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {comment.user.nickname.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium">{comment.user.nickname}</span>
        <span className="text-xs text-muted-foreground">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
      {onReply && (
        <button
          onClick={() => onReply(comment.id, comment.user.nickname)}
          className="mt-1 text-xs text-primary hover:underline"
        >
          Reply
        </button>
      )}
    </div>
  );
}
