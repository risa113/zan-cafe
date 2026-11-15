import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const settings = await prisma.restaurantSettings.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      success: true,
      order,
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

