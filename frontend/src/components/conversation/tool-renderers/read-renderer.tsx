"use client";

import { FileText, FileCode } from "lucide-react";
import { CopyButton } from "./copy-button";

interface ReadInput {
  file_path: string;
  offset?: number;
  limit?: number;
}

function getFileName(filePath: string) {
  return filePath.split("/").slice(-2).join("/");
}

export function ReadRenderer({ input }: { input: ReadInput }) {
  if (!input?.file_path) return null;

  const fileName = getFileName(input.file_path);

  return (
    <div className="w-full mt-2">
      <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
          <FileCode size={14} className="text-sky-500" />
          <span className="text-xs font-mono">{fileName}</span>
          <div className="flex items-center gap-1 ml-auto">
            {(input.offset || input.limit) && (
              <span className="text-xs text-muted-foreground mr-1">
                {input.offset && `from line ${input.offset}`}
                {input.offset && input.limit && ", "}
                {input.limit && `${input.limit} lines`}
              </span>
            )}
            <CopyButton text={input.file_path} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FileContentRenderer({
  content,
  fileName,
}: {
  content: string;
  fileName?: string;
}) {
  if (!content) return null;

  const lines = content.split("\n");
  const maxLines = 50;
  const truncated = lines.length > maxLines;
  const displayLines = truncated ? lines.slice(0, maxLines) : lines;

  return (
    <div className="w-full mt-2">
      <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
          <FileText size={14} className="text-sky-500" />
          <span className="text-xs font-medium">File Content</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {lines.length} lines
          </span>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs font-mono">
            <tbody>
              {displayLines.map((line, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="select-none text-right pr-3 pl-3 py-0.5 text-muted-foreground border-r border-border w-10 sticky left-0 bg-background">
                    {index + 1}
                  </td>
                  <td className="pl-3 pr-3 py-0.5 whitespace-pre">
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {truncated && (
            <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
              ... {lines.length - maxLines} more lines
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
