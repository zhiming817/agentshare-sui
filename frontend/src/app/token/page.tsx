import Link from "next/link";
import {
  Coins,
  Unlock,
  Heart,
  Vote,
  Droplets,
  Share2,
  Wallet,
  Users,
  ArrowRight,
  Check,
  Sparkles,
  Target,
  Rocket,
} from "lucide-react";

export const metadata = {
  title: "AGT Token - AgentShare",
  description: "AGT 代币经济学与社区共建计划",
};

const DISTRIBUTION = [
  { label: "创作者激励", pct: 40, color: "bg-[var(--zhihu-blue)]" },
  { label: "社区奖励", pct: 20, color: "bg-violet-500" },
  { label: "平台运营", pct: 15, color: "bg-emerald-500" },
  { label: "生态发展", pct: 15, color: "bg-amber-500" },
  { label: "流动性", pct: 10, color: "bg-rose-400" },
];

const ROADMAP = [
  {
    phase: "Phase 1",
    title: "基础建设",
    status: "current" as const,
    items: ["AGT 代币部署 (Solana SPL)", "水龙头分发机制", "付费解锁 & 打赏功能", "链上交易验证"],
  },
  {
    phase: "Phase 2",
    title: "增长激励",
    status: "upcoming" as const,
    items: ["创作者推荐奖励", "活跃度挖矿", "生态合作伙伴接入", "AGT 质押收益"],
  },
  {
    phase: "Phase 3",
    title: "社区治理",
    status: "upcoming" as const,
    items: ["AGT 治理投票", "社区提案系统", "DAO 金库管理", "去中心化运营"],
  },
];

const colorMap: Record<string, string> = {
  "bg-[var(--zhihu-blue)]": "var(--zhihu-blue)",
  "bg-violet-500": "#8b5cf6",
  "bg-emerald-500": "#10b981",
  "bg-amber-500": "#f59e0b",
  "bg-rose-400": "#fb7185",
};

function DistributionChart() {
  let cum = 0;
  const gradientStops = DISTRIBUTION.map((d) => {
    const start = cum;
    cum += d.pct;
    return `${colorMap[d.color]} ${start}% ${cum}%`;
  }).join(", ");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div
        className="w-48 h-48 rounded-full shrink-0"
        style={{
          background: `conic-gradient(${gradientStops})`,
        }}
      />
      <div className="space-y-3 w-full">
        {DISTRIBUTION.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${d.color}`} />
              <span className="text-sm">{d.label}</span>
            </div>
            <span className="text-sm font-medium">{d.pct}%</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex items-center justify-between">
          <span className="text-sm font-medium">总供应量</span>
          <span className="text-sm font-bold">1,000,000,000 AGT</span>
        </div>
      </div>
    </div>
  );
}

export default function TokenPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-[var(--zhihu-blue)]/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/10 to-[var(--zhihu-blue)]/10 mb-6">
            <Coins className="w-10 h-10 text-violet-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            AGT Token
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
            驱动 AI Agent 生态的价值代币
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: "总供应量", value: "1,000,000,000" },
              { label: "精度", value: "9 Decimals" },
              { label: "网络", value: "Solana" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border border-border rounded-lg p-4 bg-card"
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 space-y-16">
        {/* Token Utility */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">代币用途</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Unlock,
                title: "解锁付费对话",
                desc: "使用 AGT 解锁其他创作者分享的优质 AI Agent 对话内容",
              },
              {
                icon: Heart,
                title: "打赏创作者",
                desc: "直接用 AGT 打赏喜欢的对话作者，创作者获得 95% 收入",
              },
              {
                icon: Vote,
                title: "社区治理",
                desc: "参与平台投票与提案，共同决定 AgentShare 的未来方向",
                badge: "Coming Soon",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors relative"
              >
                {item.badge && (
                  <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    {item.badge}
                  </span>
                )}
                <div className="w-10 h-10 rounded-lg bg-[var(--zhihu-blue)]/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-[var(--zhihu-blue)]" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Token Distribution */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">代币分配</h2>
          <div className="border border-border rounded-lg p-8">
            <DistributionChart />
          </div>
        </section>

        {/* How to Earn */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">如何获得 AGT</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Droplets,
                title: "水龙头领取",
                desc: "连接 Solana 钱包，免费领取 1,000 AGT",
                link: "/faucet",
              },
              {
                icon: Share2,
                title: "分享对话",
                desc: "上传 AI Agent 对话，设置价格获得收入",
                link: "/explore",
              },
              {
                icon: Wallet,
                title: "被解锁/打赏",
                desc: "优质内容被其他用户解锁或打赏赚取 AGT",
              },
              {
                icon: Users,
                title: "社区贡献",
                desc: "参与社区建设、推荐创作者等获得奖励",
                badge: "Coming Soon",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="border border-border rounded-lg p-5 relative"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                </div>
                {item.badge && (
                  <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    {item.badge}
                  </span>
                )}
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                {item.link && (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs text-[var(--zhihu-blue)] mt-3 hover:underline"
                  >
                    前往 <ArrowRight size={10} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Community Roadmap */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">社区共建路线图</h2>
          <div className="space-y-6">
            {ROADMAP.map((phase) => (
              <div
                key={phase.phase}
                className={`border rounded-lg p-6 ${
                  phase.status === "current"
                    ? "border-[var(--zhihu-blue)] bg-[var(--zhihu-blue)]/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      phase.status === "current"
                        ? "bg-[var(--zhihu-blue)] text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {phase.phase}
                  </span>
                  <h3 className="font-semibold">{phase.title}</h3>
                  {phase.status === "current" && (
                    <span className="flex items-center gap-1 text-xs text-[var(--zhihu-blue)]">
                      <Sparkles size={12} />
                      当前阶段
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {phase.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check
                        size={14}
                        className={
                          phase.status === "current"
                            ? "text-[var(--zhihu-blue)]"
                            : "text-muted-foreground/50"
                        }
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border border-border rounded-lg p-10 text-center">
          <Rocket className="w-10 h-10 mx-auto mb-4 text-violet-500" />
          <h2 className="text-2xl font-bold mb-2">加入 AgentShare 生态</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            分享你的 AI Agent 对话，用 AGT 激励优质内容创作，共建开放的 Agent 社区
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/faucet"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Coins size={16} />
              领取 AGT
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
            >
              <Target size={16} />
              浏览对话
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
