"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Coins } from "lucide-react";

interface UserMenuProps {
  nickname: string;
  userId: string;
}

export function UserMenu({ nickname, userId }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [agtBalance, setAgtBalance] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    async function fetchAgtBalance() {
      try {
        const res = await fetch("/api/wallet/token-balance");
        if (res.ok) {
          const data = await res.json();
          if (data.balance > 0) {
            setAgtBalance(data.balance);
          }
        }
      } catch {
        // ignore
      }
    }
    fetchAgtBalance();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm hover:text-foreground transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
          {nickname[0]?.toUpperCase()}
        </span>
        <span>{nickname}</span>
        {agtBalance !== null && (
          <span className="flex items-center gap-0.5 text-xs text-purple-600 dark:text-purple-400">
            <Coins size={12} />
            {agtBalance.toFixed(0)} AGT
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-sm py-1 z-50">
          <Link
            href={`/user/${userId}`}
            className="block px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={() => setOpen(false)}
          >
            我的主页
          </Link>
          <Link
            href="/settings"
            className="block px-3 py-2 text-sm hover:bg-muted transition-colors"
            onClick={() => setOpen(false)}
          >
            设置
          </Link>
          <Link
            href="/faucet"
            className="block px-3 py-2 text-sm hover:bg-muted transition-colors text-purple-600 dark:text-purple-400"
            onClick={() => setOpen(false)}
          >
            Claim AGT
          </Link>
          <hr className="my-1 border-border" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
