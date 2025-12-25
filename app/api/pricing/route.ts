import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get current pricing settings (public endpoint for frontend)
export async function GET(request: NextRequest) {
  try {
    let settings = await prisma.priceSettings.findUnique({
      where: { id: "price-settings-singleton" },
    });

    // If no settings exist, return default values
    if (!settings) {
      const response = NextResponse.json({
        standardCertifiedPricePerPage: 49,
        swornPricePerPage: 75,
        standardMultiplier: 1.0,
        nextDayMultiplier: 1.5,
        sameDayMultiplier: 2.0,
        hardCopyFee: 50,
      });
      // Prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    // Return only the pricing values (no internal fields)
    const response = NextResponse.json({
      standardCertifiedPricePerPage: settings.standardCertifiedPricePerPage,
      swornPricePerPage: settings.swornPricePerPage,
      standardMultiplier: settings.standardMultiplier,
      nextDayMultiplier: settings.nextDayMultiplier,
      sameDayMultiplier: settings.sameDayMultiplier,
      hardCopyFee: settings.hardCopyFee,
    });
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error("Error fetching pricing:", error);
    // Return default values on error so frontend doesn't break
    const response = NextResponse.json({
      standardCertifiedPricePerPage: 49,
      swornPricePerPage: 75,
      standardMultiplier: 1.0,
      nextDayMultiplier: 1.5,
      sameDayMultiplier: 2.0,
      hardCopyFee: 50,
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
}

