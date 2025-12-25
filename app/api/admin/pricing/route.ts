import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pricingSchema = z.object({
  standardCertifiedPricePerPage: z.number().positive("Standard Certified price must be positive"),
  swornPricePerPage: z.number().positive("Sworn price must be positive"),
  standardMultiplier: z.number().positive("Standard multiplier must be positive"),
  nextDayMultiplier: z.number().positive("Next day multiplier must be positive"),
  sameDayMultiplier: z.number().positive("Same day multiplier must be positive"),
  hardCopyFee: z.number().min(0, "Hard copy fee must be non-negative"),
});

// GET - Get current pricing settings
export async function GET(request: NextRequest) {
  try {
    let settings = await prisma.priceSettings.findUnique({
      where: { id: "price-settings-singleton" },
    });

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.priceSettings.create({
        data: {
          id: "price-settings-singleton",
          standardCertifiedPricePerPage: 49,
          swornPricePerPage: 75,
          standardMultiplier: 1.0,
          nextDayMultiplier: 1.5,
          sameDayMultiplier: 2.0,
          hardCopyFee: 50,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching pricing settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing settings" },
      { status: 500 }
    );
  }
}

// PUT - Update pricing settings (upsert)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = pricingSchema.parse(body);

    // Use upsert to create or update
    const settings = await prisma.priceSettings.upsert({
      where: { id: "price-settings-singleton" },
      update: {
        standardCertifiedPricePerPage: data.standardCertifiedPricePerPage,
        swornPricePerPage: data.swornPricePerPage,
        standardMultiplier: data.standardMultiplier,
        nextDayMultiplier: data.nextDayMultiplier,
        sameDayMultiplier: data.sameDayMultiplier,
        hardCopyFee: data.hardCopyFee,
      },
      create: {
        id: "price-settings-singleton",
        standardCertifiedPricePerPage: data.standardCertifiedPricePerPage,
        swornPricePerPage: data.swornPricePerPage,
        standardMultiplier: data.standardMultiplier,
        nextDayMultiplier: data.nextDayMultiplier,
        sameDayMultiplier: data.sameDayMultiplier,
        hardCopyFee: data.hardCopyFee,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating pricing settings:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update pricing settings", details: errorMessage },
      { status: 500 }
    );
  }
}




