import { hashPassword } from "../lib/auth"

let PrismaClient: any
let prisma: any

try {
  const prismaModule = require("@prisma/client")
  PrismaClient = prismaModule.PrismaClient
  prisma = new PrismaClient()
} catch (error) {
  console.error("Prisma client not available for seeding")
  process.exit(1)
}

async function main() {
  try {
    // Create admin user
    const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || "admin123")

    const admin = await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL || "admin@translated.ae" },
      update: {},
      create: {
        email: process.env.ADMIN_EMAIL || "admin@translated.ae",
        password: adminPassword,
        name: "Admin User",
        role: "SUPER_ADMIN",
      },
    })

    console.log("Admin user created:", admin)

    // Create sample translation requests for testing
    const sampleRequests = [
      {
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+971501234567",
        sourceLanguage: "English",
        targetLanguage: "Arabic",
        documentType: "BUSINESS",
        urgency: "STANDARD",
        originalFileName: "business-contract.pdf",
        fileUrl: "https://example.com/sample.pdf",
        fileSize: 1024000,
        fileType: "application/pdf",
        status: "PENDING",
      },
      {
        customerName: "Sarah Ahmed",
        customerEmail: "sarah@example.com",
        customerPhone: "+971507654321",
        sourceLanguage: "Arabic",
        targetLanguage: "English",
        documentType: "LEGAL",
        urgency: "URGENT",
        originalFileName: "legal-document.pdf",
        fileUrl: "https://example.com/sample2.pdf",
        fileSize: 2048000,
        fileType: "application/pdf",
        status: "IN_PROGRESS",
        estimatedPrice: 250.0,
      },
    ]

    for (const requestData of sampleRequests) {
      const request = await prisma.translationRequest.create({
        data: requestData as any,
      })

      // Create status history
      await prisma.statusHistory.create({
        data: {
          requestId: request.id,
          status: requestData.status as any,
          notes: "Initial status",
          changedBy: "System",
        },
      })
    }

    console.log("Sample data created")
  } catch (error) {
    console.error("Seeding error:", error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect()
    }
  })
