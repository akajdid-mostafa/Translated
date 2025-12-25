import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCouponSchema = z.object({
  code: z.string().min(3).max(50).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().positive().optional(),
  minPurchase: z.number().optional(),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
});

// GET - Get single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateCouponSchema.parse(body);

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // If updating code, check if new code already exists
    if (data.code && data.code.toUpperCase() !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    // Validate discount value
    const discountValue = data.discountValue ?? existingCoupon.discountValue;
    const discountType = data.discountType ?? existingCoupon.discountType;
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    const updateData: any = { ...data };
    if (data.code) {
      updateData.code = data.code.toUpperCase();
    }
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(coupon);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    await prisma.coupon.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

