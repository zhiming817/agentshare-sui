"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatar: string | null;
  walletAddress: string;
  agtBalance: number;
}

export function AgtLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard/agt");
        if (res.ok) {
          const data = await res.json();
          setEntries(data.leaderboard);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Coins size={14} className="text-purple-600" />
          AGT Leaderboard
        </h3>
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Coins size={14} className="text-purple-600" />
          AGT Leaderboard
        </h3>
        <p className="text-xs text-muted-foreground">
          No AGT holders yet.{" "}
          <Link href="/faucet" className="text-purple-600 hover:underline">
            Claim AGT
          </Link>{" "}
          to be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Coins size={14} className="text-purple-600" />
        AGT Leaderboard
      </h3>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-5 text-xs font-bold ${
                  index === 0
                    ? "text-yellow-500"
                    : index === 1
                    ? "text-gray-400"
                    : index === 2
                    ? "text-amber-600"
                    : "text-muted-foreground"
                }`}
              >
                {index + 1}
              </span>
              <Link
                href={`/user/${entry.id}`}
                className="hover:underline flex items-center gap-1.5"
              >
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                    {entry.nickname[0]?.toUpperCase()}
                  </span>
                )}
                <span className="text-xs">{entry.nickname}</span>
              </Link>
            </div>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 tabular-nums">
              {entry.agtBalance.toFixed(0)} AGT
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
