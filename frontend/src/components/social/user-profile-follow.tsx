"use client";

import { useState } from "react";
import { FollowButton } from "./follow-button";

interface UserProfileFollowProps {
  userId: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
  loginCallbackPath: string;
  initialFollowerCount: number;
}

export function UserProfileFollow({
  userId,
  initialFollowing,
  isLoggedIn,
  loginCallbackPath,
  initialFollowerCount,
}: UserProfileFollowProps) {
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <FollowButton
        userId={userId}
        initialFollowing={initialFollowing}
        variant="primary"
        isLoggedIn={isLoggedIn}
        loginCallbackPath={loginCallbackPath}
        onFollowerCountChange={setFollowerCount}
      />
      <span className="text-sm text-muted-foreground tabular-nums">
        {followerCount} 位关注者
      </span>
    </div>
  );
}
