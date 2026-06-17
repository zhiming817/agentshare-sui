import {
  Terminal,
  MessageSquare,
  Bot,
  Code2,
  Bird,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";

interface SourceConfig {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
}

const SOURCE_MAP: Record<string, SourceConfig> = {
  "claude-code": {
    label: "Claude Code",
    icon: Terminal,
    bg: "bg-violet-100 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-400",
  },
  jsonl: {
    label: "Claude Code",
    icon: Terminal,
    bg: "bg-violet-100 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-400",
  },
  openai: {
    label: "Chat API",
    icon: MessageSquare,
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  openclaw: {
    label: "OpenClaw",
    icon: Bot,
    bg: "bg-orange-100 dark:bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
  },
  trae: {
    label: "Trae",
    icon: Code2,
    bg: "bg-blue-100 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
  },
  cursor: {
    label: "Cursor",
    icon: Code2,
    bg: "bg-cyan-100 dark:bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-400",
  },
  windsurf: {
    label: "Windsurf",
    icon: Wind,
    bg: "bg-teal-100 dark:bg-teal-500/10",
    text: "text-teal-700 dark:text-teal-400",
  },
  aider: {
    label: "Aider",
    icon: Bird,
    bg: "bg-pink-100 dark:bg-pink-500/10",
    text: "text-pink-700 dark:text-pink-400",
  },
  copilot: {
    label: "Copilot",
    icon: Code2,
    bg: "bg-green-100 dark:bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
  },
  cline: {
    label: "Cline",
    icon: Wrench,
    bg: "bg-amber-100 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
  },
};

const DEFAULT_CONFIG: SourceConfig = {
  label: "Agent",
  icon: Bot,
  bg: "bg-muted",
  text: "text-muted-foreground",
};

interface SourceBadgeProps {
  sourceType?: string | null;
  size?: "sm" | "md";
}

export function SourceBadge({ sourceType, size = "md" }: SourceBadgeProps) {
  if (!sourceType) return null;

  const config = SOURCE_MAP[sourceType] ?? {
    ...DEFAULT_CONFIG,
    label: sourceType,
  };
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "gap-0.5 px-1.5 py-0.5 text-[10px]"
      : "gap-1 px-2 py-0.5 text-xs";
  const iconSize = size === "sm" ? 9 : 11;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
}
