import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.websiteContent.findMany({
      orderBy: [{ section: "asc" }, { key: "asc" }],
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch CMS content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ success: false, error: "Key is required" }, { status: 400 });
    }

    const updated = await prisma.websiteContent.update({
      where: { key },
      data: { value },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update CMS error:", error);
    return NextResponse.json({ success: false, error: "Failed to update content" }, { status: 500 });
  }
}

