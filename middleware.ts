import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { validateRequest } from "@/lib/security"

export async function middleware(request: NextRequest) {
  try {
    validateRequest(request)

    // Rate limiting headers
    const response = NextResponse.next()
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      // Skip login page
      if (request.nextUrl.pathname === "/admin/login") {
        return response
      }

      const token = request.cookies.get("admin-token")?.value

      if (!token) {
        // If accessing /admin without token, redirect to login
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }

      const payload = await verifyJWT(token)

      if (!payload) {
        // Invalid token, clear it and redirect to login
        const loginResponse = NextResponse.redirect(new URL("/admin/login", request.url))
        loginResponse.cookies.set("admin-token", "", { maxAge: 0 })
        return loginResponse
      }

      // If accessing /admin root with valid token, redirect to dashboard
      if (request.nextUrl.pathname === "/admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }

      // Check role-based access for specific routes
      if (request.nextUrl.pathname.startsWith("/admin/users") && payload.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
    }

    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      const token = request.cookies.get("admin-token")?.value

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const payload = await verifyJWT(token)

      if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.json({ error: "Security validation failed" }, { status: 400 })
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
