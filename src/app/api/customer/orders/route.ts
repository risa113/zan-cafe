import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Customer phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);

    const customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
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

