"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  targetType: "conversation" | "skill";
  targetId: string;
  confirmMessage?: string;
}

export function DeleteButton({
  targetType,
  targetId,
  confirmMessage,
}: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const defaultMessage =
    targetType === "conversation"
      ? "确定要删除这个对话吗？此操作不可撤销。"
      : "确定要删除这个技能吗？此操作不可撤销。";

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(confirmMessage ?? defaultMessage)) return;
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/${targetType}s/${targetId}/delete`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "删除失败");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
      title="删除"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
