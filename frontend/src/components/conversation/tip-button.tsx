"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

interface TipButtonProps {
  recipientWalletAddress: string;
  recipientNickname: string;
}

const TIP_OPTIONS = [10, 50, 100, 500];

export function TipButton({
  recipientWalletAddress,
  recipientNickname,
}: TipButtonProps) {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  async function handleTip(amount: number) {
    setError("");
    setSuccess("");

    if (!wallet.connected) {
      walletModal.setVisible(true);
      return;
    }

    setLoading(true);

    try {
      const tokenMint = process.env.NEXT_PUBLIC_AGT_MINT;
      if (!tokenMint) {
        setError("Token not configured");
        return;
      }

      const rpcUrl =
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.devnet.solana.com";
      const connection = new Connection(rpcUrl, "confirmed");
      const mintPk = new PublicKey(tokenMint);
      const senderAta = getAssociatedTokenAddressSync(mintPk, wallet.publicKey!);

      // Use the recipient's ATA (must already exist)
      const recipientPk = new PublicKey(recipientWalletAddress);
      const recipientAta = getAssociatedTokenAddressSync(mintPk, recipientPk);

      const tokenAmount = amount * Math.pow(10, 9); // 9 decimals

      const transferIx = createTransferInstruction(
        senderAta,
        recipientAta,
        wallet.publicKey!,
        tokenAmount
      );

      const transaction = new Transaction().add(transferIx);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey!;

      const signed = await wallet.signTransaction!(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      // Record on-chain transaction
      await fetch("/api/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature,
          fromAddress: wallet.publicKey!.toBase58(),
          toAddress: recipientWalletAddress,
          amount,
        }),
      });

      setSuccess(`Tipped ${amount} AGT to ${recipientNickname}!`);
    } catch (err) {
      console.error("Tip error:", err);
      setError("Tip failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const submitAmount = customAmount ? parseInt(customAmount) : 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowPanel(!showPanel)}
        className="px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
      >
        Tip AGT
      </button>

      {showPanel && (
        <div className="mt-2 p-3 rounded-lg border border-border bg-card space-y-3">
          <p className="text-xs text-muted-foreground">
            Tip {recipientNickname} with AGT tokens
          </p>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-600">{success}</p>
          )}

          <div className="grid grid-cols-4 gap-2">
            {TIP_OPTIONS.map((amount) => (
              <button
                key={amount}
                onClick={() => handleTip(amount)}
                disabled={loading}
                className="py-1.5 text-xs font-medium rounded-md border border-border hover:bg-accent transition-colors disabled:opacity-50"
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom"
              min="1"
              className="flex-1 px-2 py-1.5 text-xs border border-border rounded-md bg-background"
            />
            <button
              onClick={() => submitAmount > 0 && handleTip(submitAmount)}
              disabled={loading || submitAmount <= 0}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
