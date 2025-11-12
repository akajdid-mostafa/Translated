import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    // Generate a temporary request ID for file organization
    const tempRequestId = `temp_${nanoid(10)}`;
    
    return NextResponse.json({
      success: true,
      tempRequestId: tempRequestId,
      message: "Temporary request ID generated for file organization"
    });
  } catch (error) {
    console.error("Error generating temporary request ID:", error);
    return NextResponse.json(
      { error: "Failed to generate temporary request ID" },
      { status: 500 }
    );
  }
}
