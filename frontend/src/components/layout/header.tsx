import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserMenu } from "./user-menu";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            AgentShare
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground transition-colors">
              浏览
            </Link>
            <Link href="/skills" className="hover:text-foreground transition-colors">
              技能
            </Link>
            <Link href="/token" className="hover:text-foreground transition-colors">
              代币
            </Link>
            <Link href="/roadmap" className="hover:text-foreground transition-colors">
              路线图
            </Link>
            <Link href="/pitch.html" className="hover:text-foreground transition-colors" target="_blank">
              PPT
            </Link>
          </nav>
        </div>
        {session?.user ? (
          <UserMenu
            nickname={(session.user as any).nickname || session.user.name || "User"}
            userId={(session.user as any).id}
          />
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              登录
            </Link>
            <Link
              href="/auth/register"
              className="text-sm bg-foreground text-background px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            >
              注册
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
