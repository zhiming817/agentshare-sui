"use client";

import { useState } from "react";
import { WalletLink } from "@/components/settings/wallet-link";

interface User {
  id: string;
  email: string;
  nickname: string;
  apiKey: string;
  bio: string | null;
  walletAddress: string | null;
}

export function SettingsClient({ user }: { user: User }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [apiKey, setApiKey] = useState(user.apiKey);
  const [walletAddress, setWalletAddress] = useState(
    user.walletAddress
  );

  async function regenerateApiKey() {
    if (!confirm("Are you sure? Your old API key will stop working.")) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/settings/regenerate-key", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
      }
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* Profile info */}
      <div className="border border-border rounded-lg p-6 mb-6">
        <h2 className="font-medium mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Email: </span>
            {user.email}
          </div>
          <div>
            <span className="text-muted-foreground">Nickname: </span>
            {user.nickname}
          </div>
          {user.bio && (
            <div>
              <span className="text-muted-foreground">Bio: </span>
              {user.bio}
            </div>
          )}
        </div>
      </div>

      {/* Wallet */}
      <div className="border border-border rounded-lg p-6 mb-6">
        <h2 className="font-medium mb-4">Solana Wallet</h2>
        <p className="text-muted-foreground text-sm mb-3">
          Link a Solana wallet to pay with AGT, receive tips, and unlock content.
        </p>
        <WalletLink
          currentWalletAddress={walletAddress}
          onLinked={() => window.location.reload()}
        />
      </div>

      {/* API Key */}
      <div className="border border-border rounded-lg p-6">
        <h2 className="font-medium mb-4">API Key</h2>
        <p className="text-muted-foreground text-sm mb-3">
          Use your API key to upload conversations programmatically.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono overflow-x-auto">
            {showApiKey ? apiKey : "••••••••-••••-••••-••••-•••••••••••••"}
          </code>
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            {showApiKey ? "Hide" : "Show"}
          </button>
        </div>
        <button
          onClick={regenerateApiKey}
          disabled={regenerating}
          className="mt-3 px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
        >
          {regenerating ? "Regenerating..." : "Regenerate Key"}
        </button>
      </div>
    </div>
  );
}
