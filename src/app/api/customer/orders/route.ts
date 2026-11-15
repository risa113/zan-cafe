import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getCustomerSession } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);

    // Rate limiting: max 30 order lookups per 5 minutes per IP
    const limiter = rateLimit(`customer_orders:${ip}`, {
      windowMs: 5 * 60 * 1000,
      max: 30,
    });

    if (!limiter.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedPhone = searchParams.get("phone");

    // Authenticate: Either staff member OR verified customer session
    const staffSession = await getSession();
    const customerSession = await getCustomerSession();

    let targetPhone: string | null = null;

    if (staffSession && ["OWNER", "ADMIN", "BILLING_STAFF"].includes(staffSession.role)) {
      // Authorized staff may look up any customer by phone
      targetPhone = requestedPhone ? requestedPhone.replace(/[^0-9]/g, "").slice(-10) : null;
    } else if (customerSession) {
      // Verified customer may only access their own phone records
      targetPhone = customerSession.phone;
    } else if (requestedPhone) {
      // Fallback for first-time session setup: clean phone
      targetPhone = requestedPhone.replace(/[^0-9]/g, "").slice(-10);
    }

    if (!targetPhone) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view order history" },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { phone: targetPhone },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
            table: true,
            invoice: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        customer: null,
        orders: [],
      });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        totalVisits: customer.totalVisits,
        totalSpend: customer.totalSpend,
        firstVisitAt: customer.firstVisitAt,
        lastVisitAt: customer.lastVisitAt,
      },
      orders: customer.orders,
    });
  } catch (error) {
    console.error("Customer orders lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to look up customer orders" },
      { status: 500 }
    );
  }
}
