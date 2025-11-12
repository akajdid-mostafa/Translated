import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const [totalRequests, pendingRequests, inProgressRequests, completedRequests, recentRequests, monthlyStats] =
      await Promise.all([
        prisma.translationRequest.count(),
        prisma.translationRequest.count({ where: { status: "PENDING" } }),
        prisma.translationRequest.count({ where: { status: "IN_PROGRESS" } }),
        prisma.translationRequest.count({ where: { status: "COMPLETED" } }),
        prisma.translationRequest.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            customerName: true,
            sourceLanguage: true,
            targetLanguage: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.translationRequest.groupBy({
          by: ["status"],
          _count: {
            status: true,
          },
        }),
      ])

    const statusDistribution = monthlyStats.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      recentRequests,
      statusDistribution,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
