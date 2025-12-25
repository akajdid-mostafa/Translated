import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minPurchase: z.number().optional(),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

// GET - List all coupons
export async function GET(request: NextRequest) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received coupon data:", body);
    
    const data = couponSchema.parse(body);
    console.log("Parsed coupon data:", data);

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Validate discount value based on type
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    const createData: any = {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      isActive: data.isActive,
    };

    // Only include optional fields if they have values
    if (data.minPurchase !== undefined && data.minPurchase !== null) {
      createData.minPurchase = data.minPurchase;
    }
    if (data.maxDiscount !== undefined && data.maxDiscount !== null) {
      createData.maxDiscount = data.maxDiscount;
    }
    if (data.usageLimit !== undefined && data.usageLimit !== null) {
      createData.usageLimit = data.usageLimit;
    }
    if (data.expiresAt) {
      createData.expiresAt = new Date(data.expiresAt);
    }
    if (data.description) {
      createData.description = data.description;
    }

    console.log("Creating coupon with data:", createData);

    const coupon = await prisma.coupon.create({
      data: createData,
    });

    console.log("Coupon created successfully:", coupon.id);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating coupon:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create coupon", details: errorMessage },
      { status: 500 }
    );
  }
}

