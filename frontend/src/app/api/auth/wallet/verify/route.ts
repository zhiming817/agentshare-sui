import { NextRequest, NextResponse } from "next/server";
import {
  verifySignature,
  consumeNonce,
  findOrCreateUserByWallet,
} from "@/lib/solana-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, message } = body;

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isValid = verifySignature(walletAddress, message, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    consumeNonce(walletAddress);

    const user = await findOrCreateUserByWallet(walletAddress);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error("Wallet verify error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
