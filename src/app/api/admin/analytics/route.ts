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
    const range = searchParams.get("range") || "30days"; // today, 7days, 30days, year, all

    const now = new Date();
    let startDate = new Date();

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7days") {
      startDate.setDate(now.getDate() - 7);
    } else if (range === "30days") {
      startDate.setDate(now.getDate() - 30);
    } else if (range === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate = new Date(0); // all
    }

    // All orders in the range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        items: {
          include: {
            foodItem: {
              include: {
                category: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalOrdersCount = orders.length;
    const paidOrders = orders.filter(
      (o) => o.paymentStatus === "PAID" || o.status === "COMPLETED"
    );

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const averageOrderValue =
      paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    const totalCustomers = await prisma.customer.count();
    const pendingOrdersCount = orders.filter((o) =>
      ["NEW_ORDER", "PAYMENT_PENDING", "PREPARING"].includes(o.status)
    ).length;
    const completedOrdersCount = orders.filter((o) => o.status === "COMPLETED").length;

    // Daily revenue chart data (last 7 or 14 points)
    const dailyMap = new Map<string, { date: string; revenue: number; orders: number }>();
    for (const o of paidOrders) {
      const d = new Date(o.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      const curr = dailyMap.get(d) || { date: d, revenue: 0, orders: 0 };
      curr.revenue += o.grandTotal;
      curr.orders += 1;
      dailyMap.set(d, curr);
    }
    const revenueTimeline = Array.from(dailyMap.values());

    // Best-selling items calculation
    const itemSalesMap = new Map<
      string,
      { name: string; category: string; quantity: number; revenue: number }
    >();

    for (const o of paidOrders) {
      for (const item of o.items) {
        const key = item.foodName;
        const curr = itemSalesMap.get(key) || {
          name: item.foodName,
          category: item.foodItem?.category?.name || "Specialty",
          quantity: 0,
          revenue: 0,
        };
        curr.quantity += item.quantity;
        curr.revenue += item.total;
        itemSalesMap.set(key, curr);
      }
    }

    const bestSellers = Array.from(itemSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Category performance
    const categorySalesMap = new Map<string, { category: string; revenue: number; count: number }>();
    for (const o of paidOrders) {
      for (const item of o.items) {
        const catName = item.foodItem?.category?.name || "Specialty Grills";
        const curr = categorySalesMap.get(catName) || {
          category: catName,
          revenue: 0,
          count: 0,
        };
        curr.revenue += item.total;
        curr.count += item.quantity;
        categorySalesMap.set(catName, curr);
      }
    }
    const categoryPerformance = Array.from(categorySalesMap.values());

    // Payment method breakdown
    const paymentBreakdown = {
      UPI_QR: paidOrders.filter((o) => o.paymentMethod === "UPI_QR").length,
      CASH: paidOrders.filter((o) => o.paymentMethod === "CASH").length,
      CARD: paidOrders.filter((o) => o.paymentMethod === "CARD").length,
    };

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalOrdersCount,
        averageOrderValue,
        totalCustomers,
        pendingOrdersCount,
        completedOrdersCount,
      },
      revenueTimeline,
      bestSellers,
      categoryPerformance,
      paymentBreakdown,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate analytics" }, { status: 500 });
  }
}

