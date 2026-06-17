"use client";

import { Terminal, Play, AlertTriangle, CheckCircle2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface BashInput {
  command: string;
  description?: string;
  timeout?: number;
}

interface BashRendererProps {
  input: BashInput;
}

interface BashResultRendererProps {
  content: string;
  isError?: boolean;
}

export function BashRenderer({ input }: BashRendererProps) {
  const [copied, setCopied] = useState(false);

  if (!input?.command) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(input.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mt-2">
      <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
          <Terminal size={14} className="text-green-500" />
          <span className="text-xs font-medium">Command</span>
          {input.description && (
            <span className="text-xs text-muted-foreground truncate ml-1">
              — {input.description}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="ml-auto p-1 hover:bg-muted rounded transition-colors"
            title="Copy command"
          >
            {copied ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <Copy size={12} className="text-muted-foreground" />
            )}
          </button>
        </div>
        <div className="p-3 overflow-x-auto">
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">
            {input.command}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function BashResultRenderer({ content, isError }: BashResultRendererProps) {
  if (!content || content.trim().length === 0) {
    return (
      <div className="w-full mt-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border rounded-lg">
          <CheckCircle2 size={14} className="text-teal-500" />
          <span className="text-xs text-muted-foreground">
            Command completed successfully (no output)
          </span>
        </div>
      </div>
    );
  }

  const lines = content.split("\n");
  const maxLines = 30;
  const truncated = lines.length > maxLines;
  const displayLines = truncated ? lines.slice(0, maxLines) : lines;

  return (
    <div className="w-full mt-2">
      <div
        className={`border rounded-lg overflow-hidden ${
          isError
            ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30"
            : "bg-muted/30 border-border"
        }`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-2 border-b ${
            isError
              ? "border-rose-200 dark:border-rose-900/30 bg-rose-100/50 dark:bg-rose-900/20"
              : "border-border bg-muted/50"
          }`}
        >
          {isError ? (
            <>
              <AlertTriangle size={14} className="text-rose-500" />
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                Error Output
              </span>
            </>
          ) : (
            <>
              <Play size={14} className="text-teal-500" />
              <span className="text-xs font-medium">Output</span>
            </>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {lines.length} lines
          </span>
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <pre
            className={`text-xs font-mono p-3 whitespace-pre-wrap break-all ${
              isError
                ? "text-rose-700 dark:text-rose-300/80"
                : "text-foreground"
            }`}
          >
            {displayLines.join("\n")}
            {truncated && (
              <div className="text-muted-foreground mt-2 pt-2 border-t border-border">
                ... {lines.length - maxLines} more lines
              </div>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
