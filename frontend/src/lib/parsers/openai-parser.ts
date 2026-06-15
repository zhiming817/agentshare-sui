import {
  ContentBlock,
  ParsedMessageV2,
  ParsedConversationV2,
} from "@/types/conversation";

interface OpenAIToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAIMessage {
  role: "user" | "assistant" | "system" | "tool";
  content?: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
  name?: string;
  timestamp?: string;
}

export function parseOpenai(content: string): ParsedConversationV2 {
  const data = JSON.parse(content);

  // Support top-level array or { messages: [...] }
  const rawMessages: OpenAIMessage[] = Array.isArray(data)
    ? data
    : data.messages ?? [];

  const messages: ParsedMessageV2[] = [];
  let sequence = 0;

  for (const msg of rawMessages) {
    if (!msg.role) continue;

    // Skip system messages
    if (msg.role === "system") continue;

    // Tool result message → single tool_result block
    if (msg.role === "tool") {
      const resultContent = typeof msg.content === "string" ? msg.content : "";
      const blocks: ContentBlock[] = [
        {
          type: "tool_result",
          tool_use_id: msg.tool_call_id || "",
          content: resultContent,
          is_error: false,
        },
      ];

      sequence++;
      messages.push({
        sequence,
        type: "assistant", // tool results render under assistant context
        role: "tool",
        contentBlocks: blocks,
        contentText: resultContent,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
      });
      continue;
    }

    // user or assistant message
    const contentBlocks: ContentBlock[] = [];

    // Text content
    if (msg.content) {
      contentBlocks.push({ type: "text", text: msg.content });
    }

    // Tool calls (assistant only)
    if (msg.role === "assistant" && msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        let parsedInput: unknown;
        try {
          parsedInput = JSON.parse(tc.function.arguments);
        } catch {
          parsedInput = { raw: tc.function.arguments };
        }
        contentBlocks.push({
          type: "tool_use",
          id: tc.id,
          name: tc.function.name,
          input: parsedInput,
        });
      }
    }

    if (contentBlocks.length === 0) continue;

    const contentText = contentBlocks
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text!)
      .join("\n")
      .trim();

    sequence++;
    messages.push({
      sequence,
      type: msg.role as "user" | "assistant",
      role: msg.role,
      contentBlocks,
      contentText,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
    });
  }

  return { messages };
}
