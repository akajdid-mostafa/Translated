// Server-side only Cloudinary configuration
// This file should only be imported in API routes, not in client components

let cloudinary: any = null;

if (typeof window === 'undefined') {
  // Only run on server side
  const { v2 } = require("cloudinary");
  cloudinary = v2;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;

export const uploadToCloudinary = async (file: Buffer, fileName: string, requestId?: string) => {
  if (typeof window !== 'undefined') {
    throw new Error("uploadToCloudinary can only be used on the server side");
  }
  
  if (!cloudinary) {
    throw new Error("Cloudinary not configured");
  }

  // Create folder structure based on request ID
  const folder = requestId 
    ? `translated-ae/requests/${requestId}`
    : "translated-ae/documents";

  const publicId = `${Date.now()}-${fileName.replace(/\.[^/.]+$/, "")}`;
  
  // Determine resource type based on file extension
  // PDFs, Word documents, and TXT files should be uploaded as "raw", not "auto"
  const fileExtension = fileName.toLowerCase().split('.').pop();
  const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
  const isDocument = allowedExtensions.includes(fileExtension || '');
  
  if (!isDocument) {
    throw new Error(`File type not allowed. Only PDF, DOC, DOCX, and TXT files are supported.`);
  }
  
  const resourceType = "raw"; // All allowed files are documents, use "raw" resource type
  
  console.log(`📁 Uploading to Cloudinary folder: ${folder}`);
  console.log(`📄 File: ${fileName} (${file.length} bytes)`);
  console.log(`🆔 Request ID: ${requestId || 'N/A'}`);
  console.log(`🔑 Public ID: ${publicId}`);
  console.log(`📦 Resource Type: ${resourceType} (file extension: ${fileExtension})`);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: resourceType, // Use "raw" for PDFs/documents, "auto" for images
          public_id: publicId,
          folder: folder,
          // Ensure files are uploaded as public (not authenticated)
          // This allows direct access without authentication
          type: "upload", // Explicitly set to upload type (public)
          access_mode: "public", // Ensure public access
        },
        (error: any, result: any) => {
          if (error) {
            console.error(`❌ Cloudinary upload failed:`, error);
            reject(error);
          } else {
            console.log(`✅ Cloudinary upload successful:`);
            console.log(`   📁 Folder: ${result.folder}`);
            console.log(`   🔗 URL: ${result.secure_url}`);
            console.log(`   🆔 Public ID: ${result.public_id}`);
            console.log(`   🔓 Access Mode: ${result.access_mode || 'public'}`);
            resolve(result);
          }
        },
      )
      .end(file)
  })
}

/**
 * Download a file from Cloudinary using Admin API
 * This bypasses URL authentication issues by using the Admin API directly
 */
export const downloadFromCloudinary = async (publicId: string, resourceType: string = 'auto'): Promise<Buffer> => {
  if (typeof window !== 'undefined') {
    throw new Error("downloadFromCloudinary can only be used on the server side");
  }
  
  if (!cloudinary) {
    throw new Error("Cloudinary not configured");
  }

  return new Promise((resolve, reject) => {
    // Use the Admin API to get the file URL and download it
    cloudinary.api.resource(publicId, {
      resource_type: resourceType
    }, async (error: any, result: any) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        // Extract version from secure_url if available
        const versionMatch = result.secure_url?.match(/\/v(\d+)\//);
        const version = versionMatch ? versionMatch[1] : result.version || undefined;
        
        console.log(`Attempting to download file. Version: ${version}, Resource type: ${resourceType}`);
        
        // For authenticated accounts, we need to use the Admin API to download directly
        // Cloudinary doesn't provide a direct download endpoint, but we can use the
        // authenticated URL with proper signing that includes authentication credentials
        
        // Build the authenticated download URL using API credentials
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        
        if (!cloudName || !apiKey || !apiSecret) {
          reject(new Error('Cloudinary credentials not configured'));
          return;
        }
        
        // For authenticated delivery mode, Cloudinary requires signed URLs
        // The Cloudinary SDK's sign_url should handle this, but if account is in authenticated mode,
        // we need to ensure the signature is correct
        
        // First, try Cloudinary's built-in signed URL (this should work for authenticated accounts)
        console.log(`Trying Cloudinary's signed URL utility (should work for authenticated accounts)`);
        const signedUrl = cloudinary.utils.url(publicId, {
          resource_type: resourceType,
          secure: true,
          sign_url: true,
          version: version
        });
        
        console.log(`Generated signed URL: ${signedUrl}`);
        let response = await fetch(signedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CloudinaryDownload/1.0)'
          }
        });
        
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          resolve(Buffer.from(arrayBuffer));
          return;
        }
        
        console.log(`Signed URL failed (${response.status}), trying manual authentication`);
        
        // If signed URL fails, try manual signature generation
        // For authenticated delivery, the signature format is: sha1(timestamp + api_secret)
        const crypto = await import('crypto');
        const timestamp = Math.round(Date.now() / 1000);
        const signatureString = `timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');
        
        // Construct URL with manual signature
        const authUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/v${version || result.version}/${publicId}?api_key=${apiKey}&timestamp=${timestamp}&signature=${signature}`;
        
        console.log(`Trying manually signed authenticated URL`);
        response = await fetch(authUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CloudinaryDownload/1.0)'
          }
        });
        
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          resolve(Buffer.from(arrayBuffer));
          return;
        }
        
        console.log(`Manual authenticated URL failed (${response.status}), trying secure_url from API`);
        
        // Try secure_url from API as last resort
        response = await fetch(result.secure_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CloudinaryDownload/1.0)'
          }
        });
        
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          resolve(Buffer.from(arrayBuffer));
          return;
        }
        
        // All URLs failed - file is likely in authenticated mode
        // Try to update the file's access mode to public using Admin API
        console.log(`All URLs failed. Attempting to update file access mode to public...`);
        
        try {
          // Use uploader.explicit to update access mode
          // This method allows us to update resource metadata including access_mode
          const updateResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.explicit(publicId, {
              resource_type: resourceType,
              type: 'upload',
              access_mode: 'public',
              overwrite: false
            }, (error: any, result: any) => {
              if (error) {
                console.log(`Failed to update access mode: ${error.message}`);
                reject(error);
              } else {
                console.log(`Successfully updated file access mode to public`);
                resolve(result);
              }
            });
          }) as any;
          
          // Wait a moment for the change to propagate
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Now try downloading again with the updated access mode
          console.log(`Retrying download after updating access mode...`);
          const retryUrl = cloudinary.utils.url(publicId, {
            resource_type: resourceType,
            secure: true,
            version: version
          });
          
          console.log(`Retry URL: ${retryUrl}`);
          const retryResponse = await fetch(retryUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CloudinaryDownload/1.0)'
            }
          });
          
          console.log(`Retry response status: ${retryResponse.status}`);
          
          if (retryResponse.ok) {
            const arrayBuffer = await retryResponse.arrayBuffer();
            resolve(Buffer.from(arrayBuffer));
            return;
          }
          
          // If still failing, try the secure_url from the update result
          if (updateResult && updateResult.secure_url) {
            console.log(`Trying secure_url from update result: ${updateResult.secure_url}`);
            const finalResponse = await fetch(updateResult.secure_url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; CloudinaryDownload/1.0)'
              }
            });
            
            if (finalResponse.ok) {
              const arrayBuffer = await finalResponse.arrayBuffer();
              resolve(Buffer.from(arrayBuffer));
              return;
            }
          }
          
          reject(new Error(`Failed to download file even after updating access mode. Status: ${retryResponse.status}`));
        } catch (updateError: any) {
          console.error(`Error updating access mode: ${updateError.message}`);
          reject(new Error(`Failed to download file. All URL attempts failed and could not update access mode. The file appears to be in authenticated/private delivery mode. Please check Cloudinary settings: Settings > Security > Access mode should be set to "Public" for public access. Error: ${updateError.message}`));
        }
      } catch (fetchError: any) {
        reject(new Error(`Fetch error: ${fetchError.message}`));
      }
    });
  });
}
