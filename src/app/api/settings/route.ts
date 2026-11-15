import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await prisma.restaurantSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: {
          id: "default",
          restaurantName: "Zan Cafe",
          tagline: "Gourmet Bistro, Handcrafted Brews & Melapalayam Sizzle",
          address: "36B/A14, ROAD, Naniyar Nagar, Melapalayam, Tirunelveli, Tamil Nadu 627005",
          phone: "063693 13196",
          email: "contact@zancafe.in",
          upiId: "zancafe@upi",
          taxPercentage: 5.0,
          currencySymbol: "₹",
          isOrderingEnabled: true,
          openingHours: "Monday - Sunday: 11:30 AM - 11:30 PM",
          googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.918809187381!2d77.7289569!3d8.6992631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0413ec5ac275fb%3A0x9ad6e4c0f4e942bb!2sZan%20Cafe!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
        },
      });
    }

    const cmsContent = await prisma.websiteContent.findMany();

    return NextResponse.json({
      success: true,
      settings,
      cms: cmsContent.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>),
    });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json({ success: false, error: "Failed to load settings" }, { status: 500 });
  }
}

