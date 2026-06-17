import "dotenv/config";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createPrismaClient } from "../src/lib/prisma-factory";

const prisma = createPrismaClient();

async function main() {
  const passwordHash = await hash("password123", 12);
  const apiKey1 = uuidv4();
  const apiKey2 = uuidv4();

  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash,
      apiKey: apiKey1,
      nickname: "Alice",
      bio: "Agent enthusiast & developer",
      credits: 100,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash,
      apiKey: apiKey2,
      nickname: "Bob",
      bio: "Full-stack developer",
      credits: 100,
    },
  });

  // Sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId: user1.id,
      title: "Building a REST API with Claude Code",
      description:
        "Successfully built a complete REST API using Express.js with authentication and database integration.",
      rawContent: "",
      sourceType: "json",
      price: 10,
      tags: ["api", "express", "authentication"],
      messages: {
        create: [
          {
            sequence: 1,
            role: "user",
            content: "Help me build a REST API with Express.js that has user authentication.",
            timestamp: new Date("2026-03-30T10:00:00Z"),
          },
          {
            sequence: 2,
            role: "assistant",
            content:
              "I'll help you build a REST API with Express.js and JWT authentication. Let me start by setting up the project structure.",
            timestamp: new Date("2026-03-30T10:00:05Z"),
          },
          {
            sequence: 3,
            role: "tool",
            content: "Created project structure with src/routes, src/middleware, src/models directories.",
            toolCalls: {
              name: "create_file",
              arguments: { path: "src/routes/auth.ts", content: "// Auth routes" },
            },
            timestamp: new Date("2026-03-30T10:00:10Z"),
          },
          {
            sequence: 4,
            role: "assistant",
            content:
              "I've created the basic project structure. Now let me implement the authentication middleware and user routes.",
            timestamp: new Date("2026-03-30T10:00:15Z"),
          },
          {
            sequence: 5,
            role: "user",
            content: "Great, please add JWT token generation and validation.",
            timestamp: new Date("2026-03-30T10:01:00Z"),
          },
          {
            sequence: 6,
            role: "assistant",
            content:
              "```typescript\nimport jwt from 'jsonwebtoken';\n\nexport function generateToken(userId: string): string {\n  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });\n}\n\nexport function verifyToken(token: string): { userId: string } {\n  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };\n}\n```\n\nI've added JWT token generation and validation. The token expires in 7 days.",
            timestamp: new Date("2026-03-30T10:01:10Z"),
          },
        ],
      },
      environment: {
        create: {
          os: "macOS 15.4",
          containerInfo: "Docker Desktop 4.30",
          gpu: null,
          runtimeInfo: "Node.js 22.x, npm 10.x",
        },
      },
    },
  });

  // Sample skill
  const skill = await prisma.skill.create({
    data: {
      userId: user1.id,
      name: "express-api-builder",
      description: "Build REST APIs with Express.js following best practices",
      content:
        "You are an expert at building REST APIs with Express.js. Always follow RESTful conventions, include proper error handling, and use middleware for cross-cutting concerns.",
      likeCount: 5,
    },
  });

  await prisma.conversationSkill.create({
    data: {
      conversationId: conversation.id,
      skillId: skill.id,
    },
  });

  // Sample follow
  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  // Sample interaction (bookmark)
  await prisma.interaction.create({
    data: {
      userId: user2.id,
      targetType: "conversation",
      targetId: conversation.id,
      action: "bookmark",
    },
  });

  // Sample interaction (like on skill)
  await prisma.interaction.create({
    data: {
      userId: user2.id,
      targetType: "skill",
      targetId: skill.id,
      action: "like",
    },
  });

  console.log("Seed data created successfully!");
  console.log(`User 1: alice@example.com / password123 (API Key: ${apiKey1})`);
  console.log(`User 2: bob@example.com / password123 (API Key: ${apiKey2})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
