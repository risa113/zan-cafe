import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    const table = searchParams.get("table");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = paymentStatus;
    }

    if (table) {
      where.table = { tableNumber: table };
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { paymentUtr: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        customer: true,
        table: true,
        items: {
          include: {
            foodItem: true,
          },
        },
        payment: true,
        invoice: true,
        verifiedByUser: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Counts for quick KPI badge indicators
    const counts = {
      all: await prisma.order.count(),
      newOrders: await prisma.order.count({ where: { status: "NEW_ORDER" } }),
      paymentPending: await prisma.order.count({
        where: { paymentStatus: "VERIFICATION_PENDING" },
      }),
      kitchenActive: await prisma.order.count({
        where: { status: { in: ["ORDER_ACCEPTED", "PREPARING"] } },
      }),
      ready: await prisma.order.count({ where: { status: "ORDER_READY" } }),
      completed: await prisma.order.count({ where: { status: "COMPLETED" } }),
    };

    return NextResponse.json({
      success: true,
      orders,
      counts,
    });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

