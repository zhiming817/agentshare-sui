import { verifyPersonalMessageSignature } from "@mysten/sui/verify";

export async function verifySuiSignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    
    // verifyPersonalMessageSignature returns the parsed public key if successful
    const publicKey = await verifyPersonalMessageSignature(messageBytes, signature);
    
    // and we should check if the public key matches the address
    return publicKey.toSuiAddress() === address;
  } catch (error) {
    console.error("Sui signature verification failed:", error);
    return false;
  }
}
