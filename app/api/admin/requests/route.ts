import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
  sortBy: z.string().optional().default("date"),
  sortOrder: z.string().optional().default("desc"),
  dateFrom: z.string().nullable().optional(),
  dateTo: z.string().nullable().optional(),
})

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

    const { searchParams } = new URL(request.url)
    const { page, limit, status, search, sortBy, sortOrder, dateFrom, dateTo } = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
    })

    const limitNum = limit === "all" ? undefined : Number.parseInt(limit)
    const skip = limitNum ? (Number.parseInt(page) - 1) * limitNum : 0
    const take = limitNum

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { originalFileName: { contains: search, mode: "insensitive" } },
      ]
    }

    // Date filtering
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    // Sorting
    let orderBy: any = {}
    if (sortBy === "name") {
      orderBy = { customerName: sortOrder === "asc" ? "asc" : "desc" }
    } else if (sortBy === "date") {
      orderBy = { createdAt: sortOrder === "asc" ? "asc" : "desc" }
    } else {
      orderBy = { createdAt: "desc" }
    }

    const [requests, total] = await Promise.all([
      prisma.translationRequest.findMany({
        where,
        skip: take ? skip : undefined,
        take,
        orderBy,
        include: {
          statusHistory: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.translationRequest.count({ where }),
    ])

    const finalLimit = limitNum || total
    
    return NextResponse.json({
      requests,
      pagination: {
        page: Number.parseInt(page),
        limit: finalLimit,
        total,
        pages: finalLimit > 0 ? Math.ceil(total / finalLimit) : 1,
      },
    })
  } catch (error) {
    console.error("Error fetching requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
