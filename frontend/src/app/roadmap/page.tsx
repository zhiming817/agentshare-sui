import Link from "next/link";
import {
  Rocket,
  Code,
  Flame,
  Shield,
  Landmark,
  Droplet,
  BadgeCheck,
  Vote,
  ArrowRight,
  Check,
  Circle,
  Lock,
  Box,
  FileSearch,
  Timer,
  Gem,
  Globe,
  Coins,
} from "lucide-react";

export const metadata = {
  title: "Roadmap - AgentShare",
  description: "AgentShare Web3 发展路线图",
};

type Status = "done" | "active" | "planned";

interface Milestone {
  icon: React.ElementType;
  title: string;
  status: Status;
  desc: string;
}

interface Phase {
  label: string;
  title: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  items: Milestone[];
}

const PHASES: Phase[] = [
  {
    label: "Phase 0",
    title: "基础建设",
    color: "text-emerald-600",
    colorBg: "bg-emerald-500",
    colorBorder: "border-emerald-500",
    items: [
      {
        icon: Code,
        title: "多格式对话解析器",
        status: "done",
        desc: "支持 Claude Code、OpenAI、Cursor、Windsurf 等 10 种格式",
      },
      {
        icon: Coins,
        title: "AGT Token 部署",
        status: "done",
        desc: "Solana SPL Token，9 位精度，总量 1B",
      },
      {
        icon: Landmark,
        title: "钱包连接 & 登录",
        status: "done",
        desc: "Phantom / Solflare 钱包适配，签名验证登录",
      },
      {
        icon: Droplet,
        title: "水龙头 & 链上支付",
        status: "done",
        desc: "免费领取 AGT，链上解锁对话、打赏创作者",
      },
    ],
  },
  {
    label: "Phase 1",
    title: "代币经济闭环",
    color: "text-[var(--zhihu-blue)]",
    colorBg: "bg-[var(--zhihu-blue)]",
    colorBorder: "border-[var(--zhihu-blue)]",
    items: [
      {
        icon: BadgeCheck,
        title: "Token 元数据注册",
        status: "active",
        desc: "Metaplex Token Metadata 注册名称、Logo、描述",
      },
      {
        icon: Shield,
        title: "Staking 质押程序",
        status: "planned",
        desc: "Anchor 开发 Solana Program，质押 AGT 获得权益",
      },
      {
        icon: Flame,
        title: "回购销毁机制",
        status: "planned",
        desc: "平台收入定期回购 AGT 并销毁，通缩经济模型",
      },
      {
        icon: Timer,
        title: "Token Vesting 时间表",
        status: "planned",
        desc: "团队 / 生态份额线性释放，透明可验证",
      },
      {
        icon: Gem,
        title: "空投机制",
        status: "planned",
        desc: "早期用户、活跃创作者的 AGT 空投奖励",
      },
    ],
  },
  {
    label: "Phase 2",
    title: "主网 & 流动性",
    color: "text-violet-600",
    colorBg: "bg-violet-500",
    colorBorder: "border-violet-500",
    items: [
      {
        icon: Globe,
        title: "Mainnet 部署",
        status: "planned",
        desc: "AGT Token + Staking 程序部署到 Solana 主网",
      },
      {
        icon: Landmark,
        title: "DEX 流动性池",
        status: "planned",
        desc: "Raydium / Orca 上线 AGT/SOL 交易对",
      },
      {
        icon: FileSearch,
        title: "安全审计",
        status: "planned",
        desc: "第三方审计 Solana Program，发布审计报告",
      },
      {
        icon: Box,
        title: "链上浏览器集成",
        status: "planned",
        desc: "交易详情链接 Solscan / SolanaFM，用户交易历史页",
      },
    ],
  },
  {
    label: "Phase 3",
    title: "生态扩展",
    color: "text-amber-600",
    colorBg: "bg-amber-500",
    colorBorder: "border-amber-500",
    items: [
      {
        icon: BadgeCheck,
        title: "NFT 成就徽章",
        status: "planned",
        desc: "链上成就系统：首次分享、百次解锁、顶级创作者",
      },
      {
        icon: Vote,
        title: "DAO 治理",
        status: "planned",
        desc: "AGT 持有者投票决定平台参数、金库使用",
      },
      {
        icon: Code,
        title: "创作者声誉凭证",
        status: "planned",
        desc: "链上不可篡改的创作者声誉记录",
      },
      {
        icon: Globe,
        title: "跨链桥",
        status: "planned",
        desc: "扩展到 ETH / Base，多链 AGT 流通",
      },
    ],
  },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === "done") {
    return (
      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
        <Check size={12} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="w-5 h-5 rounded-full bg-[var(--zhihu-blue)] text-white flex items-center justify-center shrink-0 animate-pulse">
        <Circle size={8} fill="currentColor" />
      </span>
    );
  }
  return (
    <span className="w-5 h-5 rounded-full border-2 border-border text-muted-foreground flex items-center justify-center shrink-0">
      <Lock size={10} />
    </span>
  );
}

export default function RoadmapPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--zhihu-blue)]/5 via-transparent to-violet-500/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-[var(--zhihu-blue)]" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Roadmap
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            AgentShare Web3 发展路线图
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              已完成
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[var(--zhihu-blue)]" />
              进行中
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-border" />
              计划中
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>整体进度</span>
            <span>
              {PHASES.flatMap((p) => p.items).filter((i) => i.status === "done").length}
              /{PHASES.flatMap((p) => p.items).length} 完成
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[var(--zhihu-blue)] transition-all"
              style={{
                width: `${
                  (PHASES.flatMap((p) => p.items).filter((i) => i.status === "done").length /
                    PHASES.flatMap((p) => p.items).length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-10">
          {PHASES.map((phase) => {
            const doneCount = phase.items.filter((i) => i.status === "done").length;
            const isActive = phase.items.some((i) => i.status === "active");

            return (
              <div key={phase.label}>
                {/* Phase header */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded text-white ${phase.colorBg}`}
                  >
                    {phase.label}
                  </span>
                  <h2 className={`text-xl font-bold ${phase.color}`}>
                    {phase.title}
                  </h2>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {doneCount}/{phase.items.length}
                  </span>
                </div>

                {/* Milestones */}
                <div
                  className={`border rounded-lg divide-y divide-border ${
                    isActive ? phase.colorBorder : "border-border"
                  }`}
                >
                  {phase.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="mt-0.5">
                        <StatusIcon status={item.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <item.icon size={16} className="text-muted-foreground shrink-0" />
                          <h3
                            className={`font-medium text-sm ${
                              item.status === "planned" ? "text-muted-foreground" : ""
                            }`}
                          >
                            {item.title}
                          </h3>
                          {item.status === "active" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--zhihu-blue)]/10 text-[var(--zhihu-blue)] font-medium">
                              进行中
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            一起建设 AgentShare 的未来
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/token"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              查看代币经济学
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
            >
              浏览对话
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
