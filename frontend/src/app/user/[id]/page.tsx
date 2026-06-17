import { DeletableConversationCard } from "@/components/conversation/deletable-conversation-card";
import { ConversationCard } from "@/components/conversation/conversation-card";
import { UserProfileFollow } from "@/components/social/user-profile-follow";
import { DeletableSkillCard } from "@/components/skill/deletable-skill-card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  const viewerId = session?.user?.id;
  const isOwnProfile = viewerId === id;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          conversations: true,
          skills: true,
          followsGiven: true,
          followsReceived: true,
        },
      },
    },
  });

  if (!user) notFound();

  let initialFollowing = false;
  if (viewerId && !isOwnProfile) {
    const row = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerId,
          followingId: id,
        },
      },
    });
    initialFollowing = !!row;
  }

  const [conversations, skills] = await Promise.all([
    db.conversation.findMany({
      where: { userId: id, isPublic: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    }),
    db.skill.findMany({
      where: { userId: id },
      orderBy: { likeCount: "desc" },
      take: 10,
    }),
  ]);

  // Purchased (unlocked) conversations — only visible on own profile
  let unlockedConversations: typeof conversations = [];
  if (isOwnProfile) {
    const unlocks = await db.unlock.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      select: { conversationId: true },
    });
    if (unlocks.length > 0) {
      unlockedConversations = await db.conversation.findMany({
        where: {
          id: { in: unlocks.map((u) => u.conversationId) },
          isPublic: true,
        },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-start gap-6 border-b border-border pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-medium">
          {user.nickname[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold">{user.nickname}</h1>
          {user.bio && (
            <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
          )}
          {!isOwnProfile && (
            <div className="mt-3">
              <UserProfileFollow
                userId={user.id}
                initialFollowing={initialFollowing}
                isLoggedIn={!!viewerId}
                loginCallbackPath={`/user/${id}`}
                initialFollowerCount={user._count.followsReceived}
              />
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {isOwnProfile && (
              <>
                <span>{user._count.followsReceived} 位关注者</span>
              </>
            )}
            <span>关注 {user._count.followsGiven}</span>
            <span>{user._count.conversations} 个对话</span>
            <span>{user._count.skills} 个技能</span>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Conversations</h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No public conversations yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conversations.map((conv) => (
              <DeletableConversationCard
                key={conv.id}
                isOwnProfile={isOwnProfile}
                conversation={{
                  ...conv,
                  commentCount: conv.commentCount,
                  createdAt: conv.createdAt.toISOString(),
                  user: {
                    id: conv.user.id,
                    nickname: conv.user.nickname,
                    avatar: conv.user.avatar,
                  },
                }}
              />
            ))}
          </div>
        )}
      </section>

      {isOwnProfile && unlockedConversations.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">已购对话</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unlockedConversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={{
                  ...conv,
                  commentCount: conv.commentCount,
                  createdAt: conv.createdAt.toISOString(),
                  user: {
                    id: conv.user.id,
                    nickname: conv.user.nickname,
                    avatar: conv.user.avatar,
                  },
                }}
              />
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Skills</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <DeletableSkillCard
                key={skill.id}
                isOwnProfile={isOwnProfile}
                skill={skill}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
