"use client";

import { useState } from "react";
import { useConnectWallet, useWallets, useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SuiWalletLoginButton() {
  const router = useRouter();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWalletList, setShowWalletList] = useState(false);

  async function handleSuiLogin() {
    setError("");

    if (!currentAccount) {
      setShowWalletList(true);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Get nonce from server (using a path that we will implement or adapt)
      // Since the original used /api/auth/wallet/nonce, we'll use a similar one
      const nonceRes = await fetch(
        `/api/auth/wallet/nonce?address=${currentAccount.address}&chain=sui`
      );
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();

      // Step 2: Sign the nonce message
      const message = `Sign this message to authenticate with AgentShare.\n\nNonce: ${nonce}`;
      const messageBytes = new TextEncoder().encode(message);
      
      const { signature } = await signPersonalMessage({
        message: messageBytes,
      });

      // Step 3: Sign in via NextAuth wallet provider
      // We pass chain: "sui" so the backend knows how to verify
      const result = await signIn("wallet", {
        walletAddress: currentAccount.address,
        signature,
        message,
        chain: "sui",
        redirect: false,
      });

      if (result?.error) {
        setError("Sui wallet authentication failed: " + result.error);
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Sui wallet login error:", err);
      setError(err.message || "An error occurred during Sui wallet login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}
      
      {!currentAccount && showWalletList ? (
        <div className="grid grid-cols-1 gap-2 border border-border p-3 rounded-md bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Select Sui Wallet</p>
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => {
                connect({ wallet });
                setShowWalletList(false);
              }}
              className="flex items-center gap-2 p-2 text-sm hover:bg-accent rounded-md transition-colors border border-transparent hover:border-border"
            >
              {wallet.icon && <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />}
              <span>{wallet.name}</span>
            </button>
          ))}
          <button 
            onClick={() => setShowWalletList(false)}
            className="text-xs text-center text-muted-foreground hover:text-foreground mt-1"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSuiLogin}
          disabled={loading}
          className="w-full py-2 px-4 text-sm font-medium rounded-md border border-[#6fbcf0]/30 bg-[#6fbcf0]/10 hover:bg-[#6fbcf0]/20 text-[#3d90ce] transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            "Authenticating..."
          ) : currentAccount ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Sign in: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SuiIcon className="w-4 h-4" />
              <span>Connect Sui Wallet</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}

function SuiIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="currentColor" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 88c-20.9 0-38-17.1-38-38s17.1-38 38-38 38 17.1 38 38-17.1 38-38 38z"/>
      <path d="M68.5 31.5c-1.2-1.2-3.1-1.2-4.2 0L50 45.8 35.7 31.5c-1.2-1.2-3.1-1.2-4.2 0s-1.2 3.1 0 4.2L45.8 50l-14.3 14.3c-1.2 1.2-1.2 3.1 0 4.2s3.1 1.2 4.2 0L50 54.2l14.3 14.3c1.2 1.2 3.1 1.2 4.2 0s1.2-3.1 0-4.2L54.2 50l14.3-14.3c1.2-1.2 1.2-3.1 0-4.2z"/>
    </svg>
  );
}
