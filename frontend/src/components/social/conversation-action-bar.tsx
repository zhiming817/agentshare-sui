"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

type ActionType = "like" | "dislike" | "bookmark";

interface Counts {
  likeCount: number;
  dislikeCount: number;
  bookmarkCount: number;
}

interface ConversationActionBarProps {
  conversationId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialBookmarkCount: number;
  initialLikeDislike: "like" | "dislike" | null;
  initialBookmarked: boolean;
  commentCount: number;
  isLoggedIn: boolean;
}

function IconTriangleUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 4l8 14H4l8-14z" />
    </svg>
  );
}

function IconTriangleDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 20L4 6h16l-8 14z" />
    </svg>
  );
}

function IconComment({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 7.5 7.5 0 0110-7 8.38 8.38 0 013.8.9z" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function ConversationActionBar({
  conversationId,
  initialLikeCount,
  initialDislikeCount,
  initialBookmarkCount,
  initialLikeDislike,
  initialBookmarked,
  commentCount,
  isLoggedIn,
}: ConversationActionBarProps) {
  const pathname = usePathname();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [likeDislike, setLikeDislike] = useState(initialLikeDislike);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState<ActionType | null>(null);

  function redirectToLogin() {
    const url = `/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;
    window.location.href = url;
  }

  function scrollToComments() {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
  }

  function applyCounts(counts: Counts | null | undefined) {
    if (!counts) return;
    setLikeCount(counts.likeCount);
    setDislikeCount(counts.dislikeCount);
    setBookmarkCount(counts.bookmarkCount);
  }

  async function interact(action: ActionType) {
    if (!isLoggedIn) {
      redirectToLogin();
      return;
    }
    if (loading) return;
    setLoading(action);
    try {
      const res = await fetch("/api/social/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "conversation",
          targetId: conversationId,
          action,
        }),
      });

      if (res.status === 401) {
        redirectToLogin();
        return;
      }

      if (!res.ok) return;

      const data = (await res.json()) as {
        action: ActionType | null;
        counts?: Counts;
      };

      applyCounts(data.counts);

      if (action === "bookmark") {
        setBookmarked(data.action === "bookmark");
      } else if (action === "like") {
        if (data.action === "like") {
          setLikeDislike("like");
        } else {
          setLikeDislike(null);
        }
      } else if (action === "dislike") {
        if (data.action === "dislike") {
          setLikeDislike("dislike");
        } else {
          setLikeDislike(null);
        }
      }
    } finally {
      setLoading(null);
    }
  }

  const agreeActive = likeDislike === "like";
  const dislikeActive = likeDislike === "dislike";

  const actionBtnClass =
    "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-4">
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => interact("like")}
          className="inline-flex items-center gap-1.5 rounded-l-md border border-[var(--zhihu-blue)] px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: agreeActive ? "var(--zhihu-agree-bg)" : "transparent",
            color: "var(--zhihu-blue)",
            borderColor: "var(--zhihu-blue)",
          }}
        >
          <IconTriangleUp className="shrink-0 opacity-90" />
          <span>赞同</span>
          <span className="tabular-nums">{likeCount}</span>
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => interact("dislike")}
          className="rounded-r-md border border-l-0 border-[var(--zhihu-blue)] px-2 py-1.5 transition-colors disabled:opacity-50"
          style={{
            background: dislikeActive ? "var(--zhihu-agree-bg)" : "transparent",
            color: "var(--zhihu-blue)",
            borderColor: "var(--zhihu-blue)",
          }}
          aria-label="踩"
        >
          <IconTriangleDown className="shrink-0" />
        </button>
      </div>

      <button
        type="button"
        onClick={scrollToComments}
        className={actionBtnClass}
      >
        <IconComment />
        <span>{commentCount} 条评论</span>
      </button>

      <button
        type="button"
        disabled={loading !== null}
        onClick={() => interact("bookmark")}
        className={actionBtnClass}
        style={
          bookmarked
            ? { color: "var(--zhihu-blue)" }
            : undefined
        }
      >
        <IconStar className={bookmarked ? "fill-current" : ""} />
        <span>收藏</span>
        {bookmarkCount > 0 && (
          <span className="tabular-nums text-xs opacity-80">{bookmarkCount}</span>
        )}
      </button>
    </div>
  );
}
