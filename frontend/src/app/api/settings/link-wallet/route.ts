import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifySignature, consumeNonce } from "@/lib/solana-auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { walletAddress, signature, message } = body;

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifySignature(walletAddress, message, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Check if wallet is already linked to another account
    const existing = await db.user.findFirst({
      where: { walletAddress },
    });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Wallet already linked to another account" },
        { status: 400 }
      );
    }

    consumeNonce(walletAddress);

    await db.user.update({
      where: { id: session.user.id },
      data: { walletAddress },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Link wallet error:", error);
    return NextResponse.json(
      { error: "Failed to link wallet" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { walletAddress: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unlink wallet error:", error);
    return NextResponse.json(
      { error: "Failed to unlink wallet" },
      { status: 500 }
    );
  }
}
