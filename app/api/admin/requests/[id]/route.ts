import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const translationRequest = await prisma.translationRequest.findUnique({
      where: { id: requestId },
      include: {
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!translationRequest) {
      return NextResponse.json({ error: "Translation request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: translationRequest });
  } catch (error) {
    console.error("Error fetching translation request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    // Check if the request exists
    const existingRequest = await prisma.translationRequest.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Translation request not found" }, { status: 404 });
    }

    // Update the request
    const updatedRequest = await prisma.translationRequest.update({
      where: { id: requestId },
      data: {
        status: body.status,
        estimatedPrice: body.estimatedPrice,
        finalPrice: body.finalPrice,
        estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : null,
        actualDelivery: body.actualDelivery ? new Date(body.actualDelivery) : null,
        adminNotes: body.adminNotes,
        assignedTo: body.assignedTo,
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Create status history entry if status changed
    if (body.status && body.status !== existingRequest.status) {
      await prisma.statusHistory.create({
        data: {
          requestId: requestId,
          status: body.status,
          notes: body.adminNotes || `Status changed to ${body.status}`,
          changedBy: payload.email || "Admin System",
        },
      });
    }

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error("Error updating translation request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const requestId = (await params).id;

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    // Check if the request exists before attempting to delete
    const existingRequest = await prisma.translationRequest.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Translation request not found" }, { status: 404 });
    }

    // Delete associated status history records first due to foreign key constraint
    await prisma.statusHistory.deleteMany({
      where: {
        requestId: requestId,
      },
    });

    // Now delete the translation request
    await prisma.translationRequest.delete({
      where: {
        id: requestId,
      },
    });

    return NextResponse.json(
      { message: "Translation request deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting translation request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
