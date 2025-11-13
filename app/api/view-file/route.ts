import { NextRequest, NextResponse } from "next/server";
import cloudinary, { downloadFromCloudinary } from "@/lib/cloudinary";

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
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': 'inline',
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'public, max-age=3600',
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
            
            // Determine content type from file extension in the original URL
            // This is more reliable than Cloudinary's format detection
            let contentType = 'application/octet-stream';
            let filename = 'file';
            const originalUrl = decodedUrl.toLowerCase();
            
            // Extract filename from URL or Cloudinary public_id
            try {
              const urlParts = decodedUrl.split('/');
              const urlFilename = urlParts[urlParts.length - 1].split('?')[0];
              if (urlFilename && urlFilename.includes('.')) {
                filename = decodeURIComponent(urlFilename);
              } else {
                // Fallback to public_id
                const publicIdParts = result.public_id?.split('/') || [];
                filename = publicIdParts[publicIdParts.length - 1] || 'file';
                // Try to get format from Cloudinary
                if (result.format) {
                  filename += '.' + result.format;
                }
              }
            } catch (e) {
              // Use public_id as fallback
              const publicIdParts = result.public_id?.split('/') || [];
              filename = publicIdParts[publicIdParts.length - 1] || 'file';
            }
            
            // Check file extension from the original URL first (most reliable)
            if (originalUrl.endsWith('.pdf') || originalUrl.includes('.pdf')) {
              contentType = 'application/pdf';
              if (!filename.endsWith('.pdf')) filename += '.pdf';
            } else if (originalUrl.endsWith('.docx') || originalUrl.includes('.docx')) {
              contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              if (!filename.endsWith('.docx')) filename += '.docx';
            } else if (originalUrl.includes('.doc') && !originalUrl.includes('.docx')) {
              contentType = 'application/msword';
              if (!filename.endsWith('.doc')) filename += '.doc';
            } else if (originalUrl.endsWith('.txt') || originalUrl.includes('.txt')) {
              contentType = 'text/plain';
              if (!filename.endsWith('.txt')) filename += '.txt';
            } else {
              // Fallback to Cloudinary format detection
              const format = result.format?.toLowerCase();
              const fileName = result.public_id?.split('/').pop() || '';
              const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
              
              if (fileExtension === '.pdf' || format === 'pdf') {
                contentType = 'application/pdf';
              } else if (fileExtension === '.docx' || format === 'docx') {
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              } else if (fileExtension === '.doc' || format === 'doc') {
                contentType = 'application/msword';
              } else if (fileExtension === '.txt' || format === 'txt') {
                contentType = 'text/plain';
              }
            }
            
            // For PDFs, use inline to display in browser
            // For TXT files, also use inline
            // For Word documents, browsers can't display them inline, so they will download regardless
            // But we still set inline so browsers can decide
            
            // Escape filename for Content-Disposition header
            const escapedFilename = filename.replace(/"/g, '\\"');
            
            // Set headers for inline display
            // CRITICAL: For PDFs, do NOT include Content-Disposition header at all
            // Browsers will display PDFs inline based on Content-Type: application/pdf alone
            // Including Content-Disposition can cause browsers to download instead of display
            const headers: Record<string, string> = {
              'Content-Type': contentType,
              'Content-Length': buffer.length.toString(),
              'Cache-Control': 'public, max-age=3600',
              'X-Content-Type-Options': 'nosniff', // Prevent MIME type sniffing
            };
            
            // For PDFs, omit Content-Disposition entirely - browser will display inline
            // Only add Content-Disposition for non-PDF files
            if (contentType !== 'application/pdf') {
              headers['Content-Disposition'] = `inline; filename="${escapedFilename}"`;
            } else {
              // For PDFs, add X-Frame-Options to allow embedding in iframes
              headers['X-Frame-Options'] = 'SAMEORIGIN';
              // Optionally, we can add Accept-Ranges for better streaming support
              headers['Accept-Ranges'] = 'bytes';
            }
            
            return new NextResponse(buffer, { headers });
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
        'User-Agent': 'Mozilla/5.0 (compatible; FileViewer/1.0)'
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
    
    // Get content type from response or detect from URL
    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    const urlLower = decodedUrl.toLowerCase();
    
    // Override content type based on file extension if not set correctly
    if (!contentType || contentType === 'application/octet-stream') {
      if (urlLower.includes('.pdf')) {
        contentType = 'application/pdf';
      } else if (urlLower.includes('.docx')) {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (urlLower.includes('.doc') && !urlLower.includes('.docx')) {
        contentType = 'application/msword';
      } else if (urlLower.includes('.txt')) {
        contentType = 'text/plain';
      }
    }
    
    // Extract filename from URL for Content-Disposition
    const urlParts = decodedUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0] || 'file';
    
    // CRITICAL: For PDFs, do NOT include Content-Disposition header
    // Browsers display PDFs inline based on Content-Type: application/pdf alone
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    };
    
    // Only add Content-Disposition for non-PDF files
    if (contentType === 'application/pdf') {
      // Omit Content-Disposition for PDFs - browser will display inline
      headers['X-Frame-Options'] = 'SAMEORIGIN';
      headers['Accept-Ranges'] = 'bytes';
    } else {
      headers['Content-Disposition'] = `inline; filename="${filename}"`;
    }

    return new NextResponse(buffer, { headers });

  } catch (error) {
    console.error("View file error:", error);
    return NextResponse.json({
      error: "Failed to view file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

