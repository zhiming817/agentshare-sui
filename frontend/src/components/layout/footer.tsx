import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-semibold text-base mb-2">Agent Share</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              分享、发现 AI Agent 的精彩对话。
            </p>
          </div>

          {/* Platform */}
          <div>
            <div className="text-sm font-medium mb-2">平台</div>
            <div className="space-y-1.5">
              <Link
                href="/explore"
                className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                浏览对话
              </Link>
              <Link
                href="/skills"
                className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                技能市场
              </Link>
              <Link
                href="/explore?sort=popular"
                className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                热门排行
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="text-sm font-medium mb-2">资源</div>
            <div className="space-y-1.5">
              <a
                href="https://github.com/dctongsheng/agentshare"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                API 文档
              </a>
              <Link
                href="/auth/register"
                className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                注册账号
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="text-sm font-medium mb-2">联系我们</div>
            <div className="space-y-1.5">
              <a
                href="https://github.com/dctongsheng/agentshare"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink size={13} />
                GitHub Issues
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Agent Share</span>
          <span>Built with Next.js &amp; Prisma</span>
        </div>
      </div>
    </footer>
  );
}
