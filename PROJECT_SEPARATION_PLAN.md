# Project Separation Plan

## Overview
This document outlines the plan to separate the current monolithic Next.js application into two independent projects:
1. **Frontend Project** - User-facing application that consumes APIs
2. **Backend Project** - API server + Admin Dashboard

---

## Current Architecture

### Monolithic Structure
```
Translated-ksa/
├── app/
│   ├── api/          # API Routes (Backend)
│   ├── admin/        # Admin Dashboard (Backend)
│   ├── page.tsx      # User Frontend
│   └── review-order/ # User Frontend
├── components/        # Shared components
└── lib/              # Shared utilities
```

---

## Target Architecture

### 1. Frontend Project (`translated-ksa-frontend`)
**Purpose:** User-facing application for customers to upload documents and place translation orders

**Technology Stack:**
- Next.js 15 (Frontend only)
- React 19
- TypeScript
- Tailwind CSS
- API Client (Axios/Fetch)

**Structure:**
```
frontend/
├── app/
│   ├── page.tsx              # Home page
│   ├── review-order/         # Order review
│   ├── submission-success/    # Success page
│   └── viewer/               # File viewer
├── components/
│   ├── document-upload-form-new.tsx
│   ├── header.tsx
│   ├── footer.tsx
│   └── ui/                    # UI components
├── lib/
│   ├── api-client.ts          # API client configuration
│   └── utils.ts
└── types/
    └── api.ts                 # API response types
```

**Features:**
- Document upload
- Order placement
- Order review
- File viewing
- Public pages (About, Services, FAQ)

**API Consumption:**
- All API calls will be made to backend server
- Environment variable: `NEXT_PUBLIC_API_URL`

---

### 2. Backend Project (`translated-ksa-backend`)
**Purpose:** API server + Admin Dashboard for managing translation requests

**Technology Stack:**
- Next.js 15 (API Routes + Admin Pages)
- Prisma ORM
- PostgreSQL Database
- JWT Authentication
- Cloudinary (File Storage)

**Structure:**
```
backend/
├── app/
│   ├── api/                   # All API endpoints
│   └── admin/                 # Admin dashboard pages
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   └── email.tsx
├── prisma/
│   └── schema.prisma
└── middleware.ts
```

**Features:**
- RESTful API endpoints
- Admin authentication
- Admin dashboard
- Request management
- Coupon management
- Pricing management
- Statistics & analytics

---

## Migration Strategy

### Phase 1: Preparation
1. ✅ Document all API endpoints
2. ✅ Create API client library
3. ✅ Identify shared dependencies
4. ✅ Plan environment variables

### Phase 2: Backend Setup
1. Create new backend project
2. Copy API routes (`app/api/**`)
3. Copy admin pages (`app/admin/**`)
4. Copy backend libraries (`lib/prisma.ts`, `lib/auth.ts`, etc.)
5. Copy Prisma schema and migrations
6. Set up environment variables
7. Test all API endpoints

### Phase 3: Frontend Setup
1. Create new frontend project
2. Copy user-facing pages
3. Copy user-facing components
4. Implement API client
5. Replace direct API calls with API client
6. Update environment variables
7. Test all user flows

### Phase 4: Deployment
1. Deploy backend to production
2. Update CORS settings
3. Deploy frontend to production
4. Update DNS/domain settings
5. Test end-to-end

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
# or in production:
# NEXT_PUBLIC_API_URL=https://api.halatranslate.com
```

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Email (Nodemailer)
SMTP_HOST="..."
SMTP_PORT="..."
SMTP_USER="..."
SMTP_PASS="..."

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## API Communication

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://api.halatranslate.com/api`

### Authentication
- Admin endpoints: JWT token in HTTP-only cookie
- Public endpoints: No authentication required

### CORS Configuration
Backend must allow requests from frontend domain:
```typescript
// middleware.ts or next.config
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

---

## Shared Resources

### Database
- Both projects will use the same PostgreSQL database
- Backend project owns Prisma schema
- Frontend only reads data via API

### File Storage
- Cloudinary account shared between projects
- Backend handles all file uploads
- Frontend receives file URLs from backend

---

## Benefits of Separation

1. **Independent Deployment**
   - Deploy frontend and backend separately
   - Scale independently
   - Update one without affecting the other

2. **Clear Separation of Concerns**
   - Frontend: UI/UX only
   - Backend: Business logic + Admin

3. **Better Security**
   - Admin dashboard isolated from public
   - API can have stricter security policies
   - Easier to implement rate limiting

4. **Team Collaboration**
   - Frontend and backend teams can work independently
   - Clear API contracts

5. **Technology Flexibility**
   - Can switch frontend framework if needed
   - Can switch backend framework if needed

---

## Next Steps

1. Review this plan
2. Create API documentation (see `API_DOCUMENTATION.md`)
3. Set up backend project structure
4. Set up frontend project structure
5. Implement API client in frontend
6. Test migration
7. Deploy

---

## Questions to Consider

- [ ] Should we use a monorepo (Turborepo/Nx) or separate repositories?
- [ ] Do we need API versioning?
- [ ] Should we implement API rate limiting?
- [ ] Do we need WebSocket for real-time updates?
- [ ] Should admin dashboard be a separate subdomain?

---

**Created:** 2025-01-27
**Status:** Planning Phase

