"use client";

import { useMemo } from "react";
import { parseJsonl } from "@/lib/parsers/jsonl-parser";
import { parseOpenai } from "@/lib/parsers/openai-parser";
import type { ParsedMessageV2 } from "@/types/conversation";
import { MessageBubble } from "./message-bubble";

interface ChatViewerProps {
  rawContent: string;
  sourceType: string;
  isLocked?: boolean;
  onUnlock?: () => void;
  unlockPrice?: number;
  isLoggedIn?: boolean;
  unlocking?: boolean;
  conversationId?: string;
}

export function ChatViewer({
  rawContent,
  sourceType,
  isLocked,
  onUnlock,
  unlockPrice,
  isLoggedIn,
  unlocking,
  conversationId,
}: ChatViewerProps) {
  const parsed = useMemo(() => {
    if (sourceType === "claude-code" || sourceType === "jsonl") {
      return parseJsonl(rawContent);
    }
    // openai, openclaw, trae, cursor, windsurf, aider, copilot, cline, etc.
    if (sourceType !== "plain") {
      return parseOpenai(rawContent);
    }
    // Fallback: treat as plain text
    return {
      messages: rawContent
        .split("\n")
        .filter(Boolean)
        .map((line, i) => ({
          sequence: i + 1,
          type: "assistant" as const,
          role: "assistant",
          contentBlocks: [{ type: "text" as const, text: line }],
          contentText: line,
        })),
      summary: undefined,
    };
  }, [rawContent, sourceType]);

  const messages: ParsedMessageV2[] = parsed.messages;
  const totalCount = messages.length;

  // For locked conversations: only show first 2 lines of the first message
  let visibleMessages: ParsedMessageV2[] = messages;
  if (isLocked && messages.length > 0) {
    const first = messages[0];
    const lines = first.contentText.split("\n").filter(Boolean);
    const previewText = lines.slice(0, 2).join("\n");
    visibleMessages = [
      {
        ...first,
        contentBlocks: [{ type: "text" as const, text: previewText }],
        contentText: previewText,
      },
    ];
  }
  const hiddenCount = totalCount - 1;

  const handleUnlockClick = () => {
    if (!isLoggedIn) {
      const callbackUrl = conversationId
        ? `/conversation/${conversationId}`
        : undefined;
      const loginUrl = callbackUrl
        ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/auth/login";
      window.location.href = loginUrl;
      return;
    }
    onUnlock?.();
  };

  return (
    <div className="space-y-1">
      {visibleMessages.map((msg) => (
        <MessageBubble key={msg.sequence} message={msg} />
      ))}

      {isLocked && hiddenCount > 0 && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-background px-4 py-6 text-center">
              <p className="text-muted-foreground text-sm mb-3">
                {hiddenCount} more message{hiddenCount > 1 ? "s" : ""} hidden
              </p>
              <button
                onClick={handleUnlockClick}
                disabled={unlocking}
                className="bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {unlocking
                  ? "解锁中..."
                  : isLoggedIn
                    ? `解锁完整对话 (${unlockPrice} AGT)`
                    : `登录后解锁 (${unlockPrice} AGT)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
