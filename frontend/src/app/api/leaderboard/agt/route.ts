import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTokenBalance, AGENTSHARE_TOKEN_MINT } from "@/lib/solana";

export async function GET() {
  if (!AGENTSHARE_TOKEN_MINT) {
    return NextResponse.json({ leaderboard: [] });
  }

  try {
    // Get all users with wallet addresses
    const users = await db.user.findMany({
      where: { walletAddress: { not: null } },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        walletAddress: true,
      },
      take: 50,
    });

    // Query on-chain balances in parallel
    const balancePromises = users.map(async (user: any) => {
      const balance = await getTokenBalance(user.walletAddress!);
      return {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        walletAddress: user.walletAddress!,
        agtBalance: balance,
      };
    });

    const results = await Promise.all(balancePromises);

    // Sort by AGT balance descending, filter out zero balances
    const leaderboard = results
      .filter((r: { agtBalance: number }) => r.agtBalance > 0)
      .sort((a: { agtBalance: number }, b: { agtBalance: number }) => b.agtBalance - a.agtBalance)
      .slice(0, 20);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("AGT leaderboard error:", error);
    return NextResponse.json({ leaderboard: [] });
  }
}
