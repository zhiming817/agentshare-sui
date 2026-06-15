import type { ContentBlock } from "@/types/conversation";
import {
  Wrench,
  Terminal,
  Search,
  Pencil,
  FolderOpen,
  ListTodo,
  FilePlus2,
  FileCode,
  Globe,
  MessageSquare,
  GitBranch,
  Database,
  HardDrive,
  Bot,
} from "lucide-react";

export function buildToolMap(content: ContentBlock[]): Map<string, string> {
  const toolMap = new Map<string, string>();
  for (const block of content) {
    if (block.type === "tool_use" && block.id && block.name) {
      toolMap.set(block.id, block.name);
    }
  }
  return toolMap;
}

const TOOL_ICONS: Record<string, typeof Wrench> = {
  todowrite: ListTodo,
  read: FileCode,
  bash: Terminal,
  grep: Search,
  edit: Pencil,
  write: FilePlus2,
  glob: FolderOpen,
  task: Bot,
};

const TOOL_ICON_PATTERNS: Array<{ patterns: string[]; icon: typeof Wrench }> = [
  { patterns: ["web", "fetch", "url"], icon: Globe },
  { patterns: ["ask", "question"], icon: MessageSquare },
  { patterns: ["git", "commit"], icon: GitBranch },
  { patterns: ["sql", "database", "query"], icon: Database },
  { patterns: ["file", "disk"], icon: HardDrive },
];

export function getToolIcon(toolName: string) {
  const name = toolName.toLowerCase();
  if (TOOL_ICONS[name]) return TOOL_ICONS[name];
  for (const { patterns, icon } of TOOL_ICON_PATTERNS) {
    if (patterns.some((p) => name.includes(p))) return icon;
  }
  return Wrench;
}

function getFilePathPreview(filePath: string): string {
  const parts = filePath.split("/");
  return parts.slice(-2).join("/");
}

type PreviewHandler = (input: Record<string, unknown>) => string | null;

const TOOL_PREVIEW_HANDLERS: Record<string, PreviewHandler> = {
  read: (input) =>
    input.file_path ? getFilePathPreview(String(input.file_path)) : null,
  edit: (input) =>
    input.file_path ? getFilePathPreview(String(input.file_path)) : null,
  write: (input) =>
    input.file_path ? getFilePathPreview(String(input.file_path)) : null,
  bash: (input) => {
    if (!input.command) return null;
    const cmd = String(input.command);
    return cmd.length > 50 ? cmd.slice(0, 50) + "..." : cmd;
  },
  grep: (input) => (input.pattern ? `"${String(input.pattern)}"` : null),
  glob: (input) => (input.pattern ? String(input.pattern) : null),
  task: (input) => (input.description ? String(input.description) : null),
};

export function getToolPreview(
  toolName: string,
  input: Record<string, unknown> | undefined
): string | null {
  if (!input) return null;
  const name = toolName.toLowerCase();
  const handler = TOOL_PREVIEW_HANDLERS[name];
  if (handler) return handler(input);
  if (name.includes("web") && input.url) {
    try {
      const url = new URL(String(input.url));
      return url.hostname;
    } catch {
      return String(input.url).slice(0, 30);
    }
  }
  return null;
}
