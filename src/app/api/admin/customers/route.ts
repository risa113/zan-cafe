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
    const search = searchParams.get("search");
    const dateRange = searchParams.get("dateRange");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (dateRange && dateRange !== "ALL") {
      const now = new Date();
      let fromDate = new Date();
      if (dateRange === "TODAY") {
        fromDate.setHours(0, 0, 0, 0);
      } else if (dateRange === "LAST_7_DAYS") {
        fromDate.setDate(now.getDate() - 7);
      } else if (dateRange === "LAST_30_DAYS") {
        fromDate.setDate(now.getDate() - 30);
      } else if (dateRange === "THIS_MONTH") {
        fromDate.setDate(1);
        fromDate.setHours(0, 0, 0, 0);
      }
      where.lastVisitAt = { gte: fromDate };
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { lastVisitAt: "desc" },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
            table: true,
          },
        },
        visits: {
          include: {
            table: true,
          },
        },
      },
    });

    const totalCustomers = await prisma.customer.count();
    const repeatCustomers = await prisma.customer.count({
      where: { totalVisits: { gt: 1 } },
    });

    return NextResponse.json({
      success: true,
      customers,
      stats: {
        totalCustomers,
        repeatCustomers,
        repeatRate: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 });
  }
}

