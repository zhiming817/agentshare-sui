import { ParsedMessage, ParsedConversation } from "@/types/conversation";

export function parseMarkdown(content: string): ParsedConversation {
  const messages: ParsedMessage[] = [];

  // Split by "## User", "## Assistant", "## System", "## Tool" headers
  const rolePattern = /^## (User|Assistant|System|Tool)\s*$/m;

  const parts = content.split(rolePattern);

  let sequence = 0;
  for (let i = 1; i < parts.length; i += 2) {
    const roleText = parts[i];
    const body = (parts[i + 1] || "").trim();

    if (!body) continue;

    const roleMap: Record<string, ParsedMessage["role"]> = {
      User: "user",
      user: "user",
      Assistant: "assistant",
      assistant: "assistant",
      System: "system",
      system: "system",
      Tool: "tool",
      tool: "tool",
    };

    sequence++;
    messages.push({
      sequence,
      role: roleMap[roleText] || "assistant",
      content: body,
    });
  }

  // Fallback: if no headers found, split by ---
  if (messages.length === 0) {
    const fallbackParts = content.split(/\n---\n/);
    for (const part of fallbackParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      sequence++;
      messages.push({
        sequence,
        role: "assistant",
        content: trimmed,
      });
    }
  }

  return { messages };
}
