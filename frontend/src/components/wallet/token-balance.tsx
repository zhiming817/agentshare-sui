"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export function TokenBalance() {
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBalance() {
      if (!wallet.publicKey) {
        setBalance(null);
        return;
      }

      const tokenMint = process.env.NEXT_PUBLIC_AGT_MINT;
      if (!tokenMint) return;

      setLoading(true);
      try {
        const rpcUrl =
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.devnet.solana.com";
        const connection = new Connection(rpcUrl);

        const mintPk = new PublicKey(tokenMint);
        const ata = getAssociatedTokenAddressSync(mintPk, wallet.publicKey);

        const tokenBalance = await connection.getTokenAccountBalance(ata);
        setBalance(
          Number(tokenBalance.value.amount) /
            Math.pow(10, tokenBalance.value.decimals)
        );
      } catch {
        setBalance(0);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [wallet.publicKey]);

  if (!wallet.connected || balance === null) return null;

  return (
    <span className="text-xs text-muted-foreground">
      {loading ? "..." : `${balance.toFixed(2)} AGT`}
    </span>
  );
}
