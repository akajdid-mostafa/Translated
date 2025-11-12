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
  
  console.log(`📁 Uploading to Cloudinary folder: ${folder}`);
  console.log(`📄 File: ${fileName} (${file.length} bytes)`);
  console.log(`🆔 Request ID: ${requestId || 'N/A'}`);
  console.log(`🔑 Public ID: ${publicId}`);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          public_id: publicId,
          folder: folder,
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
            resolve(result);
          }
        },
      )
      .end(file)
  })
}
