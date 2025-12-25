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
    coupon = {
      create: async () => ({ id: "mock-id" }),
      findMany: async () => [],
      findUnique: async () => null,
      update: async () => ({}),
      delete: async () => ({}),
    }
    priceSettings = {
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

// Force regeneration if coupon or priceSettings model is missing
let prismaInstance = globalForPrisma.prisma;
if (!prismaInstance || !prismaInstance.coupon || !prismaInstance.priceSettings) {
  // Clear old instance and create new one
  prismaInstance = new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;
