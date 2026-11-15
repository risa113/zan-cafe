import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tables = await prisma.restaurantTable.findMany({
      orderBy: { tableNumber: "asc" },
      include: {
        orders: {
          where: {
            status: { in: ["NEW_ORDER", "PAYMENT_PENDING", "PREPARING", "ORDER_READY"] },
          },
          select: {
            id: true,
            orderNumber: true,
            grandTotal: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Attach QR code image data URL for each table
    const tablesWithQR = await Promise.all(
      tables.map(async (table) => {
        const orderUrl = `${origin}/menu?table=${table.tableNumber}`;
        const qrCodeDataUrl = await QRCode.toDataURL(orderUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: "#171310",
            light: "#FFFFFF",
          },
        });

        return {
          ...table,
          orderUrl,
          qrCodeDataUrl,
          activeOrdersCount: table.orders.length,
        };
      })
    );

    return NextResponse.json({ success: true, tables: tablesWithQR });
  } catch (error) {
    console.error("Tables GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { tableNumber, displayName, capacity, locationDesc } = await request.json();

    if (!tableNumber || !displayName) {
      return NextResponse.json(
        { success: false, error: "Table number and display name are required" },
        { status: 400 }
      );
    }

    const cleanTableNum = tableNumber.toUpperCase().trim();

    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber: cleanTableNum,
        displayName,
        capacity: capacity || 4,
        locationDesc: locationDesc || null,
        status: "AVAILABLE",
        qrCodeData: `/menu?table=${cleanTableNum}`,
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error("Create table error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create table. Number must be unique." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, displayName, capacity, locationDesc, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Table ID is required" }, { status: 400 });
    }

    const table = await prisma.restaurantTable.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(displayName ? { displayName } : {}),
        ...(typeof capacity === "number" ? { capacity } : {}),
        ...(locationDesc !== undefined ? { locationDesc } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update table" }, { status: 500 });
  }
}

