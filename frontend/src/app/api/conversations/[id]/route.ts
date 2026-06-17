import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const MESSAGE_PAGE_SIZE = 50;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor")
    ? parseInt(searchParams.get("cursor")!)
    : undefined;
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(MESSAGE_PAGE_SIZE)),
    100
  );

  const conversation = await db.conversation.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, nickname: true, avatar: true },
      },
      messages: {
        where: cursor ? { sequence: { gt: cursor } } : undefined,
        orderBy: { sequence: "asc" },
        take: limit + 1,
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
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  if (!conversation.isPublic) {
    return NextResponse.json({ error: "Private conversation" }, { status: 403 });
  }

  // Increment view count (fire and forget)
  db.conversation
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  // Determine if user has full access
  const session = await auth();
  const userId = session?.user?.id;
  const isOwner = userId === conversation.userId;
  const hasUnlocked = userId
    ? conversation.unlocks.some((u: { userId: string }) => u.userId === userId)
    : false;
  const isFree = conversation.price === 0;
  const hasFullAccess = isOwner || hasUnlocked || isFree;

  // Cursor-based pagination: check if there's a next page
  const hasMore = conversation.messages.length > limit;
  const messages = hasMore ? conversation.messages.slice(0, -1) : conversation.messages;
  const nextCursor = hasMore ? messages[messages.length - 1]?.sequence : null;

  // Calculate preview limit (20% of total messages)
  const totalMessages = conversation.messageCount;
  const previewLimit = Math.max(
    1,
    Math.ceil(totalMessages * 0.2)
  );

  return NextResponse.json({
    ...conversation,
    messages,
    hasFullAccess,
    previewLimit: hasFullAccess ? null : previewLimit,
    pagination: {
      hasMore,
      nextCursor,
      totalMessages,
    },
  });
}
