import { PrismaClient } from "@prisma/client";
import {
  getDatabaseUrl,
  getDirectUrl,
  isPgBouncerPreparedStatementError,
} from "./database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createBaseClient(url: string): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
    ...(url.startsWith("postgres")
      ? {
          datasources: {
            db: { url },
          },
        }
      : {}),
  });
}

async function resetPrisma(): Promise<void> {
  const existing = globalForPrisma.prisma;
  if (existing) {
    try {
      await existing.$disconnect();
    } catch {
      /* ignore disconnect errors */
    }
  }
  globalForPrisma.prisma = undefined;
}

async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isPgBouncerPreparedStatementError(error)) {
      await resetPrisma();
      getPrisma();
      return await operation();
    }
    throw error;
  }
}

function isModelDelegate(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const delegate = value as Record<string, unknown>;
  return typeof delegate.findMany === "function" || typeof delegate.create === "function";
}

function wrapDelegate<T extends Record<string, unknown>>(delegate: T): T {
  return new Proxy(delegate, {
    get(target, prop) {
      const value = Reflect.get(target, prop);
      if (typeof value === "function") {
        return (...args: unknown[]) =>
          withDbRetry(async () =>
            (value as (...a: unknown[]) => unknown).apply(target, args)
          );
      }
      return value;
    },
  }) as T;
}

function wrapClient(client: PrismaClient): PrismaClient {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const key = String(prop);
      const value = Reflect.get(target, prop, receiver);

      if (typeof value === "function" && key.startsWith("$")) {
        return (...args: unknown[]) =>
          withDbRetry(async () =>
            (value as (...a: unknown[]) => unknown).apply(target, args)
          );
      }

      if (isModelDelegate(value)) {
        return wrapDelegate(value);
      }

      return value;
    },
  }) as PrismaClient;
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = wrapClient(createBaseClient(getDatabaseUrl()));
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrisma();

/** Direct connection for DDL / setup (session pooler, not transaction pooler). */
export function createDirectPrismaClient(): PrismaClient {
  const url = getDirectUrl();
  if (!url.startsWith("postgres")) {
    return createBaseClient(getDatabaseUrl());
  }
  return createBaseClient(url);
}
