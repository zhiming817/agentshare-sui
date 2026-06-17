import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type TargetType = "conversation" | "skill";
type Action = "like" | "dislike" | "bookmark";

const VALID_TARGET_TYPES: TargetType[] = ["conversation", "skill"];
const VALID_ACTIONS: Action[] = ["like", "dislike", "bookmark"];

const COUNT_FIELDS: Record<TargetType, Record<Action, string>> = {
  conversation: {
    like: "likeCount",
    dislike: "dislikeCount",
    bookmark: "bookmarkCount",
  },
  skill: {
    like: "likeCount",
    dislike: "likeCount",
    bookmark: "likeCount",
  },
};

function txUpdateCount(
  tx: any,
  targetType: TargetType,
  targetId: string,
  field: string,
  delta: number
) {
  const data = { [field]: { increment: delta } };
  if (targetType === "conversation") {
    return tx.conversation.update({ where: { id: targetId }, data });
  }
  return tx.skill.update({ where: { id: targetId }, data });
}

async function getConversationCounts(targetId: string) {
  const c = await db.conversation.findUnique({
    where: { id: targetId },
    select: {
      likeCount: true,
      dislikeCount: true,
      bookmarkCount: true,
    },
  });
  return c;
}

async function getSkillCounts(targetId: string) {
  const s = await db.skill.findUnique({
    where: { id: targetId },
    select: { likeCount: true },
  });
  if (!s) return null;
  return {
    likeCount: s.likeCount,
    dislikeCount: s.likeCount,
    bookmarkCount: s.likeCount,
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    const body = await request.json();
    const { targetType, targetId, action } = body as {
      targetType: string;
      targetId: string;
      action: string;
    };

    if (
      !targetType ||
      !targetId ||
      !action ||
      !VALID_TARGET_TYPES.includes(targetType as TargetType) ||
      !VALID_ACTIONS.includes(action as Action)
    ) {
      return NextResponse.json(
        { error: "Invalid targetType, targetId, or action" },
        { status: 400 }
      );
    }

    const typedTargetType = targetType as TargetType;
    const typedAction = action as Action;
    const countField = COUNT_FIELDS[typedTargetType][typedAction];

    // Verify target exists
    if (typedTargetType === "conversation") {
      const convo = await db.conversation.findUnique({
        where: { id: targetId },
      });
      if (!convo) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      const skill = await db.skill.findUnique({ where: { id: targetId } });
      if (!skill) {
        return NextResponse.json(
          { error: "Skill not found" },
          { status: 404 }
        );
      }
    }

    // Find existing interaction with same action
    const existing = await db.interaction.findUnique({
      where: {
        userId_targetType_targetId_action: {
          userId: userId,
          targetType: typedTargetType,
          targetId,
          action: typedAction,
        },
      },
    });

    if (existing) {
      // Toggle off
      await db.$transaction((tx: any) =>
        Promise.all([
          tx.interaction.delete({
            where: {
              userId_targetType_targetId_action: {
                userId: userId,
                targetType: typedTargetType,
                targetId,
                action: typedAction,
              },
            },
          }),
          txUpdateCount(tx, typedTargetType, targetId, countField, -1),
        ])
      );
      const counts =
        typedTargetType === "conversation"
          ? await getConversationCounts(targetId)
          : await getSkillCounts(targetId);
      return NextResponse.json({
        action: null,
        counts:
          counts ?? {
            likeCount: 0,
            dislikeCount: 0,
            bookmarkCount: 0,
          },
      });
    }

    // Handle conflicting like/dislike for conversations
    let conflictingAction: Action | null = null;
    if (typedTargetType === "conversation") {
      conflictingAction =
        typedAction === "like"
          ? "dislike"
          : typedAction === "dislike"
            ? "like"
            : null;
    }

    await db.$transaction(async (tx: any) => {
      if (conflictingAction) {
        const existingConflict = await tx.interaction.findUnique({
          where: {
            userId_targetType_targetId_action: {
              userId: userId,
              targetType: typedTargetType,
              targetId,
              action: conflictingAction!,
            },
          },
        });

        if (existingConflict) {
          const conflictField =
            COUNT_FIELDS[typedTargetType][conflictingAction!];
          await Promise.all([
            tx.interaction.delete({
              where: {
                userId_targetType_targetId_action: {
                  userId: userId,
                  targetType: typedTargetType,
                  targetId,
                  action: conflictingAction!,
                },
              },
            }),
            txUpdateCount(tx, typedTargetType, targetId, conflictField, -1),
          ]);
        }
      }

      await Promise.all([
        tx.interaction.create({
          data: {
            userId: userId,
            targetType: typedTargetType,
            targetId,
            action: typedAction,
          },
        }),
        txUpdateCount(tx, typedTargetType, targetId, countField, 1),
      ]);
    });

    const counts =
      typedTargetType === "conversation"
        ? await getConversationCounts(targetId)
        : await getSkillCounts(targetId);
    return NextResponse.json({
      action: typedAction,
      counts:
        counts ?? {
          likeCount: 0,
          dislikeCount: 0,
          bookmarkCount: 0,
        },
    });
  } catch (error) {
    console.error("Interaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
