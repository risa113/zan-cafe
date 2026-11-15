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
    const paymentStatus = searchParams.get("paymentStatus");

    const where: any = {};
    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = paymentStatus;
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { tableNumber: { contains: search } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            items: {
              include: {
                foodItem: true,
              },
            },
          },
        },
      },
    });

    // Summary metrics from actual database
    const allInvoices = await prisma.invoice.findMany();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayInvoices = allInvoices.filter(
      (inv) => new Date(inv.createdAt) >= today
    );

    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalTaxCollected = allInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

    return NextResponse.json({
      success: true,
      invoices,
      metrics: {
        todayRevenue,
        totalRevenue,
        totalTaxCollected,
        totalInvoicesCount: allInvoices.length,
        todayInvoicesCount: todayInvoices.length,
      },
    });
  } catch (error) {
    console.error("Billing GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load billing records" }, { status: 500 });
  }
}

