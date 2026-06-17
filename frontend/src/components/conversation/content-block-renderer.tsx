"use client";

import { useState } from "react";
import type { ContentBlock } from "@/types/conversation";
import { sanitizeText } from "@/lib/sanitize";
import { getToolIcon, getToolPreview } from "@/lib/tool-utils";
import { MarkdownRenderer } from "./markdown-renderer";
import {
  Lightbulb,
  Wrench,
  Check,
  X,
} from "lucide-react";
import {
  TodoRenderer,
  EditRenderer,
  WriteRenderer,
  BashRenderer,
  BashResultRenderer,
  GrepRenderer,
  GlobRenderer,
  SearchResultRenderer,
  ReadRenderer,
  FileContentRenderer,
} from "./tool-renderers";

interface ContentBlockRendererProps {
  block: ContentBlock;
  isUser?: boolean;
  toolMap?: Map<string, string>;
}

function ToolInputRenderer({
  toolName,
  input,
}: {
  toolName: string;
  input: Record<string, unknown>;
}) {
  const name = toolName.toLowerCase();

  if (name === "todowrite" && input.todos) {
    return (
      <TodoRenderer
        todos={input.todos as Array<{
          content: string;
          status: "pending" | "in_progress" | "completed";
        }>}
      />
    );
  }
  if (name === "edit" && input.file_path) {
    return (
      <EditRenderer
        input={input as { file_path: string; old_string: string; new_string: string }}
      />
    );
  }
  if (name === "write" && input.file_path) {
    return (
      <WriteRenderer
        input={input as { file_path: string; content: string }}
      />
    );
  }
  if (name === "bash" && input.command) {
    return (
      <BashRenderer
        input={input as { command: string; description?: string }}
      />
    );
  }
  if (name === "grep" && input.pattern) {
    return (
      <GrepRenderer
        input={input as { pattern: string; path?: string; glob?: string; type?: string }}
      />
    );
  }
  if (name === "glob" && input.pattern) {
    return (
      <GlobRenderer
        input={input as { pattern: string; path?: string }}
      />
    );
  }
  if (name === "read" && input.file_path) {
    return (
      <ReadRenderer
        input={input as { file_path: string; offset?: number; limit?: number }}
      />
    );
  }

  return (
    <pre className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg p-3 mt-2 overflow-x-auto whitespace-pre-wrap break-all max-h-80 overflow-y-auto">
      {JSON.stringify(input, null, 2)}
    </pre>
  );
}

function ToolResultRenderer({
  toolName,
  content,
  isError,
}: {
  toolName: string;
  content: string;
  isError?: boolean;
}) {
  const name = toolName.toLowerCase();

  if (name === "bash") return <BashResultRenderer content={content} isError={isError} />;
  if (name === "glob") return <SearchResultRenderer content={content} isFileList />;
  if (name === "grep") return <SearchResultRenderer content={content} />;
  if (name === "read") return <FileContentRenderer content={content} />;

  if (!content || content.trim().length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 rounded-lg mt-2">
        <Check size={14} className="text-teal-500" />
        <span className="text-xs text-teal-600 dark:text-teal-400">
          Completed successfully
        </span>
      </div>
    );
  }

  const maxLength = 2000;
  const truncated = content.length > maxLength;
  const displayContent = truncated ? content.slice(0, maxLength) : content;

  return (
    <pre
      className={`text-xs rounded-lg p-3 mt-2 overflow-x-auto whitespace-pre-wrap break-all max-h-80 overflow-y-auto border ${
        isError
          ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300/80 border-rose-200 dark:border-rose-900/30"
          : "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-200/80 border-teal-200 dark:border-teal-900/30"
      }`}
    >
      {displayContent}
      {truncated && (
        <span className="text-muted-foreground">
          ... ({content.length - maxLength} more chars)
        </span>
      )}
    </pre>
  );
}

export function ContentBlockRenderer({
  block,
  isUser,
  toolMap,
}: ContentBlockRendererProps) {
  const [expanded, setExpanded] = useState(false);

  // Text blocks
  if (block.type === "text" && block.text) {
    const sanitized = sanitizeText(block.text);
    if (!sanitized) return null;
    if (isUser) {
      return (
        <div className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
          {sanitized}
        </div>
      );
    }
    return <MarkdownRenderer content={sanitized} />;
  }

  // Thinking blocks
  if (block.type === "thinking" && block.thinking) {
    return (
      <div className={expanded ? "w-full" : ""}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/15 text-[11px] text-amber-600 dark:text-amber-400 transition-colors border border-amber-200 dark:border-amber-500/20"
        >
          <Lightbulb size={12} className="opacity-70" />
          <span className="font-medium">thinking</span>
          <span className="text-[10px] opacity-50 ml-0.5">
            {expanded ? "▼" : "▶"}
          </span>
        </button>
        {expanded && (
          <pre className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg p-3 mt-2 whitespace-pre-wrap max-h-80 overflow-y-auto">
            {block.thinking}
          </pre>
        )}
      </div>
    );
  }

  // Tool use blocks
  if (block.type === "tool_use") {
    const input =
      block.input && typeof block.input === "object"
        ? (block.input as Record<string, unknown>)
        : undefined;
    const hasInput = input && Object.keys(input).length > 0;
    const Icon = getToolIcon(block.name || "");
    const preview = getToolPreview(block.name || "", input);
    const toolName = block.name?.toLowerCase() || "";

    const hasSpecialRenderer =
      toolName === "todowrite" ||
      toolName === "edit" ||
      toolName === "write" ||
      toolName === "bash" ||
      toolName === "grep" ||
      toolName === "glob" ||
      toolName === "read";

    const shouldAutoExpand = toolName === "todowrite";
    const isExpanded = expanded || shouldAutoExpand;

    return (
      <div className={isExpanded ? "w-full" : ""}>
        <button
          onClick={() =>
            hasInput && !shouldAutoExpand && setExpanded(!expanded)
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted text-[11px] transition-colors border border-border"
        >
          <Icon size={12} className="opacity-60" />
          <span className="font-medium">{block.name}</span>
          {preview && (
            <span className="text-muted-foreground font-normal truncate max-w-[200px]">
              {preview}
            </span>
          )}
          {hasInput && !shouldAutoExpand && (
            <span className="text-[10px] opacity-40 ml-0.5">
              {expanded ? "▼" : "▶"}
            </span>
          )}
        </button>
        {isExpanded && hasInput && hasSpecialRenderer ? (
          <ToolInputRenderer toolName={block.name || ""} input={input} />
        ) : (
          expanded &&
          hasInput && (
            <pre className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg p-3 mt-2 overflow-x-auto whitespace-pre-wrap break-all max-h-80 overflow-y-auto">
              {JSON.stringify(input, null, 2)}
            </pre>
          )
        )}
      </div>
    );
  }

  // Tool result blocks
  if (block.type === "tool_result") {
    const isError = block.is_error;
    const rawContent =
      typeof block.content === "string"
        ? block.content
        : JSON.stringify(block.content, null, 2);
    const resultContent = sanitizeText(rawContent);
    const hasContent = resultContent.length > 0;
    const previewLength = 60;
    const contentPreview =
      hasContent && !expanded
        ? resultContent.slice(0, previewLength) +
          (resultContent.length > previewLength ? "..." : "")
        : null;

    const toolName =
      block.tool_use_id && toolMap ? toolMap.get(block.tool_use_id) || "" : "";

    return (
      <div className={expanded ? "w-full" : ""}>
        <button
          onClick={() => hasContent && setExpanded(!expanded)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-colors border ${
            isError
              ? "bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
              : "bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20"
          }`}
        >
          {isError ? (
            <X size={12} className="opacity-70" />
          ) : (
            <Check size={12} className="opacity-70" />
          )}
          <span className="font-medium">{isError ? "error" : "result"}</span>
          {contentPreview && !expanded && (
            <span
              className={`font-normal truncate max-w-[200px] ${
                isError
                  ? "text-rose-400 dark:text-rose-500/70"
                  : "text-teal-400 dark:text-teal-500/70"
              }`}
            >
              {contentPreview}
            </span>
          )}
          {hasContent && (
            <span className="text-[10px] opacity-40 ml-0.5">
              {expanded ? "▼" : "▶"}
            </span>
          )}
        </button>
        {expanded && hasContent && (
          <ToolResultRenderer
            toolName={toolName}
            content={resultContent}
            isError={isError}
          />
        )}
      </div>
    );
  }

  return null;
}
