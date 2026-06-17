"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";

interface WalletLinkProps {
  currentWalletAddress: string | null;
  onLinked: () => void;
}

export function WalletLink({
  currentWalletAddress,
  onLinked,
}: WalletLinkProps) {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLink() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!wallet.connected) {
        walletModal.setVisible(true);
        setLoading(false);
        return;
      }

      // Get nonce
      const nonceRes = await fetch(
        `/api/auth/wallet/nonce?address=${wallet.publicKey!.toBase58()}`
      );
      const { nonce } = await nonceRes.json();

      // Sign message
      const message = `Link this wallet to your AgentShare account.\n\nNonce: ${nonce}`;
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await wallet.signMessage!(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Send to link-wallet API
      const res = await fetch("/api/settings/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet.publicKey!.toBase58(),
          signature,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Wallet linked successfully!");
        onLinked();
      } else {
        setError(data.error || "Failed to link wallet");
      }
    } catch (err) {
      console.error("Wallet link error:", err);
      setError("Failed to link wallet");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    if (!confirm("Unlink your wallet?")) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/settings/link-wallet", {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess("Wallet unlinked");
        onLinked();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to unlink wallet");
      }
    } catch {
      setError("Failed to unlink wallet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {currentWalletAddress ? (
        <div>
          <div className="flex items-center gap-2">
            <code className="bg-muted px-3 py-1.5 rounded text-xs font-mono">
              {currentWalletAddress.slice(0, 6)}...
              {currentWalletAddress.slice(-4)}
            </code>
            <button
              onClick={handleUnlink}
              disabled={loading}
              className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
              Unlink
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={handleLink}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Link Solana Wallet"}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {success && (
        <p className="mt-2 text-xs text-green-600">{success}</p>
      )}
    </div>
  );
}
