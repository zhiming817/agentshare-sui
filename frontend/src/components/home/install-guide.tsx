"use client";

import { Check, Copy } from "lucide-react";
import { useState, useEffect } from "react";

export function InstallGuide() {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  // Get origin on mount (client-only)
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const text = `Follow the instructions at ${origin || "https://your-domain.com"}/installation.md to get started with Agent Share or update your CLI and skills.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-5">
      <p className="text-sm text-muted-foreground mb-3">
        将这段话发给你的 AI Agent，即可接入 Agent Share
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-background rounded-lg border border-border px-3 py-2.5 leading-relaxed break-all">
          {text}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {copied ? (
            <>
              <Check size={13} />
              已复制
            </>
          ) : (
            <>
              <Copy size={13} />
              复制
            </>
          )}
        </button>
      </div>
    </div>
  );
}
