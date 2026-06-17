"use client";

import { memo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyButton } from "./tool-renderers/copy-button";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`break-words ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <div className="text-base font-semibold mt-3 mb-1.5">{children}</div>
          ),
          h2: ({ children }) => (
            <div className="text-sm font-semibold mt-3 mb-1.5">{children}</div>
          ),
          h3: ({ children }) => (
            <div className="text-[13px] font-medium mt-3 mb-1.5">{children}</div>
          ),
          p: ({ children }) => (
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap my-2">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-muted text-blue-600 dark:text-blue-400 text-[12px] font-mono">
              {children}
            </code>
          ),
          pre: (props) => {
            const node = (props as { node?: { children?: Array<{ tagName?: string; properties?: { className?: string[] }; children?: Array<{ value?: string }> }> } }).node;
            const codeNode = node?.children?.[0];

            if (codeNode?.tagName === "code") {
              const classNames = codeNode.properties?.className || [];
              const langClass = classNames.find((c) => c.startsWith("language-"));
              const language = langClass?.replace("language-", "") || "code";
              const codeContent = codeNode.children?.map((c) => c.value).join("") || "";

              return (
                <div className="relative group my-2 rounded-lg overflow-hidden border border-border">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {language}
                    </span>
                    <CopyButton text={codeContent} />
                  </div>
                  <pre className="text-xs bg-muted/30 p-3 overflow-x-auto">
                    <code>{codeContent}</code>
                  </pre>
                </div>
              );
            }

            return <pre>{props.children}</pre>;
          },
          ul: ({ children }) => (
            <ul className="my-2 ml-3 space-y-1 list-disc list-inside">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-3 space-y-1 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[13px] leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <div className="border-l-2 border-border pl-3 my-2 text-muted-foreground italic">
              {children}
            </div>
          ),
          hr: () => <hr className="border-border my-4" />,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-[13px]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border last:border-b-0">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
});
