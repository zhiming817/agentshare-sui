import { db } from "@/lib/db";
import { ConversationCard } from "@/components/conversation/conversation-card";
import { SearchBar } from "@/components/home/search-bar";
import { InstallGuide } from "@/components/home/install-guide";
import { AgtLeaderboard } from "@/components/home/agt-leaderboard";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Trophy,
  TrendingUp,
  Flame,
  Zap,
} from "lucide-react";

export const revalidate = 60;

async function getTrendingConversations() {
  return db.conversation.findMany({
    where: { isPublic: true },
    orderBy: [{ likeCount: "desc" }, { viewCount: "desc" }],
    take: 6,
    include: {
      user: { select: { id: true, nickname: true, avatar: true } },
    },
  });
}

async function getPopularSkills() {
  return db.skill.findMany({
    orderBy: { likeCount: "desc" },
    take: 6,
    include: {
      user: { select: { id: true, nickname: true } },
    },
  });
}

async function getTrendingTags() {
  const conversations = await db.conversation.findMany({
    where: { isPublic: true, tags: { isEmpty: false } },
    select: { tags: true },
    take: 200,
    orderBy: { likeCount: "desc" },
  });

  const tagCount: Record<string, number> = {};
  for (const conv of conversations) {
    for (const tag of conv.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 16)
    .map(([tag, count]) => ({ tag, count }));
}

async function getLeaderboard() {
  const users = await db.user.findMany({
    take: 10,
    select: {
      id: true,
      nickname: true,
      avatar: true,
      _count: {
        select: {
          conversations: { where: { isPublic: true } },
          skills: true,
        },
      },
    },
  });

  return users
    .map((u) => ({
      id: u.id,
      nickname: u.nickname,
      avatar: u.avatar,
      conversations: u._count.conversations,
      skills: u._count.skills,
    }))
    .sort(
      (a, b) =>
        b.conversations + b.skills - (a.conversations + a.skills)
    );
}

export default async function Home() {
  const [trending, skills, tags, leaderboard] = await Promise.all([
    getTrendingConversations(),
    getPopularSkills(),
    getTrendingTags(),
    getLeaderboard(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--zhihu-blue)]/5 via-transparent to-violet-500/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Agent Share
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            分享、发现 AI Agent 的精彩对话
          </p>
          <SearchBar />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
        {/* Row: Trending Conversations + Trending Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trending Conversations */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-orange-500" />
                <h2 className="text-lg font-semibold">热门对话</h2>
              </div>
              <Link
                href="/explore"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                查看全部
                <ArrowRight size={12} />
              </Link>
            </div>
            {trending.length === 0 ? (
              <div className="border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                暂无对话，快来分享第一个！
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trending.map((conv) => (
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
          </section>

          {/* Sidebar: Trending Tags + Leaderboard */}
          <aside className="space-y-6">
            {/* Trending Tags */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-[var(--zhihu-blue)]" />
                <h3 className="font-semibold text-sm">大家都在搜</h3>
              </div>
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无热门标签</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      href={`/explore?tag=${encodeURIComponent(tag)}`}
                      className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                    >
                      {tag}
                      <span className="ml-1 text-muted-foreground/60">
                        {count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-amber-500" />
                <h3 className="font-semibold text-sm">活跃排行榜</h3>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无数据</p>
              ) : (
                <div className="space-y-1.5">
                  {leaderboard.slice(0, 8).map((user, i) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2.5 text-sm py-1"
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          i === 0
                            ? "bg-amber-100 text-amber-700"
                            : i === 1
                            ? "bg-gray-100 text-gray-600"
                            : i === 2
                            ? "bg-orange-100 text-orange-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.nickname}
                          className="w-5 h-5 rounded-full shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted shrink-0 flex items-center justify-center text-[10px]">
                          {user.nickname[0]}
                        </div>
                      )}
                      <span className="truncate flex-1 text-xs">
                        {user.nickname}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {user.conversations} 对话 · {user.skills} 技能
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AGT Leaderboard */}
            <AgtLeaderboard />
          </aside>
        </div>

        {/* Popular Skills */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-violet-500" />
              <h2 className="text-lg font-semibold">热门技能</h2>
            </div>
            <Link
              href="/skills"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              查看全部
              <ArrowRight size={12} />
            </Link>
          </div>
          {skills.length === 0 ? (
            <div className="border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
              暂无技能
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {skill.name}
                    </div>
                    {skill.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {skill.description}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      by {skill.user.nickname}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-3 shrink-0">
                    <Sparkles size={12} />
                    {skill.likeCount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Agent Install Guide */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-[var(--zhihu-blue)]" />
            <h2 className="text-lg font-semibold">接入 Agent Share</h2>
          </div>
          <InstallGuide />
        </section>
      </div>
    </div>
  );
}
