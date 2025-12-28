# Backend Project Report

## Project Overview

**Project Name:** `translated-ksa-backend`  
**Type:** Next.js API Server + Admin Dashboard  
**Purpose:** Backend API and admin management system

---

## Technology Stack

- **Framework:** Next.js 15.2.4 (API Routes + Pages)
- **Database:** PostgreSQL (via Prisma)
- **ORM:** Prisma 6.16.1
- **Authentication:** JWT (jose)
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **Validation:** Zod
- **Password Hashing:** bcryptjs

---

## Project Structure

```
translated-ksa-backend/
├── app/
│   ├── api/                      # API Routes
│   │   ├── admin/               # Admin-only APIs
│   │   │   ├── coupons/
│   │   │   │   ├── route.ts     # GET, POST /api/admin/coupons
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET, PATCH, DELETE /api/admin/coupons/[id]
│   │   │   ├── pricing/
│   │   │   │   └── route.ts     # GET, PUT /api/admin/pricing
│   │   │   ├── requests/
│   │   │   │   ├── route.ts     # GET /api/admin/requests
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts # GET, PATCH /api/admin/requests/[id]
│   │   │   │       └── status/
│   │   │   │           └── route.ts # PUT /api/admin/requests/[id]/status
│   │   │   └── stats/
│   │   │       └── route.ts     # GET /api/admin/stats
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts     # POST /api/auth/login
│   │   │   ├── logout/
│   │   │   │   └── route.ts     # POST /api/auth/logout
│   │   │   └── me/
│   │   │       └── route.ts     # GET /api/auth/me
│   │   ├── coupons/
│   │   │   └── validate/
│   │   │       └── route.ts     # POST /api/coupons/validate
│   │   ├── pricing/
│   │   │   └── route.ts         # GET /api/pricing
│   │   ├── requests/
│   │   │   └── route.ts         # POST /api/requests (legacy)
│   │   ├── requests-with-files/
│   │   │   └── route.ts         # POST /api/requests-with-files
│   │   ├── upload/
│   │   │   └── route.ts         # POST /api/upload
│   │   ├── get-pdf-pages/
│   │   │   └── route.ts         # GET /api/get-pdf-pages
│   │   ├── get-pdf-words/
│   │   │   └── route.ts         # GET /api/get-pdf-words
│   │   ├── view-file/
│   │   │   └── route.ts         # GET /api/view-file
│   │   ├── download/
│   │   │   └── route.ts         # GET /api/download
│   │   ├── check-file/
│   │   │   └── route.ts         # GET, POST /api/check-file
│   │   └── generate-temp-id/
│   │       └── route.ts         # GET /api/generate-temp-id
│   ├── admin/                    # Admin Dashboard Pages
│   │   ├── layout.tsx           # Admin layout with sidebar
│   │   ├── login/
│   │   │   └── page.tsx         # Admin login page
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard home
│   │   ├── requests/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Request details page
│   │   ├── coupons/
│   │   │   └── page.tsx         # Coupons management
│   │   └── pricing/
│   │       └── page.tsx         # Pricing settings
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── lib/
│   ├── prisma.ts                # Prisma client instance
│   ├── auth.ts                  # JWT & password functions
│   ├── cloudinary.ts            # Cloudinary utilities
│   ├── cloudinary-utils.ts
│   ├── email.tsx                # Email templates & sending
│   ├── security.ts              # Security utilities
│   └── utils.ts                 # General utilities
├── components/
│   └── admin/                   # Admin dashboard components
│       ├── admin-sidebar.tsx
│       └── admin-layout-wrapper.tsx
├── hooks/
│   └── use-auth.tsx             # Auth hook for admin
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Database seed script
├── middleware.ts                # Next.js middleware (auth, CORS)
├── .env                         # Environment variables
├── package.json
└── tsconfig.json
```

---

## API Endpoints Summary

### Public APIs (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pricing` | Get pricing settings |
| POST | `/api/requests-with-files` | Submit translation request |
| POST | `/api/coupons/validate` | Validate coupon code |
| POST | `/api/upload` | Upload file to Cloudinary |
| GET | `/api/get-pdf-pages` | Get PDF page count |
| GET | `/api/get-pdf-words` | Get PDF word count |
| GET | `/api/view-file` | View file |
| GET | `/api/download` | Download file |
| GET | `/api/check-file` | Check file exists |
| POST | `/api/check-file` | Check file metadata |
| GET | `/api/generate-temp-id` | Generate temp ID |

### Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Admin logout |
| GET | `/api/auth/me` | Get current user |

### Admin APIs (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/requests` | List requests (with filters) |
| GET | `/api/admin/requests/[id]` | Get request details |
| PATCH | `/api/admin/requests/[id]` | Update request |
| PUT | `/api/admin/requests/[id]/status` | Update request status |
| GET | `/api/admin/stats` | Get dashboard statistics |
| GET | `/api/admin/coupons` | List coupons |
| POST | `/api/admin/coupons` | Create coupon |
| GET | `/api/admin/coupons/[id]` | Get coupon details |
| PATCH | `/api/admin/coupons/[id]` | Update coupon |
| DELETE | `/api/admin/coupons/[id]` | Delete coupon |
| GET | `/api/admin/pricing` | Get pricing settings |
| PUT | `/api/admin/pricing` | Update pricing settings |

---

## Database Schema

### Models

1. **User** - Admin users
   - id, email, password, name, role, timestamps

2. **TranslationRequest** - Translation orders
   - Customer info, translation details, file info, status, pricing, delivery info, coupon info

3. **StatusHistory** - Request status changes
   - requestId, status, notes, changedBy, timestamps

4. **Coupon** - Discount coupons
   - code, discountType, discountValue, limits, usage, expiration

5. **PriceSettings** - Pricing configuration (singleton)
   - Service prices, multipliers, hard copy fee

### Enums

- `Role`: ADMIN, SUPER_ADMIN
- `DocumentType`: LEGAL, MEDICAL, TECHNICAL, BUSINESS, ACADEMIC, PERSONAL, CERTIFIED, OTHER
- `Urgency`: STANDARD, URGENT, EXPRESS, SAME_DAY, NEXT_DAY
- `RequestStatus`: PENDING, UNDER_REVIEW, QUOTE_SENT, APPROVED, IN_PROGRESS, COMPLETED, DELIVERED, CANCELLED, ON_HOLD
- `DiscountType`: PERCENTAGE, FIXED

---

## Admin Dashboard Pages

### 1. Login (`/admin/login`)
- Admin authentication
- JWT token management

### 2. Dashboard (`/admin/dashboard`)
- Statistics overview
- Recent requests
- Revenue metrics
- Status distribution

### 3. Requests (`/admin/requests`)
- List all requests
- Filtering & search
- Status management
- Request details

### 4. Request Details (`/admin/requests/[id]`)
- Full request information
- Status updates
- Admin notes
- File viewing
- History tracking

### 5. Coupons (`/admin/coupons`)
- List all coupons
- Create/edit/delete coupons
- Usage tracking

### 6. Pricing (`/admin/pricing`)
- Manage pricing settings
- Service level prices
- Turnaround multipliers
- Hard copy fees

---

## Authentication & Authorization

### JWT Authentication
- Token stored in HTTP-only cookie (`admin-token`)
- Token contains: userId, email, role
- Expiration: 7 days (configurable)

### Middleware
- `middleware.ts` protects `/admin/*` routes
- Verifies JWT token
- Redirects to login if unauthorized

### Role-Based Access
- `ADMIN`: Full access
- `SUPER_ADMIN`: Full access + user management (future)

---

## File Management

### Cloudinary Integration
- All file uploads go to Cloudinary
- Files stored with organized folder structure
- Public URLs returned to frontend

### File Processing
- PDF page counting
- PDF word counting
- File validation
- Virus scanning (via Cloudinary)

---

## Email System

### Email Templates
- Request confirmation (customer)
- Admin notification (new request)
- Status update notifications (future)

### Configuration
- SMTP via Nodemailer
- HTML email templates
- Email queue (future)

---

## Environment Variables

### `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT
JWT_SECRET="your-secret-key-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# CORS
FRONTEND_URL="http://localhost:3000"
# Production: FRONTEND_URL="https://halatranslate.com"

# App
NODE_ENV="development"
```

---

## Security Features

1. **Password Hashing:** bcryptjs with salt rounds
2. **JWT Tokens:** Secure, HTTP-only cookies
3. **Input Sanitization:** All user inputs sanitized
4. **SQL Injection Prevention:** Prisma ORM
5. **XSS Prevention:** Input sanitization
6. **CORS:** Configured for frontend domain only
7. **Rate Limiting:** (To be implemented)
8. **File Validation:** Type and size checks

---

## Dependencies

### Production Dependencies
```json
{
  "next": "15.2.4",
  "@prisma/client": "6.16.1",
  "prisma": "6.16.1",
  "bcryptjs": "latest",
  "jose": "latest",
  "cloudinary": "latest",
  "nodemailer": "latest",
  "zod": "3.25.67",
  "react": "^19",
  "react-dom": "^19"
}
```

---

## Migration Checklist

### Phase 1: Setup
- [ ] Create new Next.js project
- [ ] Install all dependencies
- [ ] Copy Prisma schema
- [ ] Run migrations
- [ ] Set up environment variables

### Phase 2: API Routes
- [ ] Copy all API routes
- [ ] Update CORS configuration
- [ ] Test all endpoints
- [ ] Update error handling

### Phase 3: Admin Dashboard
- [ ] Copy admin pages
- [ ] Copy admin components
- [ ] Test authentication flow
- [ ] Test all admin features

### Phase 4: Testing
- [ ] Test all API endpoints
- [ ] Test admin dashboard
- [ ] Test file uploads
- [ ] Test email sending
- [ ] Load testing

### Phase 5: Deployment
- [ ] Set up production database
- [ ] Configure production environment
- [ ] Deploy API server
- [ ] Configure domain
- [ ] Set up monitoring

---

## API Documentation

See `API_DOCUMENTATION.md` for complete API reference.

---

## Notes

1. **CORS Configuration:** Must allow frontend domain
2. **Database:** Shared with frontend (read-only for frontend via API)
3. **File Storage:** All files in Cloudinary
4. **Authentication:** JWT in HTTP-only cookies
5. **Admin Routes:** Protected by middleware

---

**Created:** 2025-01-27  
**Status:** Planning Phase

