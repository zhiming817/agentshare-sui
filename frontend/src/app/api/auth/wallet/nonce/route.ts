import { NextRequest, NextResponse } from "next/server";
import { generateNonce } from "@/lib/solana-auth";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json(
      { error: "Missing address parameter" },
      { status: 400 }
    );
  }

  const nonce = generateNonce(address);
  return NextResponse.json({ nonce });
}
