"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import bs58 from "bs58";

export function WalletLoginButton() {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleWalletLogin() {
    setError("");

    // If no wallet is connected, open the wallet selection modal first
    if (!wallet.connected) {
      walletModal.setVisible(true);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Get nonce from server
      const nonceRes = await fetch(
        `/api/auth/wallet/nonce?address=${wallet.publicKey!.toBase58()}`
      );
      const { nonce } = await nonceRes.json();

      // Step 2: Sign the nonce message
      const message = `Sign this message to authenticate with AgentShare.\n\nNonce: ${nonce}`;
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await wallet.signMessage!(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Step 3: Sign in via NextAuth wallet provider
      const result = await signIn("wallet", {
        walletAddress: wallet.publicKey!.toBase58(),
        signature,
        message,
        redirect: false,
      });

      if (result?.error) {
        setError("Wallet authentication failed");
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error("Wallet login error:", err);
      setError("An error occurred during wallet login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleWalletLogin}
        disabled={loading}
        className="w-full py-2 px-4 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          "Authenticating..."
        ) : wallet.connected ? (
          `Sign in with ${wallet.publicKey?.toBase58().slice(0, 4)}...${wallet.publicKey?.toBase58().slice(-4)}`
        ) : (
          "Connect Solana Wallet"
        )}
      </button>
    </div>
  );
}
