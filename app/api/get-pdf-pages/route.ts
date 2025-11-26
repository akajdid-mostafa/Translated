import { NextRequest, NextResponse } from "next/server";

// Simple PDF page count parser - reads PDF structure directly
// This avoids webpack issues with pdfjs-dist
function getPDFPageCountFromBuffer(buffer: Buffer): number {
  try {
    const pdfText = buffer.toString('binary');
    
    // Method 1: Look for /Count in Pages object (most reliable)
    const pagesMatch = pdfText.match(/\/Type\s*\/Pages[^s]*\/Count\s+(\d+)/);
    if (pagesMatch) {
      const count = parseInt(pagesMatch[1], 10);
      if (count > 0) {
        return count;
      }
    }
    
    // Method 2: Count /Page objects
    const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
    if (pageMatches) {
      return pageMatches.length;
    }
    
    // Method 3: Look for page objects in the trailer
    const trailerMatch = pdfText.match(/\/Size\s+(\d+)/);
    if (trailerMatch) {
      // Rough estimation based on file structure
      const estimatedPages = Math.max(1, Math.ceil(buffer.length / 5000));
      return estimatedPages;
    }
    
    return 0;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.pdf')) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    try {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Parse PDF to get page count
      const pageCount = getPDFPageCountFromBuffer(buffer);
      
      if (pageCount > 0) {
        return NextResponse.json({
          pageCount: pageCount,
          success: true
        });
      } else {
        // Fallback estimation
        const estimatedPages = Math.max(1, Math.ceil(file.size / 5000));
        return NextResponse.json({
          pageCount: estimatedPages,
          success: false,
          estimated: true
        });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      // Fallback estimation
      const estimatedPages = Math.max(1, Math.ceil(file.size / 5000));
      return NextResponse.json({
        pageCount: estimatedPages,
        success: false,
        estimated: true
      });
    }

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({
      error: "Failed to process PDF",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

