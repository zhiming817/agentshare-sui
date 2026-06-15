import nacl from "tweetnacl";
import bs58 from "bs58";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// In-memory nonce store with TTL (5 minutes)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

const NONCE_TTL_MS = 5 * 60 * 1000;

export function generateNonce(walletAddress: string): string {
  const nonce = uuidv4();
  nonceStore.set(walletAddress, {
    nonce,
    expiresAt: Date.now() + NONCE_TTL_MS,
  });
  return nonce;
}

export function getStoredNonce(walletAddress: string): string | null {
  const entry = nonceStore.get(walletAddress);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    nonceStore.delete(walletAddress);
    return null;
  }
  return entry.nonce;
}

export function consumeNonce(walletAddress: string): void {
  nonceStore.delete(walletAddress);
}

export function verifySignature(
  walletAddress: string,
  message: string,
  signature: string
): boolean {
  const storedNonce = getStoredNonce(walletAddress);
  if (!storedNonce) return false;

  // The message the user signed should contain the nonce
  if (!message.includes(storedNonce)) return false;

  try {
    const publicKey = bs58.decode(walletAddress);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);
  } catch {
    return false;
  }
}

export async function findOrCreateUserByWallet(walletAddress: string) {
  // Look for existing user with this wallet
  const existing = await db.user.findFirst({
    where: { walletAddress },
  });
  if (existing) return existing;

  // Create new user with synthetic email for wallet-only accounts
  const short = walletAddress.slice(0, 8);
  const syntheticEmail = `wallet-${short}@agentshare.local`;
  const randomPasswordHash = await bcrypt.hash(
    uuidv4(),
    10
  );
  const randomApiKey = uuidv4();

  return db.user.create({
    data: {
      email: syntheticEmail,
      passwordHash: randomPasswordHash,
      apiKey: randomApiKey,
      nickname: `user_${short}`,
      walletAddress,
    },
  });
}
