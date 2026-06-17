import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ConversationDetail } from "./conversation-detail";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = await db.conversation.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, nickname: true, avatar: true, bio: true, walletAddress: true },
      },
      environment: true,
      skills: {
        include: {
          skill: true,
        },
      },
      unlocks: {
        select: { userId: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!conversation || !conversation.isPublic) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;
  const isOwner = userId === conversation.userId;
  const hasUnlocked = userId
    ? conversation.unlocks.some((u: { userId: string }) => u.userId === userId)
    : false;
  const isFree = conversation.price === 0;
  const hasFullAccess = isOwner || hasUnlocked || isFree;

  const authorId = conversation.userId;

  const [publicConversationCount, authorSkillCount, authorFollowerCount] =
    await Promise.all([
      db.conversation.count({
        where: { userId: authorId, isPublic: true },
      }),
      db.skill.count({ where: { userId: authorId } }),
      db.follow.count({ where: { followingId: authorId } }),
    ]);

  let initialLikeDislike: "like" | "dislike" | null = null;
  let initialBookmarked = false;
  let initialFollowing = false;

  if (userId) {
    const [interactionRows, followRow] = await Promise.all([
      db.interaction.findMany({
        where: {
          userId,
          targetType: "conversation",
          targetId: id,
          action: { in: ["like", "dislike", "bookmark"] },
        },
        select: { action: true },
      }),
      userId !== authorId
        ? db.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: userId,
                followingId: authorId,
              },
            },
          })
        : Promise.resolve(null),
    ]);

    if (interactionRows.some((r) => r.action === "like")) {
      initialLikeDislike = "like";
    } else if (interactionRows.some((r) => r.action === "dislike")) {
      initialLikeDislike = "dislike";
    }
    initialBookmarked = interactionRows.some((r) => r.action === "bookmark");
    initialFollowing = !!followRow;
  }

  return (
    <ConversationDetail
      conversation={{
        id: conversation.id,
        title: conversation.title,
        description: conversation.description,
        price: conversation.price,
        viewCount: conversation.viewCount,
        likeCount: conversation.likeCount,
        dislikeCount: conversation.dislikeCount,
        bookmarkCount: conversation.bookmarkCount,
        commentCount: conversation._count.comments,
        messageCount: conversation.messageCount,
        tags: conversation.tags,
        createdAt: conversation.createdAt.toISOString(),
        user: conversation.user,
        environment: conversation.environment,
        skills: conversation.skills.map((cs) => cs.skill),
        rawContent: conversation.rawContent,
        sourceType: conversation.sourceType,
        hasFullAccess,
        isOwner,
        authorWalletAddress: conversation.user.walletAddress ?? undefined,
      }}
      social={{
        currentUserId: userId ?? null,
        initialLikeDislike,
        initialBookmarked,
        initialFollowing,
        authorStats: {
          publicConversationCount,
          skillCount: authorSkillCount,
          followerCount: authorFollowerCount,
        },
      }}
    />
  );
}
