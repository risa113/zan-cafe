import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.restaurantSettings.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const updated = await prisma.restaurantSettings.upsert({
      where: { id: "default" },
      update: {
        ...(body.restaurantName ? { restaurantName: body.restaurantName } : {}),
        ...(body.tagline ? { tagline: body.tagline } : {}),
        ...(body.address ? { address: body.address } : {}),
        ...(body.phone ? { phone: body.phone } : {}),
        ...(body.email ? { email: body.email } : {}),
        ...(body.upiId ? { upiId: body.upiId } : {}),
        ...(body.upiQrImageUrl !== undefined ? { upiQrImageUrl: body.upiQrImageUrl } : {}),
        ...(typeof body.taxPercentage === "number" ? { taxPercentage: body.taxPercentage } : {}),
        ...(body.currencySymbol ? { currencySymbol: body.currencySymbol } : {}),
        ...(typeof body.isOrderingEnabled === "boolean"
          ? { isOrderingEnabled: body.isOrderingEnabled }
          : {}),
        ...(body.openingHours ? { openingHours: body.openingHours } : {}),
        ...(body.googleMapsEmbedUrl ? { googleMapsEmbedUrl: body.googleMapsEmbedUrl } : {}),
      },
      create: {
        id: "default",
        restaurantName: body.restaurantName || "Zan Cafe",
        tagline: body.tagline || "Artisanal Bistro & Gourmet Kitchen",
        address:
          body.address ||
          "36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005",
        phone: body.phone || "063693 13196",
        email: body.email || "contact@zancafe.in",
        upiId: body.upiId || "zancafe@upi",
        upiQrImageUrl: body.upiQrImageUrl || null,
        taxPercentage: body.taxPercentage ?? 5.0,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_SETTINGS",
        entity: "RestaurantSettings",
        entityId: "default",
        details: `Updated settings (UPI: ${updated.upiId}, Tax: ${updated.taxPercentage}%)`,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}

