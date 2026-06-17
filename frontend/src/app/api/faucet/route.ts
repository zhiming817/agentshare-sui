import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const FAUCET_AMOUNT = 1000; // AGT tokens
const TOKEN_DECIMALS = 9;

function getTreasuryKeypair(): Keypair {
  const keypairPath = path.join(process.cwd(), ".env.keypair");
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }

    // Check if already claimed
    const existing = await db.faucetClaim.findUnique({
      where: { walletAddress },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Already claimed. Each wallet can only claim once." },
        { status: 400 }
      );
    }

    const mintAddress = process.env.AGENTSHARE_TOKEN_MINT;
    if (!mintAddress) {
      return NextResponse.json(
        { error: "Token not configured" },
        { status: 500 }
      );
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");
    const treasury = getTreasuryKeypair();
    const mintPk = new PublicKey(mintAddress);
    const recipientPk = new PublicKey(walletAddress);

    // Get or create recipient's ATA
    const recipientAta = await getOrCreateAssociatedTokenAccount(
      connection,
      treasury,
      mintPk,
      recipientPk
    );

    // Transfer tokens
    const amount = FAUCET_AMOUNT * Math.pow(10, TOKEN_DECIMALS);
    const transferIx = createTransferInstruction(
      getAssociatedTokenAddressSync(mintPk, treasury.publicKey),
      recipientAta.address,
      treasury.publicKey,
      amount
    );

    const transaction = new Transaction().add(transferIx);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = treasury.publicKey;

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasury]
    );

    // Record the claim
    await db.faucetClaim.create({
      data: {
        walletAddress,
        userId: (session.user as any).id,
        amount: FAUCET_AMOUNT,
      },
    });

    return NextResponse.json({
      success: true,
      amount: FAUCET_AMOUNT,
      signature,
    });
  } catch (error) {
    console.error("Faucet error:", error);
    return NextResponse.json(
      { error: "Failed to claim tokens" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ claimed: false });
  }

  const existing = await db.faucetClaim.findUnique({
    where: { walletAddress: address },
  });

  return NextResponse.json({
    claimed: !!existing,
    amount: existing?.amount ?? 0,
    claimedAt: existing?.createdAt?.toISOString() ?? null,
  });
}
