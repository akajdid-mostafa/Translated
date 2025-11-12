import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin, createJWT } from "@/lib/auth"
import { sanitizeInput, validateEmail } from "@/lib/security"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"

    const now = Date.now()
    const attempts = loginAttempts.get(clientIP)

    if (attempts && attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1000) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 })
    }

    const body = await request.json()

    const email = sanitizeInput(body.email)
    const password = body.password

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const { email: validatedEmail, password: validatedPassword } = loginSchema.parse({ email, password })

    const user = await authenticateAdmin(validatedEmail, validatedPassword)

    if (!user) {
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientIP, { count: currentAttempts.count + 1, lastAttempt: now })

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    loginAttempts.delete(clientIP)

    const token = await createJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set secure HTTP-only cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
