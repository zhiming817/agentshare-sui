import { ParsedMessage, ParsedConversation } from "@/types/conversation";

export function parseJson(content: string): ParsedConversation {
  const data = JSON.parse(content);

  // Support { messages: [...] } format
  const rawMessages = Array.isArray(data) ? data : data.messages ?? [];

  const messages: ParsedMessage[] = rawMessages.map(
    (msg: Record<string, unknown>, i: number) => ({
      sequence: i + 1,
      role: validateRole(msg.role as string),
      content: String(msg.content ?? ""),
      toolCalls: msg.tool_calls ?? msg.toolCalls ?? undefined,
      timestamp: msg.timestamp ? new Date(msg.timestamp as string) : undefined,
    })
  );

  return {
    messages,
    title: data.title ?? undefined,
  };
}

function validateRole(role: string): ParsedMessage["role"] {
  const valid = ["user", "assistant", "system", "tool"];
  return valid.includes(role) ? (role as ParsedMessage["role"]) : "assistant";
}
