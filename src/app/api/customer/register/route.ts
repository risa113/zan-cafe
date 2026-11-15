import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signCustomerToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  phone: z
    .string()
    .min(10, "Please enter a valid 10-digit mobile number")
    .max(15)
    .regex(/^[0-9+ ]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  tableNumber: z.string().max(20).optional(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Rate Limiting: 10 registrations per 10 minutes per IP
    const limiter = rateLimit(`customer_reg:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 10,
    });

    if (!limiter.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, phone, email, tableNumber } = parsed.data;
    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
    const sanitizedName = sanitizeText(name, 60);
    const sanitizedEmail = email ? sanitizeText(email.toLowerCase(), 100) : null;
    const cleanTable = tableNumber ? sanitizeText(tableNumber, 20) : null;

    // Check if returning customer
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (customer) {
      // Returning customer: update visit count and last visit timestamp
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: sanitizedName,
          email: sanitizedEmail || customer.email,
          lastVisitAt: new Date(),
          totalVisits: { increment: 1 },
        },
      });
    } else {
      // New customer registration
      customer = await prisma.customer.create({
        data: {
          name: sanitizedName,
          phone: cleanPhone,
          email: sanitizedEmail,
          totalVisits: 1,
          totalSpend: 0,
        },
      });
    }

    // If table number provided, log customer visit
    if (cleanTable) {
      const table = await prisma.restaurantTable.findUnique({
        where: { tableNumber: cleanTable },
      });
      if (table) {
        await prisma.customerVisit.create({
          data: {
            customerId: customer.id,
            tableId: table.id,
          },
        });
        // Mark table as occupied
        await prisma.restaurantTable.update({
          where: { id: table.id },
          data: { status: "OCCUPIED" },
        });
      }
    }

    // Issue cryptographic customer session token
    const customerToken = signCustomerToken({
      customerId: customer.id,
      phone: customer.phone,
      name: customer.name,
    });

    // Return safe customer session data
    const response = NextResponse.json({
      success: true,
      isReturning: customer.totalVisits > 1,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        totalVisits: customer.totalVisits,
      },
    });

    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: customerToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Customer register error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process customer registration" },
      { status: 500 }
    );
  }
}
