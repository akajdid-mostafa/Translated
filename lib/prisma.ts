let PrismaClient: any

try {
  // Try to import PrismaClient
  const prismaModule = require("@prisma/client")
  PrismaClient = prismaModule.PrismaClient
} catch (error) {
  // Fallback for development environment
  console.warn("Prisma client not available, using mock client")
  PrismaClient = class MockPrismaClient {
    translationRequest = {
      create: async () => ({ id: "mock-id" }),
      findMany: async () => [],
      findUnique: async () => null,
      update: async () => ({}),
      count: async () => 0,
      groupBy: async () => [],
    }
    statusHistory = {
      create: async () => ({ id: "mock-id" }),
      findMany: async () => [],
    }
    user = {
      create: async () => ({ id: "mock-id" }),
      findUnique: async () => null,
      upsert: async () => ({ id: "mock-id" }),
    }
    $disconnect = async () => {}
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
