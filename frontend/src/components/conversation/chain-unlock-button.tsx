"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

interface ChainUnlockButtonProps {
  conversationId: string;
  price: number; // Price in AGT tokens
  authorWalletAddress?: string;
  onSuccess: () => void;
}

export function ChainUnlockButton({
  conversationId,
  price,
  authorWalletAddress,
  onSuccess,
}: ChainUnlockButtonProps) {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"sol" | "token">("sol");

  async function handleUnlock() {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    if (!authorWalletAddress) {
      setError("Author has not linked a wallet yet. Unable to pay on-chain.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const rpcUrl =
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.devnet.solana.com";
      const connection = new Connection(rpcUrl, "confirmed");

      const treasuryAddress = process.env.NEXT_PUBLIC_PLATFORM_TREASURY;
      const tokenMint = process.env.NEXT_PUBLIC_AGT_MINT;
      const TOKEN_DECIMALS = 9;

      // For SOL: price * 1e9 lamports. For Token: price * 1e9 raw units (9 decimals)
      const amount = BigInt(price) * BigInt(Math.pow(10, TOKEN_DECIMALS));
      const platformFee = (amount * BigInt(5)) / BigInt(100); // 5%
      const creatorAmount = amount - platformFee;

      const transaction = new Transaction();

      if (paymentMethod === "sol") {
        const FIXED_SOL = 10_000_000; // 0.01 SOL
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(authorWalletAddress),
            lamports: FIXED_SOL,
          })
        );
      } else {
        // Token transfer
        if (!tokenMint) {
          setError("Token not configured");
          return;
        }

        const mintPk = new PublicKey(tokenMint);
        const senderAta = getAssociatedTokenAddressSync(
          mintPk,
          wallet.publicKey
        );
        const creatorAta = getAssociatedTokenAddressSync(
          mintPk,
          new PublicKey(authorWalletAddress)
        );

        transaction.add(
          createTransferInstruction(
            senderAta,
            creatorAta,
            wallet.publicKey,
            Number(creatorAmount)
          )
        );

        if (treasuryAddress) {
          const treasuryAta = getAssociatedTokenAddressSync(
            mintPk,
            new PublicKey(treasuryAddress)
          );
          transaction.add(
            createTransferInstruction(
              senderAta,
              treasuryAta,
              wallet.publicKey,
              Number(platformFee)
            )
          );
        }
      }

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signed.serialize()
      );

      // Wait for confirmation — "already processed" means it succeeded
      try {
        await connection.confirmTransaction(signature, "confirmed");
      } catch (confirmErr: any) {
        const msg = confirmErr?.message || "";
        if (!msg.includes("already been processed") && !msg.includes("already processed")) {
          throw confirmErr; // Re-throw real errors
        }
        // "already processed" = transaction succeeded, just already in a block
      }

      // Verify with server (always attempt if we have a signature)
      const res = await fetch(`/api/conversations/${conversationId}/unlock-chain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txSignature: signature, paymentMethod }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Server verification failed");
      }
    } catch (err: any) {
      console.error("Chain unlock error:", err);
      setError(err?.message || err?.toString() || "Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("sol")}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md border transition-colors ${
            paymentMethod === "sol"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          Pay with SOL
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("token")}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md border transition-colors ${
            paymentMethod === "token"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          Pay with AGT
        </button>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <button
        type="button"
        onClick={handleUnlock}
        disabled={loading || !wallet.connected}
        className="w-full py-2 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading
          ? "Processing..."
          : !wallet.connected
          ? "Connect Wallet to Pay"
          : `Pay ${paymentMethod === "sol" ? "0.01 SOL" : `${price} AGT`}`}
      </button>
    </div>
  );
}
