# Frontend Project Report

## Project Overview

**Project Name:** `translated-ksa-frontend`  
**Type:** Next.js Frontend Application  
**Purpose:** User-facing application for translation service customers

---

## Technology Stack

- **Framework:** Next.js 15.2.4
- **React:** 19
- **TypeScript:** 5.x
- **Styling:** Tailwind CSS 4.x
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **API Client:** Native Fetch API (or Axios)

---

## Project Structure

```
translated-ksa-frontend/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   ├── review-order/
│   │   └── page.tsx              # Order review page
│   ├── submission-success/
│   │   └── page.tsx              # Success page
│   └── viewer/
│       └── page.tsx              # File viewer page
├── components/
│   ├── document-upload-form-new.tsx  # Main upload form
│   ├── document-upload-form-wrapper.tsx
│   ├── header.tsx                # Site header
│   ├── footer.tsx                 # Site footer
│   ├── hero-section.tsx           # Homepage hero
│   ├── services-section.tsx       # Services display
│   ├── services-section2.tsx
│   ├── faq-section.tsx            # FAQ section
│   └── ui/                       # UI component library
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── select.tsx
│       └── ... (all shadcn/ui components)
├── lib/
│   ├── api-client.ts             # API client configuration
│   ├── utils.ts                  # Utility functions
│   └── pricing-calculator.ts     # Client-side price calculation
├── types/
│   └── api.ts                    # API response types
├── hooks/
│   └── use-toast.ts              # Toast notifications
├── public/
│   ├── images/
│   │   └── logo.svg
│   └── placeholder-logo.svg
├── .env.local                    # Environment variables
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Pages & Routes

### 1. Home Page (`/`)
**File:** `app/page.tsx`

**Components Used:**
- `HeroSection`
- `ServicesSection`
- `FAQSection`
- `Header`
- `Footer`

**Features:**
- Service introduction
- Call-to-action buttons
- FAQ section

---

### 2. Document Upload (`/`)
**Component:** `components/document-upload-form-new.tsx`

**Features:**
- File upload (drag & drop)
- Language selection (FROM/TO)
- Service level selection (Standard Certified / Sworn)
- Turnaround time selection
- Hard copy delivery option
- Special instructions
- Real-time price calculation
- Customer details form

**API Calls:**
- `GET /api/pricing` - Fetch pricing settings
- `POST /api/upload` - Upload file
- `GET /api/get-pdf-pages` - Get page count
- `POST /api/requests-with-files` - Submit order

---

### 3. Review Order (`/review-order`)
**File:** `app/review-order/page.tsx`

**Features:**
- Display order summary
- Edit customer information
- Edit turnaround time
- Edit hard copy delivery
- Review pricing breakdown
- Payment method selection
- Submit order

**Data Flow:**
- Receives order data via URL query parameters
- Displays order details
- Allows modifications
- Submits final order via API

**API Calls:**
- `GET /api/pricing` - Fetch pricing settings
- `POST /api/requests-with-files` - Submit final order

---

### 4. Submission Success (`/submission-success`)
**File:** `app/submission-success/page.tsx`

**Features:**
- Success message
- Order ID display
- Next steps information

---

### 5. File Viewer (`/viewer`)
**File:** `app/viewer/page.tsx`

**Features:**
- Display uploaded files
- PDF viewer
- File download

---

## Components

### Core Components

#### `document-upload-form-new.tsx`
Main document upload form component.

**Props:** None (self-contained)

**State Management:**
- Form data (languages, service level, turnaround, etc.)
- Uploaded files
- Pricing settings
- Price calculations

**Key Functions:**
- `handleFileUpload()` - Handle file upload
- `calculatePrice()` - Calculate order price
- `handleSubmit()` - Submit order

---

#### `header.tsx`
Site header with navigation.

**Features:**
- Logo
- Navigation links (About, Services, FAQ)
- Email/WhatsApp buttons

---

#### `footer.tsx`
Site footer.

**Features:**
- Company information
- Links
- Copyright

---

### UI Components (`components/ui/`)

All shadcn/ui components:
- Button, Input, Select, Card
- Dialog, Alert, Toast
- Form components
- Layout components

---

## API Client Implementation

### File: `lib/api-client.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async get(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      ...options,
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
    return this.handleResponse(response);
  }

  async postFormData(endpoint: string, formData: FormData) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

---

## Environment Variables

### `.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# In production:
# NEXT_PUBLIC_API_URL=https://api.halatranslate.com/api
```

---

## Dependencies

### Production Dependencies
```json
{
  "next": "15.2.4",
  "react": "^19",
  "react-dom": "^19",
  "typescript": "^5",
  "tailwindcss": "^4.1.9",
  "@radix-ui/react-*": "...",
  "lucide-react": "^0.454.0",
  "zod": "3.25.67"
}
```

### Removed Dependencies (Backend Only)
- `@prisma/client` - Database access (backend only)
- `bcryptjs` - Password hashing (backend only)
- `jose` - JWT (backend only)
- `nodemailer` - Email (backend only)
- `cloudinary` - File upload (backend only)
- `pdfjs-dist` - PDF processing (can be kept if needed for preview)

---

## Features to Implement

### 1. API Client
- [ ] Create `lib/api-client.ts`
- [ ] Implement all API methods
- [ ] Add error handling
- [ ] Add request interceptors
- [ ] Add response interceptors

### 2. Type Definitions
- [ ] Create `types/api.ts` with all API response types
- [ ] Type all API calls

### 3. Replace Direct API Calls
- [ ] Replace all `fetch('/api/...')` with `apiClient.get/post()`
- [ ] Update all API endpoints to use `NEXT_PUBLIC_API_URL`

### 4. Error Handling
- [ ] Implement global error handler
- [ ] Add error boundaries
- [ ] Add user-friendly error messages

### 5. Loading States
- [ ] Add loading indicators
- [ ] Add skeleton loaders

---

## Migration Checklist

### Phase 1: Setup
- [ ] Create new Next.js project
- [ ] Install dependencies
- [ ] Copy UI components
- [ ] Copy user-facing pages
- [ ] Set up environment variables

### Phase 2: API Integration
- [ ] Create API client
- [ ] Replace all API calls
- [ ] Test all API endpoints
- [ ] Handle errors

### Phase 3: Testing
- [ ] Test file upload
- [ ] Test order submission
- [ ] Test price calculation
- [ ] Test all user flows

### Phase 4: Deployment
- [ ] Build production bundle
- [ ] Deploy to hosting
- [ ] Configure domain
- [ ] Test in production

---

## Notes

1. **No Server-Side API Routes:** All API calls will be made to external backend
2. **No Database Access:** Frontend only consumes APIs
3. **No Admin Pages:** Admin dashboard stays in backend project
4. **Static Assets:** All images, logos stay in `public/`
5. **Client-Side Only:** No server-side data fetching (except for SEO if needed)

---

**Created:** 2025-01-27  
**Status:** Planning Phase

