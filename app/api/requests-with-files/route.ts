import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendRequestConfirmation, sendAdminNotification } from "@/lib/email";
import { z } from "zod";

const requestSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  sourceLanguage: z.string().min(1, "Source language is required"),
  targetLanguage: z.string().min(1, "Target language is required"),
  documentType: z.enum(["LEGAL", "MEDICAL", "TECHNICAL", "BUSINESS", "ACADEMIC", "PERSONAL", "CERTIFIED", "OTHER"]),
  urgency: z.enum(["STANDARD", "URGENT", "EXPRESS", "SAME_DAY", "NEXT_DAY"]).default("STANDARD"),
  specialization: z.string().optional(),
  additionalNotes: z.string().optional(),
  numberOfPages: z.string().min(1, "Number of pages is required"),
  estimatedPrice: z.coerce.number().optional(), // Add estimatedPrice to schema
  // File information will be added after upload
  originalFileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  fileUrl: z.string().optional(), // Will be set after upload
  // Coupon information
  couponCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().nullable(),
});

// Phone validation function - more lenient to accept various formats
function validatePhone(phone: string): boolean {
  if (!phone || phone.trim().length === 0) {
    return true; // Optional field, empty is valid
  }
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Allow formats like: +1234567890, +212762544011, 1234567890, 0762544011, etc.
  // Must have at least 7 digits and maximum 16 digits (including country code)
  // Can start with + followed by digits, or just digits
  const phoneRegex = /^(\+?\d{7,16})$/;
  
  return phoneRegex.test(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Check if we have fileUrl instead of file (for already uploaded files)
    const fileUrl = formData.get("fileUrl") as string;
    let file = formData.get("file") as File;
    
    // Extract form data
    const requestData = {
      customerName: formData.get("customerName") as string,
      customerEmail: formData.get("customerEmail") as string,
      customerPhone: formData.get("customerPhone") as string,
      customerAddress: formData.get("customerAddress") as string,
      sourceLanguage: formData.get("sourceLanguage") as string,
      targetLanguage: formData.get("targetLanguage") as string,
      documentType: formData.get("documentType") as string,
      urgency: formData.get("urgency") as string || "STANDARD",
      specialization: formData.get("specialization") as string,
      additionalNotes: formData.get("additionalNotes") as string,
      numberOfPages: formData.get("numberOfPages") as string,
      estimatedPrice: formData.get("estimatedPrice") as string, // Add estimatedPrice extraction
      originalFileName: formData.get("originalFileName") as string,
      fileSize: formData.get("fileSize") as string,
      fileType: formData.get("fileType") as string,
      couponCode: formData.get("couponCode") as string || null,
      discountAmount: formData.get("discountAmount") ? parseFloat(formData.get("discountAmount") as string) : null,
    };

    // Handle case where we have a Cloudinary URL but no file
    if (fileUrl && !file) {
      // Validate that we have all required file information
      if (!requestData.originalFileName || !requestData.fileSize || !requestData.fileType) {
        return NextResponse.json({ error: "Missing file information for pre-uploaded file" }, { status: 400 });
      }
    } else if (file) {
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
    } else {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate required fields before processing
    if (!requestData.customerName || !requestData.customerEmail || 
        !requestData.sourceLanguage || !requestData.targetLanguage || 
        !requestData.documentType || !requestData.numberOfPages) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          customerName: !requestData.customerName,
          customerEmail: !requestData.customerEmail,
          sourceLanguage: !requestData.sourceLanguage,
          targetLanguage: !requestData.targetLanguage,
          documentType: !requestData.documentType,
          numberOfPages: !requestData.numberOfPages
        }
      }, { status: 400 });
    }

    // Validate and normalize phone number if provided
    if (requestData.customerPhone && requestData.customerPhone.trim()) {
      // Normalize phone number (remove spaces, dashes, parentheses, etc.)
      const normalizedPhone = requestData.customerPhone.replace(/[^\d+]/g, '');
      
      if (!validatePhone(normalizedPhone)) {
        console.error('Invalid phone format:', requestData.customerPhone, '-> normalized:', normalizedPhone);
        return NextResponse.json({ 
          error: "Invalid phone number format. Please use a valid format like +1234567890 or 1234567890" 
        }, { status: 400 });
      }
      
      // Store normalized phone number
      requestData.customerPhone = normalizedPhone;
    }

    // Validate request data
    const dataToValidate = {
      ...requestData,
      originalFileName: requestData.originalFileName || (file ? file.name : ""),
      fileSize: file ? file.size : (requestData.fileSize ? parseInt(requestData.fileSize) : 0),
      fileType: requestData.fileType || (file ? file.type : ""),
      estimatedPrice: requestData.estimatedPrice ? parseFloat(requestData.estimatedPrice) : undefined,
      // fileUrl is optional and will be set after upload
    };

    console.log("Data to validate:", dataToValidate);

    const validatedData = requestSchema.parse(dataToValidate);

    // Create translation request in database first to get the ID
    // Use provided fileUrl if available, otherwise set to "pending" (will be updated in background)
    const initialFileUrl = fileUrl || "pending";
    
    const translationRequest = await prisma.translationRequest.create({
      data: {
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone,
        customerAddress: validatedData.customerAddress,
        sourceLanguage: validatedData.sourceLanguage,
        targetLanguage: validatedData.targetLanguage,
        documentType: validatedData.documentType,
        urgency: validatedData.urgency,
        specialization: validatedData.specialization,
        additionalNotes: validatedData.additionalNotes,
        numberOfPages: validatedData.numberOfPages,
        estimatedPrice: validatedData.estimatedPrice,
        originalFileName: validatedData.originalFileName,
        fileSize: validatedData.fileSize,
        fileType: validatedData.fileType,
        fileUrl: initialFileUrl, // Use provided URL or "pending"
        couponCode: validatedData.couponCode || null,
        discountAmount: validatedData.discountAmount || null,
        status: "PENDING",
      },
    });

    console.log(`Created request with ID: ${translationRequest.id}`);

    // Create initial status history immediately
    await prisma.statusHistory.create({
      data: {
        requestId: translationRequest.id,
        status: "PENDING",
        notes: "Request submitted",
        changedBy: "System",
      },
    });

    // Process file and send emails in background (fire and forget)
    // This allows us to return immediately to the client
    (async () => {
      try {
        // Now upload file to Cloudinary with request ID folder
        let fileUrlResult = "";
        let cloudinaryId = "";

        try {
          // Check if Cloudinary is configured
          if (process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_CLOUD_NAME !== "your-cloudinary-cloud-name" &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET) {
          
          if (file) {
            // Regular file upload
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            console.log(`Uploading file to Cloudinary for request ${translationRequest.id}: ${file.name} (${file.size} bytes)`);
            
            const uploadResult = await uploadToCloudinary(buffer, file.name, translationRequest.id) as any;
            
            console.log("Cloudinary upload result:", {
              public_id: uploadResult?.public_id,
              secure_url: uploadResult?.secure_url,
              format: uploadResult?.format
            });
            
            if (uploadResult && uploadResult.secure_url) {
              fileUrlResult = uploadResult.secure_url;
              cloudinaryId = uploadResult.public_id;
            } else {
              throw new Error("Cloudinary upload failed - no URL returned");
            }
          } else if (fileUrl) {
            // File already exists in Cloudinary, organize it properly using Cloudinary's API
            try {
              // Import Cloudinary to use its API
              const cloudinary = require('cloudinary').v2;
              cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
              });
              
              // Extract public ID from URL more carefully
              // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
              console.log(`Processing Cloudinary URL: ${fileUrl}`);
              
              const urlObj = new URL(fileUrl);
              const pathParts = urlObj.pathname.split('/');
              const publicIdWithFormat = pathParts[pathParts.length - 1];
              const publicId = publicIdWithFormat.replace(/\.[^/.]+$/, ''); // Remove file extension
              
              console.log(`Extracted public ID: ${publicId}`);
              
              // Check if file is already in the correct folder
              if (publicId.includes(`translated-ae/requests/${translationRequest.id}`)) {
                console.log(`File is already in the correct organized folder: ${publicId}`);
                fileUrlResult = fileUrl;
                cloudinaryId = publicId;
              } else {
                // Generate new folder path with request ID
                const newFolder = `translated-ae/requests/${translationRequest.id}`;
                const timestamp = Date.now();
                const fileBaseName = requestData.originalFileName.replace(/\.[^/.]+$/, "");
                const newPublicId = `${newFolder}/${timestamp}-${fileBaseName}`;
                
                console.log(`Moving Cloudinary file to organized folder: ${newFolder}`);
                console.log(`New public ID will be: ${newPublicId}`);
                
                // Use Cloudinary's rename API to move the file to the organized folder
                const renameResult = await cloudinary.uploader.rename(
                  publicId,
                  newPublicId,
                  { overwrite: true }
                );
                
                if (renameResult && renameResult.secure_url) {
                  fileUrlResult = renameResult.secure_url;
                  cloudinaryId = renameResult.public_id;
                  console.log(`Successfully moved file. New URL: ${fileUrlResult}`);
                } else {
                  throw new Error("Cloudinary file organization failed - no URL returned");
                }
              }
            } catch (cloudinaryError) {
              console.error("Cloudinary organization error:", cloudinaryError);
              // If Cloudinary organization fails, fall back to using the existing URL
              fileUrlResult = fileUrl;
              console.log(`Using existing URL as fallback: ${fileUrl}`);
            }
          }
        } else {
          // Fallback to local storage
          const { writeFile, mkdir } = await import("fs/promises");
          const { join } = await import("path");
          const { existsSync } = await import("fs");
          
          const uploadsDir = join(process.cwd(), "public", "uploads", translationRequest.id);
          if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
          }

          let fileName = "";
          let buffer: Buffer = Buffer.from([]); // Initialize with empty buffer
          
          if (file) {
            // Regular file
            fileName = file.name;
            const bytes = await file.arrayBuffer();
            buffer = Buffer.from(bytes);
          } else if (fileUrl) {
            // For pre-uploaded files in local storage, we would need to download them to organize locally
            // This is a simplified approach - in production you might want to handle this differently
            fileName = requestData.originalFileName || "file";
            // In a real implementation, you would download the file from fileUrl
            // For now, we'll just create a placeholder
          }

          const timestamp = Date.now();
          const safeFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = join(uploadsDir, safeFileName);

          await writeFile(filePath, buffer);

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          fileUrlResult = `${baseUrl}/uploads/${translationRequest.id}/${safeFileName}`;
        }

        // Update the request with the actual file URL (if different from initial)
        if (fileUrlResult && fileUrlResult !== initialFileUrl) {
          await prisma.translationRequest.update({
            where: { id: translationRequest.id },
            data: { fileUrl: fileUrlResult }
          });
        }

        console.log(`File processed successfully for request ${translationRequest.id}: ${fileUrlResult}`);

      } catch (uploadError) {
        console.error("File processing error:", uploadError);
        // Log error but don't fail the request - file can be processed later
      }

      // Send email notifications in background
      try {
        // Send confirmation email to customer
        await sendRequestConfirmation(validatedData.customerEmail, translationRequest.id)
        
        // Send notification email to admin
        const adminEmail = process.env.ADMIN_EMAIL || "mostafaakajdid6@gmail.com"
        await sendAdminNotification(adminEmail, {
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone,
          sourceLanguage: validatedData.sourceLanguage,
          targetLanguage: validatedData.targetLanguage,
          documentType: validatedData.documentType,
          urgency: validatedData.urgency,
          numberOfPages: validatedData.numberOfPages,
          estimatedPrice: validatedData.estimatedPrice,
          originalFileName: validatedData.originalFileName,
          requestId: translationRequest.id,
        })

        console.log(`Email notifications sent for request ${translationRequest.id}`);
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Don't fail the request if email fails
      }
      } catch (bgError) {
        console.error("Background processing error:", bgError);
        // Log but don't fail - request is already created
      }
    })(); // Execute immediately in background

    // Return response immediately with requestId
    return NextResponse.json({
      success: true,
      requestId: translationRequest.id,
      message: "Request submitted successfully",
    });

  } catch (error) {
    console.error("Request submission error:", error);
    
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
