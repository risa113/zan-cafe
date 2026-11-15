import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, STAFF_COOKIE_NAME } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(100),
  password: z.string().min(1, "Password is required").max(128),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Rate Limiting: 5 attempts per 15 minutes per IP
    const limiter = rateLimit(`login:${ip}`, {
      windowMs: 15 * 60 * 1000,
      max: 5,
    });

    if (!limiter.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${limiter.resetInSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.resetInSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Timing-safe defense: prevent user enumeration by returning identical message
    if (!user || !user.isActive) {
      // Fake compare to mitigate timing side-channel attacks
      await comparePassword(password, "$2a$12$e8pYf5hDkYp2Qc8fA9zYbeYpZ2k8fA9zYbeYpZ2k8fA9zYbeYpZ2k");
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: STAFF_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login authentication error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication service temporarily unavailable" },
      { status: 500 }
    );
  }
}
