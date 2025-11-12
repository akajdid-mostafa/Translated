import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { validateFileUpload, sanitizeInput, validateEmail, validatePhone } from "@/lib/security"
import { sendRequestConfirmation, sendAdminNotification } from "@/lib/email"
import { z } from "zod"

const requestSchema = z.object({
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  documentType: z.enum(["LEGAL", "MEDICAL", "TECHNICAL", "BUSINESS", "ACADEMIC", "PERSONAL", "CERTIFIED", "OTHER"]),
  urgency: z.enum(["STANDARD", "URGENT", "EXPRESS", "SAME_DAY", "NEXT_DAY"]).default("STANDARD"),
  specialization: z.string().optional(),
  additionalNotes: z.string().optional(),
  numberOfPages: z.string().min(1),
  estimatedPrice: z.coerce.number().optional(),
  originalFileName: z.string().min(1), // Add originalFileName to schema
  fileUrl: z.string().min(1), // Accept both full URLs and relative paths
  fileSize: z.coerce.number().min(1), // Add fileSize to schema
  fileType: z.string().min(1), // Add fileType to schema
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Remove file validation as file is pre-uploaded
    // const file = formData.get("file") as File;
    // if (!file) {
    //   return NextResponse.json({ error: "No file provided" }, { status: 400 });
    // }

    // try {
    //   validateFileUpload(file);
    // } catch (error: any) {
    //   return NextResponse.json({ error: error.message }, { status: 400 });
    // }

    // Parse and sanitize form data
    const requestData = {
      customerName: sanitizeInput(formData.get("customerName") as string),
      customerEmail: formData.get("customerEmail") as string,
      customerPhone: formData.get("customerPhone") as string,
      sourceLanguage: sanitizeInput(formData.get("sourceLanguage") as string),
      targetLanguage: sanitizeInput(formData.get("targetLanguage") as string),
      documentType: formData.get("documentType") as string,
      urgency: (formData.get("urgency") as string) || "STANDARD",
      specialization: sanitizeInput(formData.get("specialization") as string),
      additionalNotes: sanitizeInput(formData.get("additionalNotes") as string),
      numberOfPages: sanitizeInput(formData.get("numberOfPages") as string),
      estimatedPrice: formData.get("estimatedPrice") ? parseFloat(formData.get("estimatedPrice") as string) : undefined,
      originalFileName: sanitizeInput(formData.get("originalFileName") as string), // Extract originalFileName
      fileUrl: formData.get("fileUrl") as string, // Extract fileUrl
      fileSize: parseFloat(formData.get("fileSize") as string), // Extract fileSize
      fileType: formData.get("fileType") as string, // Extract fileType
    }

    if (!validateEmail(requestData.customerEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (requestData.customerPhone && !validatePhone(requestData.customerPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Validate request data
    const validatedData = requestSchema.parse(requestData)

    // Remove Cloudinary upload as file is pre-uploaded
    // const fileBuffer = Buffer.from(await file.arrayBuffer());
    // const uploadResult = (await uploadToCloudinary(fileBuffer, file.name)) as any;

    // if (!uploadResult || !uploadResult.secure_url) {
    //   return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    // }

    // Create translation request in database
    const translationRequest = await prisma.translationRequest.create({
      data: {
        ...validatedData,
        // Use pre-uploaded file details
        originalFileName: validatedData.originalFileName,
        fileUrl: validatedData.fileUrl,
        fileSize: validatedData.fileSize, 
        fileType: validatedData.fileType,
        status: "PENDING",
      },
    })

    // Create initial status history
    await prisma.statusHistory.create({
      data: {
        requestId: translationRequest.id,
        status: "PENDING",
        notes: "Request submitted",
        changedBy: "System",
      },
    })

    // Send email notifications
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
    } catch (emailError) {
      console.error("Email notification failed:", emailError)
      // Don't fail the request if email fails, just log the error
    }

    return NextResponse.json({
      success: true,
      requestId: translationRequest.id,
      message: "Translation request submitted successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
