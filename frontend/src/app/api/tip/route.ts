import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { signature, fromAddress, toAddress, amount } = body;

    if (!signature || !fromAddress || !toAddress || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tokenMint = process.env.AGENTSHARE_TOKEN_MINT || "";

    await db.onChainTransaction.create({
      data: {
        signature,
        fromAddress,
        toAddress,
        mintAddress: tokenMint,
        amount: BigInt(amount * 1e9),
        platformFee: BigInt(0),
        type: "tip",
        status: "confirmed",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tip record error:", error);
    return NextResponse.json(
      { error: "Failed to record tip" },
      { status: 500 }
    );
  }
}
