import { type NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

enum RequestStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  QUOTE_SENT = "QUOTE_SENT",
  APPROVED = "APPROVED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  ON_HOLD = "ON_HOLD",
}

const updateStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus),
  notes: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("admin-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requestId = (await params).id;
    const body = await request.json();
    const { status, notes } = updateStatusSchema.parse(body);

    const existingRequest = await prisma.translationRequest.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Translation request not found" }, { status: 404 });
    }

    const updatedRequest = await prisma.translationRequest.update({
      where: { id: requestId },
      data: {
        status,
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    await prisma.statusHistory.create({
      data: {
        requestId,
        status,
        notes: notes || `Status changed to ${status}`,
        changedBy: payload.email || "Admin System", // Use admin's email from token
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating request status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
