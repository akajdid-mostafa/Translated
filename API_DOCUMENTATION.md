# API Documentation

**Base URL:** `http://localhost:3001/api` (Development)  
**Base URL:** `https://api.halatranslate.com/api` (Production)

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Public APIs](#public-apis)
3. [Admin APIs](#admin-apis)
4. [File Management APIs](#file-management-apis)
5. [Error Handling](#error-handling)

---

## Authentication APIs

### POST `/api/auth/login`
Admin login endpoint.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "ADMIN"
  }
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Cookies:** Sets `admin-token` HTTP-only cookie

---

### POST `/api/auth/logout`
Admin logout endpoint.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Cookies:** Clears `admin-token` cookie

---

### GET `/api/auth/me`
Get current authenticated admin user.

**Headers:**
- Cookie: `admin-token=...`

**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "ADMIN"
  }
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## Public APIs

### GET `/api/pricing`
Get current pricing settings (public endpoint).

**Response (200):**
```json
{
  "standardCertifiedPricePerPage": 49,
  "swornPricePerPage": 75,
  "standardMultiplier": 1.0,
  "nextDayMultiplier": 1.5,
  "sameDayMultiplier": 2.0,
  "hardCopyFee": 50
}
```

**Cache Headers:** No-cache headers set to prevent stale data

---

### POST `/api/requests-with-files`
Submit a translation request with file upload.

**Content-Type:** `multipart/form-data`

**Form Data:**
```
customerName: string
customerEmail: string
customerPhone: string (optional)
customerAddress: string (optional)
sourceLanguage: string
targetLanguage: string
documentType: "LEGAL" | "MEDICAL" | "TECHNICAL" | "BUSINESS" | "ACADEMIC" | "PERSONAL" | "CERTIFIED" | "OTHER"
serviceLevel: "STANDARD_CERTIFIED" | "SWORN" (optional)
turnaround: "STANDARD" | "NEXT_DAY" | "SAME_DAY"
urgency: "STANDARD" | "URGENT" | "EXPRESS" | "SAME_DAY" | "NEXT_DAY"
specialization: string (optional)
additionalNotes: string (optional)
numberOfPages: string
estimatedPrice: string
hardCopyDelivery: "true" | "false"
couponCode: string (optional)
discountAmount: string (optional)
originalFileName: string
fileUrl: string (optional, if file already uploaded)
fileSize: string
fileType: string
file: File (optional, if not using fileUrl)
```

**Response (200):**
```json
{
  "requestId": "request-id",
  "message": "Request submitted successfully"
}
```

**Response (400):**
```json
{
  "error": "Validation error message",
  "details": {}
}
```

---

### POST `/api/coupons/validate`
Validate a coupon code.

**Request:**
```json
{
  "code": "COUPON123",
  "totalAmount": 100.50
}
```

**Response (200):**
```json
{
  "valid": true,
  "coupon": {
    "code": "COUPON123",
    "discountType": "PERCENTAGE",
    "discountValue": 10,
    "description": "10% off"
  },
  "discountAmount": 10.05,
  "finalAmount": 90.45,
  "originalAmount": 100.50
}
```

**Response (400/404):**
```json
{
  "error": "Invalid coupon code" | "Coupon has expired" | "Minimum purchase of SAR 100 required"
}
```

---

## File Management APIs

### POST `/api/upload`
Upload a file to Cloudinary.

**Content-Type:** `multipart/form-data`

**Form Data:**
```
file: File
tempId: string (optional)
```

**Response (200):**
```json
{
  "fileUrl": "https://cloudinary.com/...",
  "publicId": "public-id",
  "tempId": "temp-id"
}
```

---

### GET `/api/get-pdf-pages`
Get page count from PDF file.

**Query Parameters:**
- `url`: PDF file URL (required)

**Response (200):**
```json
{
  "pageCount": 5
}
```

---

### GET `/api/get-pdf-words`
Get word count from PDF file.

**Query Parameters:**
- `url`: PDF file URL (required)

**Response (200):**
```json
{
  "wordCount": 1250
}
```

---

### GET `/api/view-file`
View/download a file.

**Query Parameters:**
- `url`: File URL (required)

**Response:** File stream or redirect

---

### GET `/api/download`
Download a file.

**Query Parameters:**
- `url`: File URL (required)
- `filename`: Optional filename

**Response:** File download

---

### POST `/api/check-file`
Check if file exists and get metadata.

**Request:**
```json
{
  "url": "https://cloudinary.com/..."
}
```

**Response (200):**
```json
{
  "exists": true,
  "size": 1024000,
  "type": "application/pdf"
}
```

---

### GET `/api/generate-temp-id`
Generate a temporary ID for file uploads.

**Response (200):**
```json
{
  "tempId": "temp-id-12345"
}
```

---

## Admin APIs

All admin APIs require authentication via `admin-token` cookie.

### GET `/api/admin/requests`
Get list of translation requests with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, or "all")
- `status`: Filter by status (optional)
- `search`: Search in name, email, filename (optional)
- `sortBy`: Sort field (default: "date")
- `sortOrder`: "asc" | "desc" (default: "desc")
- `dateFrom`: Start date filter (optional)
- `dateTo`: End date filter (optional)

**Response (200):**
```json
{
  "requests": [
    {
      "id": "request-id",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "status": "PENDING",
      "sourceLanguage": "English",
      "targetLanguage": "Arabic",
      "numberOfPages": "5",
      "estimatedPrice": 245.00,
      "createdAt": "2025-01-27T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

### GET `/api/admin/requests/[id]`
Get single translation request details.

**Response (200):**
```json
{
  "id": "request-id",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+966501234567",
  "status": "PENDING",
  "sourceLanguage": "English",
  "targetLanguage": "Arabic",
  "documentType": "CERTIFIED",
  "numberOfPages": "5",
  "estimatedPrice": 245.00,
  "fileUrl": "https://cloudinary.com/...",
  "originalFileName": "document.pdf",
  "statusHistory": [
    {
      "status": "PENDING",
      "createdAt": "2025-01-27T10:00:00Z",
      "changedBy": "system"
    }
  ],
  "createdAt": "2025-01-27T10:00:00Z"
}
```

---

### PATCH `/api/admin/requests/[id]`
Update translation request.

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "adminNotes": "Working on translation",
  "finalPrice": 250.00,
  "estimatedDelivery": "2025-01-30T10:00:00Z"
}
```

**Response (200):**
```json
{
  "id": "request-id",
  "status": "IN_PROGRESS",
  "message": "Request updated successfully"
}
```

---

### PUT `/api/admin/requests/[id]/status`
Update request status.

**Request:**
```json
{
  "status": "COMPLETED",
  "notes": "Translation completed"
}
```

**Response (200):**
```json
{
  "message": "Status updated successfully",
  "request": {
    "id": "request-id",
    "status": "COMPLETED"
  }
}
```

---

### GET `/api/admin/stats`
Get dashboard statistics.

**Response (200):**
```json
{
  "totalRequests": 150,
  "pendingRequests": 25,
  "inProgressRequests": 10,
  "completedRequests": 100,
  "totalRevenue": 50000.00,
  "monthlyRevenue": 10000.00,
  "requestsByStatus": {
    "PENDING": 25,
    "IN_PROGRESS": 10,
    "COMPLETED": 100,
    "CANCELLED": 15
  },
  "recentRequests": [...]
}
```

---

### GET `/api/admin/coupons`
Get all coupons.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "coupons": [
    {
      "id": "coupon-id",
      "code": "SAVE10",
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "minPurchase": 100,
      "maxDiscount": 50,
      "usageLimit": 100,
      "usedCount": 25,
      "expiresAt": "2025-12-31T23:59:59Z",
      "isActive": true,
      "description": "10% off"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

---

### POST `/api/admin/coupons`
Create a new coupon.

**Request:**
```json
{
  "code": "SAVE10",
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "minPurchase": 100,
  "maxDiscount": 50,
  "usageLimit": 100,
  "expiresAt": "2025-12-31T23:59:59Z",
  "isActive": true,
  "description": "10% off on orders over 100 SAR"
}
```

**Response (201):**
```json
{
  "id": "coupon-id",
  "code": "SAVE10",
  "message": "Coupon created successfully"
}
```

---

### GET `/api/admin/coupons/[id]`
Get single coupon details.

**Response (200):**
```json
{
  "id": "coupon-id",
  "code": "SAVE10",
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "minPurchase": 100,
  "maxDiscount": 50,
  "usageLimit": 100,
  "usedCount": 25,
  "expiresAt": "2025-12-31T23:59:59Z",
  "isActive": true,
  "description": "10% off"
}
```

---

### PATCH `/api/admin/coupons/[id]`
Update coupon.

**Request:**
```json
{
  "isActive": false,
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": "coupon-id",
  "message": "Coupon updated successfully"
}
```

---

### DELETE `/api/admin/coupons/[id]`
Delete a coupon.

**Response (200):**
```json
{
  "message": "Coupon deleted successfully"
}
```

---

### GET `/api/admin/pricing`
Get current pricing settings (admin).

**Response (200):**
```json
{
  "id": "price-settings-singleton",
  "standardCertifiedPricePerPage": 49,
  "swornPricePerPage": 75,
  "standardMultiplier": 1.0,
  "nextDayMultiplier": 1.5,
  "sameDayMultiplier": 2.0,
  "hardCopyFee": 50,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z"
}
```

---

### PUT `/api/admin/pricing`
Update pricing settings.

**Request:**
```json
{
  "standardCertifiedPricePerPage": 49,
  "swornPricePerPage": 75,
  "standardMultiplier": 1.0,
  "nextDayMultiplier": 1.5,
  "sameDayMultiplier": 2.0,
  "hardCopyFee": 50
}
```

**Response (200):**
```json
{
  "id": "price-settings-singleton",
  "standardCertifiedPricePerPage": 49,
  "swornPricePerPage": 75,
  "standardMultiplier": 1.0,
  "nextDayMultiplier": 1.5,
  "sameDayMultiplier": 2.0,
  "hardCopyFee": 50,
  "updatedAt": "2025-01-27T10:00:00Z"
}
```

---

## Error Handling

All APIs follow a consistent error response format:

**Error Response (4xx/5xx):**
```json
{
  "error": "Error message",
  "details": {} // Optional additional error details
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate entry)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

---

## Rate Limiting

- Public APIs: 100 requests/minute per IP
- Admin APIs: 1000 requests/minute per authenticated user
- File Upload: 10 uploads/minute per IP

---

## CORS

Backend allows requests from:
- Development: `http://localhost:3000`
- Production: `https://halatranslate.com`

---

**Last Updated:** 2025-01-27  
**API Version:** v1

