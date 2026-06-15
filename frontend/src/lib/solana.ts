import {
  Connection,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

let _connection: Connection | null = null;

export function getSolanaConnection(): Connection {
  if (!_connection) {
    const rpcUrl =
      process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
    _connection = new Connection(rpcUrl, "confirmed");
  }
  return _connection;
}

export const PLATFORM_TREASURY = process.env.PLATFORM_TREASURY_WALLET || "";
export const AGENTSHARE_TOKEN_MINT =
  process.env.AGENTSHARE_TOKEN_MINT || "";

export interface VerifyResult {
  valid: boolean;
  fromAddress: string;
  toAddress: string;
  amount: number; // in token smallest unit (lamports for SOL, raw units for SPL)
}

/**
 * Verify an on-chain transaction.
 * Supports both SOL and SPL Token transfers.
 */
export async function verifyTransaction(
  signature: string,
  expectedFrom?: string,
  expectedTo?: string,
  expectedMinAmount?: number // in raw units (lamports for SOL, smallest unit for token)
): Promise<VerifyResult> {
  const connection = getSolanaConnection();

  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx || !tx.meta || tx.meta.err) {
    return { valid: false, fromAddress: "", toAddress: "", amount: 0 };
  }

  const { meta } = tx;

  // Try SPL Token verification first (check preTokenBalances / postTokenBalances)
  if (meta.preTokenBalances && meta.postTokenBalances && meta.preTokenBalances.length > 0) {
    let fromAddress = "";
    let toAddress = "";
    let amount = 0;
    let maxReceive = 0;

    for (const postBal of meta.postTokenBalances) {
      const preBal = meta.preTokenBalances.find(
        (pre) => pre.accountIndex === postBal.accountIndex
      );
      const preAmount = preBal ? Number(preBal.uiTokenAmount?.amount ?? "0") : 0;
      const postAmount = Number(postBal.uiTokenAmount?.amount ?? "0");
      const diff = postAmount - preAmount;

      // Prefer preBal.owner (more reliable for sender), fall back to postBal.owner
      const owner = preBal?.owner || postBal.owner || "";

      if (diff < 0) {
        // Sender — use absolute value as total amount sent
        fromAddress = owner;
        amount = Math.abs(diff);
      } else if (diff > 0 && diff > maxReceive) {
        // Primary receiver (largest gain) — e.g. creator gets 95%
        toAddress = owner;
        maxReceive = diff;
      }
    }

    console.log("[verifyTransaction] SPL token:", { fromAddress, toAddress, amount, expectedFrom, expectedMinAmount });

    const valid =
      !!fromAddress &&
      amount > 0 &&
      (!expectedFrom || fromAddress === expectedFrom) &&
      (!expectedTo || toAddress === expectedTo) &&
      (!expectedMinAmount || amount >= expectedMinAmount);

    return { valid, fromAddress, toAddress, amount };
  }

  // Fallback: SOL transfer verification
  const accountKeys = tx.transaction.message.staticAccountKeys;
  let fromAddress = "";
  let toAddress = "";
  let amount = 0;

  for (let i = 0; i < accountKeys.length; i++) {
    const diff = meta.preBalances[i] - meta.postBalances[i];
    if (diff > 5000) {
      fromAddress = accountKeys[i].toBase58();
      amount = diff;
    }
    const gain = meta.postBalances[i] - meta.preBalances[i];
    if (gain > 5000) {
      toAddress = accountKeys[i].toBase58();
    }
  }

  const valid =
    !!fromAddress &&
    amount > 0 &&
    (!expectedFrom || fromAddress === expectedFrom) &&
    (!expectedTo || toAddress === expectedTo) &&
    (!expectedMinAmount || amount >= expectedMinAmount);

  return { valid, fromAddress, toAddress, amount };
}

/**
 * Get SPL token balance for a wallet.
 */
export async function getTokenBalance(
  walletAddress: string,
  mintAddress?: string
): Promise<number> {
  const connection = getSolanaConnection();
  const mint = mintAddress || AGENTSHARE_TOKEN_MINT;
  if (!mint) return 0;

  try {
    const mintPk = new PublicKey(mint);
    const walletPk = new PublicKey(walletAddress);

    const { getAssociatedTokenAddressSync } = await import(
      "@solana/spl-token"
    );
    const ata = getAssociatedTokenAddressSync(mintPk, walletPk);

    const balance = await connection.getTokenAccountBalance(ata);
    return Number(balance.value.amount) / Math.pow(10, balance.value.decimals);
  } catch {
    return 0;
  }
}
