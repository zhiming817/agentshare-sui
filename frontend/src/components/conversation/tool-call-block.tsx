"use client";

import { useState } from "react";

interface ToolCallBlockProps {
  toolCalls: Record<string, unknown>[];
}

export function ToolCallBlock({ toolCalls }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="my-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="text-xs">{expanded ? "▼" : "▶"}</span>
        <span className="font-medium">
          {toolCalls.length} tool call{toolCalls.length > 1 ? "s" : ""}
        </span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {toolCalls.map((tc, i) => (
            <div
              key={i}
              className="bg-muted border border-border rounded-md p-3 text-xs font-mono"
            >
              <div className="font-semibold text-foreground">
                {String(tc.name ?? `Tool Call #${i + 1}`)}
              </div>
              {tc.arguments != null && (
                <pre className="mt-1 text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                  {typeof tc.arguments === "string"
                    ? tc.arguments
                    : JSON.stringify(tc.arguments, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
