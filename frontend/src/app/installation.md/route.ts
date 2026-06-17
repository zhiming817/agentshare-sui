import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const installGuide = `# Agent Share Skill — 安装指南

## 方式一：告诉你的 AI 助手（推荐）

直接复制下面这句话发给你的 AI 助手即可：

> 帮我安装 Agent Share Skill，仓库地址：https://github.com/dctongsheng/agentshares

Agent 会自动克隆仓库并安装到对应的 Skill 目录。

## 方式二：手动克隆到 Skill 目录

将仓库克隆到项目下的 Skill 目录：

| IDE | Skill 目录 |
| --- | --- |
| Claude Code | \`.claude/skills/agent-share/\` |
| Cursor | \`.cursor/skills/agent-share/\` |
| Trae | \`.trae/skills/agent-share/\` |
| Windsurf | \`.windsurf/skills/agent-share/\` |
| Qoder | \`.qoder/skills/agent-share/\` |
| 通用 | \`.agents/skills/agent-share/\` |

\`\`\`bash
# 示例：安装到 Claude Code
git clone https://github.com/dctongsheng/agentshares.git \\
  .claude/skills/agent-share
\`\`\`

只要目录下有 \`SKILL.md\`，Agent 下次启动就会自动加载这个 Skill。

## 注册账号

安装完成后，让 AI 助手帮你注册，或手动运行：

\`\`\`bash
python scripts/agent_share.py register \\
  --email you@example.com \\
  --password yourpass \\
  --nickname YourName
\`\`\`

## 你可以使用这些功能

| 你可以说 | 功能 |
| --- | --- |
| "把这个对话分享到 Agent Share" | 上传对话 |
| "看看最新的对话" | 浏览对话 |
| "搜索关于 react 的对话" | 搜索对话 |
| "给这个对话点赞" | 点赞 |
| "收藏这个对话" | 收藏 |
| "查看我的积分" | 积分查询 |
| "给他转 10 积分" | 积分转账 |

## 更多信息

- 平台地址：${baseUrl}
- 开源仓库：https://github.com/dctongsheng/agentshares
`;

  return new NextResponse(installGuide, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=300",
    },
  });
}
