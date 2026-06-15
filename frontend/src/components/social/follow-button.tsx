"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  /** 受控模式：与 onFollowingChange 一起用于多处按钮同步 */
  following?: boolean;
  onFollowingChange?: (following: boolean) => void;
  /** 实心蓝（知乎主按钮）或线框 */
  variant?: "primary" | "outline";
  isLoggedIn?: boolean;
  /** 登录后回跳路径，默认当前页 */
  loginCallbackPath?: string;
  onFollowerCountChange?: (count: number) => void;
}

export function FollowButton({
  userId,
  initialFollowing,
  following: controlledFollowing,
  onFollowingChange,
  variant = "outline",
  isLoggedIn = true,
  loginCallbackPath,
  onFollowerCountChange,
}: FollowButtonProps) {
  const pathname = usePathname();
  const [internalFollowing, setInternalFollowing] = useState(initialFollowing);
  const following =
    controlledFollowing !== undefined ? controlledFollowing : internalFollowing;
  const [loading, setLoading] = useState(false);

  function goLogin() {
    const cb = loginCallbackPath ?? pathname ?? "/";
    window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(cb)}`;
  }

  async function handleToggle() {
    if (!isLoggedIn) {
      goLogin();
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.status === 401) {
        goLogin();
        return;
      }

      if (!res.ok) {
        return;
      }

      const data = (await res.json()) as {
        following: boolean;
        followerCount?: number;
      };
      if (onFollowingChange) {
        onFollowingChange(data.following);
      } else {
        setInternalFollowing(data.following);
      }
      if (typeof data.followerCount === "number") {
        onFollowerCountChange?.(data.followerCount);
      }
    } finally {
      setLoading(false);
    }
  }

  const primaryClass =
    "rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 hover:opacity-90";
  const primaryStyle = {
    backgroundColor: "var(--zhihu-blue)",
  } as const;

  const outlineClass =
    "rounded-md border border-border bg-background px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50";

  if (variant === "primary") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={primaryClass}
        style={following ? { backgroundColor: "var(--muted-foreground)" } : primaryStyle}
      >
        {following ? "已关注" : "+ 关注他"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={outlineClass}
    >
      {following ? "已关注" : "+ 关注他"}
    </button>
  );
}
