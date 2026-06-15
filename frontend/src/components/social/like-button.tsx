"use client";

import { useState } from "react";

type ActionType = "like" | "dislike" | "bookmark";

interface LikeButtonProps {
  targetType: "conversation" | "skill";
  targetId: string;
  initialAction: ActionType | null;
}

export function LikeButton({
  targetType,
  targetId,
  initialAction,
}: LikeButtonProps) {
  const [currentAction, setCurrentAction] = useState<ActionType | null>(
    initialAction
  );
  const [loading, setLoading] = useState(false);

  async function handleInteract(action: ActionType) {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/social/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, action }),
      });

      if (!res.ok) {
        console.error("Failed to toggle interaction");
        return;
      }

      const data = await res.json();
      setCurrentAction(data.action as ActionType | null);
    } catch (error) {
      console.error("Interaction error:", error);
    } finally {
      setLoading(false);
    }
  }

  const baseClass =
    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50";
  const activeClass = "bg-primary text-primary-foreground border-primary";
  const inactiveClass =
    "bg-background border-border hover:bg-muted text-foreground";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleInteract("like")}
        disabled={loading}
        className={`${baseClass} ${currentAction === "like" ? activeClass : inactiveClass}`}
      >
        Like
      </button>
      <button
        onClick={() => handleInteract("dislike")}
        disabled={loading}
        className={`${baseClass} ${currentAction === "dislike" ? activeClass : inactiveClass}`}
      >
        Dislike
      </button>
      <button
        onClick={() => handleInteract("bookmark")}
        disabled={loading}
        className={`${baseClass} ${currentAction === "bookmark" ? activeClass : inactiveClass}`}
      >
        Bookmark
      </button>
    </div>
  );
}
