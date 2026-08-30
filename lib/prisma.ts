import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function databaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) throw new Error("DATABASE_URL is required");

  const url = new URL(raw);
  const sslMode = url.searchParams.get("sslmode");
  const usesLibpqCompatibility = url.searchParams.get("uselibpqcompat") === "true";
  if (!usesLibpqCompatibility && sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
    // pg currently treats these modes as verify-full, but will weaken them in
    // its next major release. Make the secure behavior explicit now.
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: databaseUrl() });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
