import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await request.json();

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        printedCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, printedCount: invoice.printedCount });
  } catch (error) {
    console.error("Print count error:", error);
    return NextResponse.json({ success: false, error: "Failed to update print count" }, { status: 500 });
  }
}

