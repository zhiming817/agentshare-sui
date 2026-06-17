import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { redactSensitiveInfo } from "@/lib/sanitize";
import { parseJsonl } from "@/lib/parsers/jsonl-parser";
import { parseOpenai } from "@/lib/parsers/openai-parser";
import { ParsedConversationV2, UploadSkill, UploadEnvironment } from "@/types/conversation";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = rateLimit(`upload:${ip}`, {
      limit: 10,
      windowMs: 60_000,
    });
    if (!success) {
      return NextResponse.json(
        { error: "Too many upload requests. Please try again later." },
        { status: 429 }
      );
    }

    // Authenticate via API key
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { apiKey } });
    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const price = parseInt(formData.get("price") as string) || 0;
    const tagsStr = (formData.get("tags") as string) || "";
    const skillsStr = formData.get("skills") as string | null;
    const envStr = formData.get("environment") as string | null;
    const sourceType = formData.get("source_type") as string;

    if (!file || !title || !sourceType) {
      return NextResponse.json(
        { error: "file, title, and source_type are required" },
        { status: 400 }
      );
    }

    const rawContent = redactSensitiveInfo(await file.text());
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Select parser based on source_type
    let parsed: ParsedConversationV2;
    if (sourceType === "claude-code" || sourceType === "jsonl") {
      parsed = parseJsonl(rawContent);
    } else {
      // openai, openclaw, trae, cursor, windsurf, aider, copilot, cline, etc.
      parsed = parseOpenai(rawContent);
    }

    if (parsed.messages.length === 0) {
      return NextResponse.json(
        { error: "No messages found in the uploaded file" },
        { status: 400 }
      );
    }

    // Parse skills
    let skills: UploadSkill[] = [];
    if (skillsStr) {
      try {
        skills = JSON.parse(skillsStr);
      } catch {
        return NextResponse.json(
          { error: "Invalid skills JSON" },
          { status: 400 }
        );
      }
    }

    // Parse environment
    let env: UploadEnvironment | null = null;
    if (envStr) {
      try {
        env = JSON.parse(envStr);
      } catch {
        return NextResponse.json(
          { error: "Invalid environment JSON" },
          { status: 400 }
        );
      }
    }

    // Store conversation with raw content only (no Message rows)
    const conversation = await db.conversation.create({
      data: {
        userId: user.id,
        title,
        description: description || parsed.summary || null,
        rawContent,
        sourceType,
        price,
        tags,
        messageCount: parsed.messages.length,
        environment: env
          ? {
              create: {
                os: env.os,
                containerInfo: env.containerInfo,
                gpu: env.gpu,
                runtimeInfo: env.runtimeInfo,
              },
            }
          : undefined,
        skills: skills.length > 0
          ? {
              create: skills.map((skill) => ({
                skill: {
                  create: {
                    userId: user.id,
                    name: skill.name,
                    description: skill.description,
                    content: skill.content,
                  },
                },
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json(
      {
        id: conversation.id,
        title: conversation.title,
        messageCount: parsed.messages.length,
        skillCount: skills.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
