import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { z } from "zod";

const paymentConfirmSchema = z.object({
  paymentUtr: z.string().max(40).optional(),
  paymentProofUrl: z.string().max(500).optional(),
  paymentNotes: z.string().max(250).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const ip = getClientIp(request);

    // Rate Limiting: 10 payment updates per 10 minutes per IP
    const limiter = rateLimit(`payment_confirm:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 10,
    });

    if (!limiter.success) {
      return NextResponse.json(
        { success: false, error: "Too many payment submission attempts. Please wait." },
        { status: 429 }
      );
    }

    const { orderNumber } = params;
    const body = await request.json();
    const parsed = paymentConfirmSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid payment confirmation data" },
        { status: 400 }
      );
    }

    const { paymentUtr, paymentProofUrl, paymentNotes } = parsed.data;
    const sanitizedUtr = paymentUtr ? sanitizeText(paymentUtr, 40) : null;
    const sanitizedNotes = paymentNotes ? sanitizeText(paymentNotes, 250) : null;
    const sanitizedProofUrl = paymentProofUrl ? sanitizeText(paymentProofUrl, 500) : null;

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber }, { id: orderNumber }],
      },
      include: {
        table: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Security rule: Never mark as PAID here! Mark status as PAYMENT_PENDING with paymentStatus: VERIFICATION_PENDING
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status === "NEW_ORDER" ? "PAYMENT_PENDING" : order.status,
        paymentStatus: "VERIFICATION_PENDING",
        paymentUtr: sanitizedUtr || order.paymentUtr,
        paymentProofUrl: sanitizedProofUrl || order.paymentProofUrl,
        paymentNotes: sanitizedNotes || order.paymentNotes,
      },
    });

    // Update payment record
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        status: "VERIFICATION_PENDING",
        transactionRef: sanitizedUtr || undefined,
        proofImageUrl: sanitizedProofUrl || undefined,
        notes: sanitizedNotes || undefined,
      },
      create: {
        orderId: order.id,
        amount: order.grandTotal,
        paymentMethod: "UPI_QR",
        status: "VERIFICATION_PENDING",
        transactionRef: sanitizedUtr || null,
        proofImageUrl: sanitizedProofUrl || null,
        notes: sanitizedNotes || null,
      },
    });

    // Notify Staff
    await prisma.notification.create({
      data: {
        type: "PAYMENT_RECEIVED",
        title: `Payment Claimed: #${order.orderNumber}`,
        message: `${order.customer.name} claimed payment for Table ${order.table.tableNumber}. UTR: ${sanitizedUtr || "None provided"}. Verification needed.`,
        link: `/admin/orders?order=${order.id}`,
        orderId: order.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment confirmation submitted. Awaiting manager verification.",
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
