import { NextRequest, NextResponse } from "next/server";
import { getTokenBalance } from "@/lib/solana";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { walletAddress: true },
  });

  if (!user?.walletAddress) {
    return NextResponse.json({ balance: 0, walletAddress: null });
  }

  const balance = await getTokenBalance(user.walletAddress);

  return NextResponse.json({
    balance,
    walletAddress: user.walletAddress,
  });
}
