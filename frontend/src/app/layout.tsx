import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { SuiProvider } from "@/components/providers/sui-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentShare - Agent Task Visualization Platform",
  description: "Share and visualize successful agent task executions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <SuiProvider>
          <WalletProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </WalletProvider>
        </SuiProvider>
      </body>
    </html>
  );
}
