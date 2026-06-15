import {
  ContentBlock,
  ParsedMessageV2,
  ParsedConversationV2,
} from "@/types/conversation";

export function parseJsonl(content: string): ParsedConversationV2 {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const messages: ParsedMessageV2[] = [];
  let sequence = 0;
  let summary: string | undefined;

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      const msgType = obj.type;
      const msg = obj.message;

      // Handle summary entries
      if (msgType === "summary" && obj.summary) {
        summary = obj.summary;
        continue;
      }

      // Only process user and assistant messages
      if (!msg || (msgType !== "user" && msgType !== "assistant")) continue;

      const role = msg.role ?? msgType;
      const rawContent = msg.content;

      // Normalize to ContentBlock[]
      let contentBlocks: ContentBlock[];
      let contentText: string;

      if (typeof rawContent === "string") {
        contentText = rawContent;
        contentBlocks = rawContent
          ? [{ type: "text", text: rawContent }]
          : [];
      } else if (Array.isArray(rawContent)) {
        contentBlocks = rawContent as ContentBlock[];
        contentText = extractPlainText(contentBlocks);
      } else {
        contentBlocks = [];
        contentText = "";
      }

      // Skip empty messages
      if (contentBlocks.length === 0) continue;

      sequence++;
      messages.push({
        sequence,
        type: msgType,
        role,
        contentBlocks,
        contentText,
        timestamp: obj.timestamp ? new Date(obj.timestamp as string) : undefined,
        model: msg.model,
        usage: msg.usage,
      });
    } catch {
      // Skip unparseable lines
    }
  }

  return { messages, summary };
}

function extractPlainText(blocks: ContentBlock[]): string {
  return blocks
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text!)
    .join("\n")
    .trim();
}
