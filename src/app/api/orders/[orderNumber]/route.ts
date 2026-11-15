import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { maskPhone, maskEmail } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: orderNumber }, { id: orderNumber }],
      },
      include: {
        items: true,
        table: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        payment: true,
        invoice: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const staffSession = await getSession();
    const isStaff = staffSession && ["OWNER", "ADMIN", "BILLING_STAFF", "KITCHEN_STAFF"].includes(staffSession.role);

    // If not staff, mask customer PII to prevent data harvesting
    const sanitizedCustomer = order.customer
      ? {
          id: order.customer.id,
          name: order.customer.name,
          phone: isStaff ? order.customer.phone : maskPhone(order.customer.phone),
          email: isStaff ? order.customer.email : maskEmail(order.customer.email),
        }
      : null;

    const settings = await prisma.restaurantSettings.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        customer: sanitizedCustomer,
      },
      settings: {
        restaurantName: settings?.restaurantName || "Zan Cafe",
        phone: settings?.phone || "063693 13196",
        upiId: settings?.upiId || "zancafe@upi",
        upiQrImageUrl: settings?.upiQrImageUrl || null,
      },
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve order details" },
      { status: 500 }
    );
  }
}
