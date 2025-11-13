import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const requestId = formData.get("requestId") as string; // Optional request ID for organization
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type - Only allow PDF, Word, and TXT files
    const allowedTypes = [
      "application/pdf", // PDF
      "application/msword", // DOC (Word 97-2003)
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX (Word 2007+)
      "text/plain", // TXT
    ];

    // Also check file extension as backup
    const fileName = file.name.toLowerCase()
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "File type not allowed. Please upload only PDF, DOC, DOCX, or TXT files." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        process.env.CLOUDINARY_CLOUD_NAME === "your-cloudinary-cloud-name" ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
      
      // Fallback to local storage if Cloudinary not configured
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const { existsSync } = await import("fs");
      
      const uploadsDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = join(uploadsDir, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const fileUrl = `${baseUrl}/uploads/${fileName}`;
      
      return NextResponse.json({
        success: true,
        url: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
    
    const uploadResult = await uploadToCloudinary(buffer, file.name, requestId) as any;
    
    console.log("Cloudinary upload result:", {
      public_id: uploadResult?.public_id,
      secure_url: uploadResult?.secure_url,
      format: uploadResult?.format
    });
    
    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error("Cloudinary upload failed - no URL returned");
    }
    
    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudinaryId: uploadResult.public_id
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
