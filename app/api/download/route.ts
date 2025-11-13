import { NextRequest, NextResponse } from "next/server";
import cloudinary, { downloadFromCloudinary } from "@/lib/cloudinary";

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
    // Decode the URL in case it was double-encoded
    const decodedUrl = decodeURIComponent(fileUrl);
    
    // Check if it's a local file path
    if (decodedUrl.startsWith('/uploads/') || decodedUrl.startsWith('./uploads/')) {
      // Handle local file
      const fs = await import('fs/promises');
      const path = await import('path');
      
      try {
        const filePath = path.join(process.cwd(), 'public', decodedUrl.startsWith('/') ? decodedUrl.slice(1) : decodedUrl);
        const fileBuffer = await fs.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        const mimeTypes: Record<string, string> = {
          '.pdf': 'application/pdf',
          '.doc': 'application/msword',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.txt': 'text/plain',
        };
        
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const safeFilename = filename || path.basename(filePath);
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${safeFilename}"`,
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'no-cache',
          },
        });
      } catch (fileError) {
        console.error('Local file read error:', fileError);
        return NextResponse.json({ 
          error: "File not found locally",
          details: fileError instanceof Error ? fileError.message : "Unknown error"
        }, { status: 404 });
      }
    }
    
    // Handle remote URLs (Cloudinary, etc.)
    // Check if it's a Cloudinary URL
    if (decodedUrl.includes('cloudinary.com') || decodedUrl.includes('res.cloudinary.com')) {
      try {
        // Extract public_id and resource_type from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{folder}/{public_id}.{format}
        const urlMatch = decodedUrl.match(/res\.cloudinary\.com\/[^\/]+\/([^\/]+)\/upload\/v\d+\/(.+)$/);
        if (urlMatch) {
          const urlResourceType = urlMatch[1]; // 'image', 'raw', 'video', etc.
          const pathWithFormat = urlMatch[2];
          // Remove file extension to get public_id (includes folder path)
          const publicId = pathWithFormat.replace(/\.[^/.]+$/, '');
          
          console.log(`Extracted public_id: ${publicId}, URL resource_type: ${urlResourceType}`);
          
          // Try multiple resource types - PDFs might be stored as 'raw' even if URL shows 'image'
          const resourceTypesToTry = ['raw', 'image', 'auto'];
          let result: any = null;
          let actualResourceType = urlResourceType;
          
          for (const resourceType of resourceTypesToTry) {
            try {
              console.log(`Trying to fetch resource with type: ${resourceType}`);
              result = await new Promise((resolve, reject) => {
                cloudinary.api.resource(publicId, {
                  resource_type: resourceType
                }, (error: any, apiResult: any) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(apiResult);
                  }
                });
              }) as any;
              
              // Success! Use the actual resource type from the API response
              actualResourceType = result.resource_type || resourceType;
              console.log(`Successfully fetched resource with type: ${actualResourceType}`);
              break;
            } catch (error: any) {
              console.log(`Failed with resource_type '${resourceType}':`, error.message);
              continue;
            }
          }
          
          if (!result) {
            throw new Error('Could not fetch resource with any resource type');
          }
          
          // Try to download the file directly using Cloudinary Admin API
          // This bypasses URL authentication issues
          try {
            console.log(`Attempting to download file directly using Admin API with resource_type: ${actualResourceType}`);
            const fileBuffer = await downloadFromCloudinary(publicId, actualResourceType);
            const buffer = fileBuffer;
            
            // Determine content type from format
            let contentType = 'application/octet-stream';
            const format = result.format?.toLowerCase();
            const fileName = result.public_id?.split('/').pop() || filename || '';
            const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
            
            // Determine content type from file extension or format
            if (fileExtension === '.pdf' || format === 'pdf') {
              contentType = 'application/pdf';
            } else if (fileExtension === '.docx' || format === 'docx') {
              contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else if (fileExtension === '.doc' || format === 'doc') {
              contentType = 'application/msword';
            } else if (fileExtension === '.txt' || format === 'txt') {
              contentType = 'text/plain';
            }
            
            const safeFilename = filename || `${result.public_id.split('/').pop() || 'download'}.${result.format || 'bin'}`;
            
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${safeFilename}"`,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'no-cache',
              },
            });
          } catch (downloadError: any) {
            console.error('Direct download failed:', downloadError.message);
            
            // If download fails, return a helpful error message
            return NextResponse.json({
              error: "File not accessible",
              status: 401,
              statusText: "Unauthorized",
              url: decodedUrl,
              details: downloadError.message,
              suggestion: "The file is in authenticated delivery mode. Please check Cloudinary settings to make the file publicly accessible, or ensure the file delivery mode is set to 'Public' instead of 'Authenticated'."
            }, { status: 401 });
          }
        } else {
          throw new Error('Could not extract public_id from Cloudinary URL');
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary API error:', cloudinaryError);
        // Fallback to direct fetch
        console.log('Falling back to direct URL fetch');
      }
    }
    
    // Fallback: Direct fetch for non-Cloudinary URLs or if Cloudinary API fails
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FileDownload/1.0)'
      },
      // Add timeout
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      console.error(`Failed to fetch file from ${decodedUrl}: ${response.status} ${response.statusText}`);
      return NextResponse.json({ 
        error: "File not accessible", 
        status: response.status,
        statusText: response.statusText,
        url: decodedUrl
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

