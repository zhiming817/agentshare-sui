import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyTransaction, PLATFORM_TREASURY } from "@/lib/solana";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { txSignature, paymentMethod } = body;

    if (!txSignature || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing txSignature or paymentMethod" },
        { status: 400 }
      );
    }

    if (!["sol", "token"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid paymentMethod. Use 'sol' or 'token'" },
        { status: 400 }
      );
    }

    // Get conversation details
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: { select: { id: true, walletAddress: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.price === 0) {
      return NextResponse.json(
        { error: "This conversation is free" },
        { status: 400 }
      );
    }

    // Check if already unlocked
    const existing = await db.unlock.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already unlocked" }, { status: 400 });
    }

    // Get user's wallet address
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { walletAddress: true },
    });

    if (!user?.walletAddress) {
      return NextResponse.json(
        { error: "No wallet linked to account" },
        { status: 400 }
      );
    }

    // Verify the on-chain transaction
    // For token payments: price is in AGT, expected amount in raw units (price * 1e9)
    // For SOL payments: price is treated as SOL amount, expected in lamports
    const TOKEN_DECIMALS = 9;
    const expectedRawAmount = conversation.price * Math.pow(10, TOKEN_DECIMALS);
    const minAmount = Math.floor(expectedRawAmount * 0.9); // Allow 10% tolerance
    const result = await verifyTransaction(
      txSignature,
      user.walletAddress, // sender must be the logged-in user's wallet
      undefined, // accept any destination
      minAmount
    );

    if (!result.valid) {
      return NextResponse.json(
        { error: "Transaction verification failed" },
        { status: 400 }
      );
    }

    // Create unlock and on-chain transaction records
    await db.$transaction(async (tx: any) => {
      await tx.unlock.create({
        data: {
          userId: (session.user as any).id,
          conversationId,
          amountSpent: 0,
          paymentMethod,
          txSignature,
        },
      });

      await tx.onChainTransaction.create({
        data: {
          signature: txSignature,
          fromAddress: result.fromAddress,
          toAddress: result.toAddress,
          amount: BigInt(result.amount),
          platformFee: BigInt(Math.floor(result.amount * 0.05)),
          type: "unlock",
          conversationId,
          status: "confirmed",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chain unlock error:", error);
    return NextResponse.json(
      { error: "Failed to process unlock" },
      { status: 500 }
    );
  }
}
