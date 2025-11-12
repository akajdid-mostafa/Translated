import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    console.log(`Testing file URL: ${fileUrl}`);

    // Test if the file URL is accessible
    const response = await fetch(fileUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FileTest/1.0)'
      }
    });
    
    const result = {
      url: fileUrl,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      lastModified: response.headers.get('last-modified'),
      etag: response.headers.get('etag')
    };

    console.log('File test result:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error("File test error:", error);
    return NextResponse.json({
      error: "Failed to test file",
      details: error instanceof Error ? error.message : "Unknown error",
      url: request.url
    }, { status: 500 });
  }
}

