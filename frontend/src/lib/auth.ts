import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  verifySignature as verifySolanaSignature,
  consumeNonce,
  findOrCreateUserByWallet,
} from "@/lib/solana-auth";
import { verifySuiSignature } from "@/lib/sui/auth-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
        };
      },
    }),
    Credentials({
      id: "wallet",
      name: "wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
        chain: { label: "Chain", type: "text" },
      },
      async authorize(credentials) {
        const walletAddress = credentials.walletAddress as string;
        const signature = credentials.signature as string;
        const message = credentials.message as string;
        const chain = (credentials.chain as string) || "solana";

        if (!walletAddress || !signature || !message) {
          return null;
        }

        let isValid = false;
        if (chain === "sui") {
          isValid = await verifySuiSignature(walletAddress, message, signature);
        } else {
          isValid = verifySolanaSignature(walletAddress, message, signature);
        }

        if (!isValid) {
          return null;
        }

        consumeNonce(walletAddress);

        const user = await findOrCreateUserByWallet(walletAddress);

        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.nickname = user.name;
        token.email = user.email;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).nickname = token.nickname;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
});
