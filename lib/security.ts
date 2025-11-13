import type { NextRequest } from "next/server"

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}

// File upload security - Only allow PDF, Word, and TXT files
export const validateFileUpload = (file: File) => {
  const allowedTypes = [
    "application/pdf", // PDF
    "application/msword", // DOC (Word 97-2003)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX (Word 2007+)
    "text/plain", // TXT
  ]

  // Also check file extension as backup
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
  
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    throw new Error("File type not allowed. Please upload only PDF, DOC, DOCX, or TXT files.")
  }

  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 10MB.")
  }

  return true
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim()
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

// CSRF protection
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Request validation
export const validateRequest = (request: NextRequest) => {
  const userAgent = request.headers.get("user-agent")
  const origin = request.headers.get("origin")

  // Block requests without user agent (potential bots)
  if (!userAgent) {
    throw new Error("Invalid request")
  }

  // Validate origin for POST requests
  if (request.method === "POST" && origin) {
    const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000", "https://localhost:3000"]

    if (!allowedOrigins.includes(origin)) {
      throw new Error("Invalid origin")
    }
  }

  return true
}

// SQL injection prevention helpers
export const escapeString = (str: string): string => {
  return str.replace(/'/g, "''").replace(/\\/g, "\\\\")
}

// Password strength validation
export const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" }
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" }
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" }
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" }
  }

  return { isValid: true, message: "Password is strong" }
}
