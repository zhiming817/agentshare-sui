"use client";

import { ChatViewer } from "@/components/conversation/chat-viewer";
import { ChainUnlockButton } from "@/components/conversation/chain-unlock-button";
import { TipButton } from "@/components/conversation/tip-button";
import { SourceBadge } from "@/components/conversation/source-badge";
import { CommentSection } from "@/components/social/comment-section";
import { ConversationActionBar } from "@/components/social/conversation-action-bar";
import { FollowButton } from "@/components/social/follow-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ConversationDetailProps {
  conversation: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    bookmarkCount: number;
    commentCount: number;
    messageCount: number;
    tags: string[];
    createdAt: string;
    user: {
      id: string;
      nickname: string;
      avatar: string | null;
      bio: string | null;
    };
    environment: {
      os: string | null;
      containerInfo: string | null;
      gpu: string | null;
      runtimeInfo: string | null;
    } | null;
    skills: {
      id: string;
      name: string;
      description: string | null;
      likeCount: number;
    }[];
    rawContent: string;
    sourceType: string;
    hasFullAccess: boolean;
    isOwner: boolean;
    authorWalletAddress?: string;
  };
  social: {
    currentUserId: string | null;
    initialLikeDislike: "like" | "dislike" | null;
    initialBookmarked: boolean;
    initialFollowing: boolean;
    authorStats: {
      publicConversationCount: number;
      skillCount: number;
      followerCount: number;
    };
  };
}

export function ConversationDetail({
  conversation,
  social,
}: ConversationDetailProps) {
  const [followerCount, setFollowerCount] = useState(
    social.authorStats.followerCount
  );
  const [followingAuthor, setFollowingAuthor] = useState(
    social.initialFollowing
  );
  const router = useRouter();

  const isLoggedIn = !!social.currentUserId;
  const showAuthorFollow = !conversation.isOwner;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <h1 className="mb-2 text-xl font-semibold">{conversation.title}</h1>
            {conversation.description && (
              <p className="text-sm text-muted-foreground">
                {conversation.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Link
                href={`/user/${conversation.user.id}`}
                className="flex items-center gap-2 font-medium text-foreground hover:underline"
              >
                {conversation.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={conversation.user.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {conversation.user.nickname[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                {conversation.user.nickname}
              </Link>
              {showAuthorFollow && (
                <FollowButton
                  userId={conversation.user.id}
                  initialFollowing={social.initialFollowing}
                  following={followingAuthor}
                  onFollowingChange={setFollowingAuthor}
                  variant="primary"
                  isLoggedIn={isLoggedIn}
                  loginCallbackPath={`/conversation/${conversation.id}`}
                  onFollowerCountChange={setFollowerCount}
                />
              )}
              <span>
                {new Date(conversation.createdAt).toLocaleDateString("zh-CN")}
              </span>
              <span>{conversation.viewCount} 次浏览</span>
              <span>{conversation.messageCount} 条消息</span>
              <SourceBadge sourceType={conversation.sourceType} size="md" />
            </div>
            {conversation.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {conversation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-white p-4 dark:bg-background">
            <ChatViewer
              rawContent={conversation.rawContent}
              sourceType={conversation.sourceType}
              isLocked={!conversation.hasFullAccess}
              unlockPrice={conversation.price}
              isLoggedIn={isLoggedIn}
              conversationId={conversation.id}
            />

            {!conversation.hasFullAccess && conversation.price > 0 && (
              <div className="mt-3 rounded-lg border border-border p-4">
                <ChainUnlockButton
                  conversationId={conversation.id}
                  price={conversation.price}
                  authorWalletAddress={conversation.authorWalletAddress}
                  onSuccess={() => router.refresh()}
                />
              </div>
            )}
          </div>

          <ConversationActionBar
            conversationId={conversation.id}
            initialLikeCount={conversation.likeCount}
            initialDislikeCount={conversation.dislikeCount}
            initialBookmarkCount={conversation.bookmarkCount}
            initialLikeDislike={social.initialLikeDislike}
            initialBookmarked={social.initialBookmarked}
            commentCount={conversation.commentCount}
            isLoggedIn={isLoggedIn}
          />

          <div
            id="comments"
            className="mt-10 scroll-mt-24 rounded-lg border border-border p-4"
          >
            <CommentSection conversationId={conversation.id} />
          </div>
        </div>

        <div className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 text-sm font-medium">关于作者</h3>
            <div className="flex gap-3">
              <Link href={`/user/${conversation.user.id}`}>
                {conversation.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={conversation.user.avatar}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-medium">
                    {conversation.user.nickname[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/user/${conversation.user.id}`}
                  className="font-medium hover:underline"
                >
                  {conversation.user.nickname}
                </Link>
                {conversation.user.bio && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {conversation.user.bio}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-semibold text-foreground tabular-nums">
                  {social.authorStats.publicConversationCount}
                </div>
                <div className="text-muted-foreground">对话</div>
              </div>
              <div>
                <div className="font-semibold text-foreground tabular-nums">
                  {social.authorStats.skillCount}
                </div>
                <div className="text-muted-foreground">技能</div>
              </div>
              <div>
                <div className="font-semibold text-foreground tabular-nums">
                  {followerCount}
                </div>
                <div className="text-muted-foreground">关注者</div>
              </div>
            </div>
            {showAuthorFollow && (
              <div className="mt-3 flex flex-wrap gap-2">
                <FollowButton
                  userId={conversation.user.id}
                  initialFollowing={social.initialFollowing}
                  following={followingAuthor}
                  onFollowingChange={setFollowingAuthor}
                  variant="primary"
                  isLoggedIn={isLoggedIn}
                  loginCallbackPath={`/conversation/${conversation.id}`}
                  onFollowerCountChange={setFollowerCount}
                />
                <Link
                  href={`/user/${conversation.user.id}`}
                  className="inline-flex items-center rounded-md border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  主页
                </Link>
                {conversation.authorWalletAddress && (
                  <TipButton
                    recipientWalletAddress={conversation.authorWalletAddress}
                    recipientNickname={conversation.user.nickname}
                  />
                )}
              </div>
            )}
          </div>

          {conversation.environment && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-medium">Environment</h3>
              <div className="space-y-1 text-sm">
                {conversation.environment.os && (
                  <div>
                    <span className="text-muted-foreground">OS: </span>
                    {conversation.environment.os}
                  </div>
                )}
                {conversation.environment.containerInfo && (
                  <div>
                    <span className="text-muted-foreground">Container: </span>
                    {conversation.environment.containerInfo}
                  </div>
                )}
                {conversation.environment.gpu && (
                  <div>
                    <span className="text-muted-foreground">GPU: </span>
                    {conversation.environment.gpu}
                  </div>
                )}
                {conversation.environment.runtimeInfo && (
                  <div>
                    <span className="text-muted-foreground">Runtime: </span>
                    {conversation.environment.runtimeInfo}
                  </div>
                )}
              </div>
            </div>
          )}

          {conversation.skills.length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-medium">
                Skills ({conversation.skills.length})
              </h3>
              <div className="space-y-2">
                {conversation.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="rounded border border-border p-2 text-sm"
                  >
                    <div className="font-medium">{skill.name}</div>
                    {skill.description && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {skill.description}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {skill.likeCount} likes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
