import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    console.log(`Viewing file: ${fileUrl}`);

    // Check if it's a data URL (base64)
    if (fileUrl.startsWith('data:')) {
      // Handle data URL - extract the base64 data
      const base64Data = fileUrl.split(',')[1];
      const mimeType = fileUrl.split(',')[0].split(':')[1].split(';')[0];
      
      if (!base64Data) {
        return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });
      }

      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': 'inline', // This tells browser to display, not download
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    }

    // Handle regular URLs (Cloudinary or local files)
    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FileViewer/1.0)'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: "File not accessible", 
        status: response.status,
        statusText: response.statusText 
      }, { status: response.status });
    }

    const fileBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    
    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline', // This tells browser to display, not download
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error("View file error:", error);
    return NextResponse.json({
      error: "Failed to view file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

