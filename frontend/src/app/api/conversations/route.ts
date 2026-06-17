import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const sort = searchParams.get("sort") || "latest";
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  const skip = (page - 1) * limit;

  const where = {
    isPublic: true,
    ...(tag ? { tags: { has: tag } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            {
              description: { contains: search, mode: "insensitive" as const },
            },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "popular"
      ? { likeCount: "desc" as const }
      : sort === "most_viewed"
        ? { viewCount: "desc" as const }
        : { createdAt: "desc" as const };

  const [conversations, total] = await Promise.all([
    db.conversation.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    }),
    db.conversation.count({ where }),
  ]);

  return NextResponse.json({
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
