import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const validateSchema = z.object({
  code: z.string(),
  totalAmount: z.number().positive(),
});

// POST - Validate and calculate discount for a coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, totalAmount } = validateSchema.parse(body);

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "Coupon is not active" },
        { status: 400 }
      );
    }

    // Check if coupon has expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Check if usage limit reached
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Check minimum purchase requirement
    if (coupon.minPurchase && totalAmount < coupon.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimum purchase of SAR ${coupon.minPurchase} required`,
          minPurchase: coupon.minPurchase,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
      // Apply max discount limit if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // FIXED discount
      discountAmount = coupon.discountValue;
      // Don't allow discount to exceed total amount
      if (discountAmount > totalAmount) {
        discountAmount = totalAmount;
      }
    }

    const finalAmount = totalAmount - discountAmount;

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      originalAmount: totalAmount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

