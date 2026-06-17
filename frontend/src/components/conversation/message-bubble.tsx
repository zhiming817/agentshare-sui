"use client";

import { memo } from "react";
import type { ContentBlock, ParsedMessageV2 } from "@/types/conversation";
import { sanitizeText } from "@/lib/sanitize";
import { buildToolMap } from "@/lib/tool-utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { ContentBlockRenderer } from "./content-block-renderer";

interface MessageBubbleProps {
  message: ParsedMessageV2;
}

const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === "user";
  const contentBlocks = message.contentBlocks;

  const getTextBlocks = (): ContentBlock[] =>
    contentBlocks.filter((b) => b.type === "text");

  const getToolBlocks = (): ContentBlock[] =>
    contentBlocks.filter(
      (b) => b.type === "tool_use" || b.type === "tool_result" || b.type === "thinking"
    );

  const getVisibleTextBlocks = (): ContentBlock[] =>
    getTextBlocks().filter((b) => b.text && sanitizeText(b.text).length > 0);

  const hasVisibleText = (): boolean => {
    if (typeof message.contentText === "string" && contentBlocks.length === 0) {
      return sanitizeText(message.contentText).length > 0;
    }
    return getVisibleTextBlocks().length > 0;
  };

  const toolBlocks = getToolBlocks();
  const visibleTextBlocks = getVisibleTextBlocks();
  const hasText = hasVisibleText();
  const hasTools = toolBlocks.length > 0;
  const toolMap = buildToolMap(contentBlocks);

  // Only tools, no text
  if (!hasText && hasTools) {
    return (
      <div className="flex flex-col gap-1 py-0.5">
        {toolBlocks.map((block, index) => (
          <ContentBlockRenderer key={index} block={block} toolMap={toolMap} />
        ))}
      </div>
    );
  }

  // Nothing visible
  if (!hasText && !hasTools) return null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} min-w-0`}>
      <div className="max-w-[85%] min-w-0">
        <div
          className={`px-3.5 py-2.5 rounded-2xl overflow-hidden ${
            isUser
              ? "bg-blue-600 dark:bg-blue-600/80 text-white rounded-br-md"
              : "bg-muted/50 border border-border rounded-bl-md"
          }`}
        >
          <div className="flex flex-col gap-1">
            {visibleTextBlocks.map((block, index) => (
              <ContentBlockRenderer
                key={index}
                block={block}
                isUser={isUser}
                toolMap={toolMap}
              />
            ))}
          </div>
        </div>

        {hasTools && (
          <div className="flex flex-col gap-1 mt-1.5">
            {toolBlocks.map((block, index) => (
              <ContentBlockRenderer key={index} block={block} toolMap={toolMap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export { MessageBubble };
