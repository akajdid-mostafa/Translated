import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    // Test if the file URL is accessible
    const response = await fetch(fileUrl, { method: 'HEAD' });
    
    return NextResponse.json({
      url: fileUrl,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

  } catch (error) {
    console.error("File check error:", error);
    return NextResponse.json({
      error: "Failed to check file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

