// Cloudinary utility functions for file organization

export interface CloudinaryFileInfo {
  public_id: string;
  secure_url: string;
  folder: string;
  filename: string;
  requestId: string;
}

/**
 * Extract request ID from Cloudinary public_id or folder path
 */
export function extractRequestIdFromCloudinaryPath(publicId: string): string | null {
  // Pattern: translated-ae/requests/{requestId}/{timestamp}-{filename}
  const match = publicId.match(/translated-ae\/requests\/([^\/]+)\//);
  return match ? match[1] : null;
}

/**
 * Generate organized folder path for Cloudinary uploads
 */
export function generateCloudinaryFolder(requestId: string): string {
  return `translated-ae/requests/${requestId}`;
}

/**
 * Parse Cloudinary URL to extract file information
 */
export function parseCloudinaryUrl(url: string): CloudinaryFileInfo | null {
  try {
    const urlObj = new URL(url);
    
    // Extract public_id from URL path
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const pathParts = urlObj.pathname.split('/');
    const publicIdWithFormat = pathParts[pathParts.length - 1];
    const publicId = publicIdWithFormat.replace(/\.[^/.]+$/, ''); // Remove file extension
    
    // Extract folder from public_id
    const folderMatch = publicId.match(/^(translated-ae\/requests\/[^\/]+)/);
    const folder = folderMatch ? folderMatch[1] : 'translated-ae/documents';
    
    // Extract request ID
    const requestId = extractRequestIdFromCloudinaryPath(publicId);
    
    // Extract filename (remove timestamp prefix)
    const filenameMatch = publicId.match(/\d+-(.+)$/);
    const filename = filenameMatch ? filenameMatch[1] : publicId.split('/').pop() || 'unknown';
    
    return {
      public_id: publicId,
      secure_url: url,
      folder,
      filename,
      requestId: requestId || 'unknown'
    };
  } catch (error) {
    console.error('Error parsing Cloudinary URL:', error);
    return null;
  }
}

/**
 * Get all files for a specific request from Cloudinary
 * This would require Cloudinary Admin API - placeholder for future implementation
 */
export async function getRequestFiles(requestId: string): Promise<CloudinaryFileInfo[]> {
  // This would require Cloudinary Admin API implementation
  // For now, return empty array as placeholder
  console.log(`Getting files for request: ${requestId}`);
  return [];
}

/**
 * Delete all files for a specific request from Cloudinary
 * This would require Cloudinary Admin API - placeholder for future implementation
 */
export async function deleteRequestFiles(requestId: string): Promise<boolean> {
  // This would require Cloudinary Admin API implementation
  // For now, return false as placeholder
  console.log(`Deleting files for request: ${requestId}`);
  return false;
}

