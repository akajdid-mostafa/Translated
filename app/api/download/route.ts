import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    const filename = searchParams.get('filename');
    
    if (!fileUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    console.log(`Downloading file: ${fileUrl}`);

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
          'Content-Disposition': `attachment; filename="${filename || 'download'}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    }

    // Handle regular URLs (Cloudinary or local files)
    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FileDownload/1.0)'
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
    
    // Get content type from response or guess from filename
    const contentType = response.headers.get('content-type') || 
      (filename ? `application/${filename.split('.').pop()}` : 'application/octet-stream');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename || 'download'}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({
      error: "Failed to download file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

