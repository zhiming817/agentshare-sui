"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UploadClientProps {
  apiKey: string;
}

const SOURCE_TYPES = [
  { value: "claude-code", label: "Claude Code (.jsonl)" },
  { value: "openai", label: "OpenAI Chat Export (.json)" },
  { value: "jsonl", label: "Generic JSONL" },
  { value: "cursor", label: "Cursor (.json)" },
  { value: "trae", label: "Trae (.json)" },
  { value: "windsurf", label: "Windsurf (.json)" },
  { value: "aider", label: "Aider (.json)" },
  { value: "copilot", label: "Github Copilot (.json)" },
  { value: "cline", label: "Cline (.json)" },
];

export function UploadClient({ apiKey }: UploadClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState("claude-code");
  const [price, setPrice] = useState("0");
  const [tags, setTags] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title || !sourceType) {
      setError("Please fill in file, title and source type.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("source_type", sourceType);
    formData.append("price", price);
    formData.append("tags", tags);

    try {
      const res = await fetch("/api/upload/conversation", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      router.push(`/conversation/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">标题 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="例如: Next.js + Tailwind 开发会话"
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">来源类型 *</label>
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          required
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        >
          {SOURCE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">文件 (JSON/JSONL) *</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-3 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-muted-foreground">
                {file ? (
                  <span className="font-semibold text-foreground">{file.name}</span>
                ) : (
                  <span>点击或拖拽文件上传</span>
                )}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".json,.jsonl"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="简要描述此会话的内容"
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">价格 (AGT)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">标签 (英文逗号分隔)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="typescript, rust, web3"
            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "正在上传..." : "上传会话"}
        </Button>
      </div>
    </form>
  );
}
