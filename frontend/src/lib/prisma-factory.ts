import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { neonConfig } from "@neondatabase/serverless";
import { Pool } from "pg";
import ws from "ws";

/**
 * Neon serverless driver + adapter only works reliably with Neon hosts.
 * For local Postgres or any standard `postgresql://` URL, use the `pg` adapter.
 * Override with DATABASE_ADAPTER=neon | pg when needed.
 */
export function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const forceNeon = process.env.DATABASE_ADAPTER === "neon";
  const forcePg = process.env.DATABASE_ADAPTER === "pg";
  const looksLikeNeon =
    /neon\.tech/i.test(connectionString) || /\.neon\./i.test(connectionString);

  if (forcePg || (!forceNeon && !looksLikeNeon)) {
    const pool = new Pool({ connectionString });
    return new PrismaClient({ adapter: new PrismaPg(pool) });
  }

  neonConfig.webSocketConstructor = ws;
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });
}
