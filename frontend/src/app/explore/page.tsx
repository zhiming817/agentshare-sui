import { db } from "@/lib/db";
import { ConversationCard } from "@/components/conversation/conversation-card";
import { ExploreClient } from "./explore-client";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; tag?: string; search?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort || "latest";
  const tag = params.tag;
  const search = params.search;

  const where = {
    isPublic: true,
    ...(tag ? { tags: { has: tag } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
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

  const conversations = await db.conversation.findMany({
    where,
    orderBy,
    take: 24,
    include: {
      user: {
        select: { id: true, nickname: true, avatar: true },
      },
    },
  });

  const allTags = await db.conversation
    .findMany({
      where: { isPublic: true },
      select: { tags: true },
    })
    .then((results) =>
      [...new Set(results.flatMap((r) => r.tags))].sort()
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ExploreClient
        sort={sort}
        tag={tag}
        search={search}
        allTags={allTags}
      />

      {conversations.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center text-muted-foreground text-sm">
          No conversations found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversations.map((conv) => (
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
      )}
    </div>
  );
}
