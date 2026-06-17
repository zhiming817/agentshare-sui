"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";

export default function FaucetPage() {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [claimInfo, setClaimInfo] = useState<{
    claimed: boolean;
    amount: number;
    claimedAt: string | null;
  } | null>(null);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchClaimStatus();
    }
  }, [wallet.publicKey]);

  async function fetchClaimStatus() {
    if (!wallet.publicKey) return;
    try {
      const res = await fetch(
        `/api/faucet?address=${wallet.publicKey.toBase58()}`
      );
      if (res.ok) {
        const data = await res.json();
        setClaimInfo(data);
      }
    } catch {
      // ignore
    }
  }

  async function handleClaim() {
    if (!wallet.connected) {
      walletModal.setVisible(true);
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet.publicKey!.toBase58(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Successfully claimed ${data.amount} AGT!`);
        setClaimInfo({ claimed: true, amount: data.amount, claimedAt: new Date().toISOString() });
      } else {
        setError(data.error || "Failed to claim");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-4">
              AGT
            </div>
            <h1 className="text-2xl font-semibold">AGT Faucet</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Claim free AgentShare Token (AGT) on Solana devnet.
              <br />
              Each wallet can claim once.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:bg-green-950/20 dark:border-green-900 dark:text-green-400">
              {success}
            </div>
          )}

          {claimInfo?.claimed ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  You have already claimed
                </p>
                <p className="text-2xl font-bold mt-1">
                  {claimInfo.amount} AGT
                </p>
                {claimInfo.claimedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Claimed at{" "}
                    {new Date(claimInfo.claimedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Use AGT to unlock paid content, tip authors, and more.
              </p>
              <a
                href="/explore"
                className="inline-block mt-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Browse Conversations
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">You will receive</p>
                <p className="text-3xl font-bold mt-1">1,000 AGT</p>
              </div>

              {!wallet.connected ? (
                <button
                  onClick={() => walletModal.setVisible(true)}
                  className="w-full py-2 px-4 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors"
                >
                  Connect Wallet First
                </button>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={loading}
                  className="w-full py-2 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Claiming..." : "Claim 1,000 AGT"}
                </button>
              )}

              {wallet.connected && (
                <p className="text-xs text-muted-foreground">
                  Wallet: {wallet.publicKey?.toBase58().slice(0, 8)}...
                  {wallet.publicKey?.toBase58().slice(-4)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
