import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const paymentConfirmSchema = z.object({
  paymentUtr: z.string().optional(),
  paymentProofUrl: z.string().optional(),
  paymentNotes: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
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
        paymentUtr: paymentUtr || order.paymentUtr,
        paymentProofUrl: paymentProofUrl || order.paymentProofUrl,
        paymentNotes: paymentNotes || order.paymentNotes,
      },
    });

    // Update payment record
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        status: "VERIFICATION_PENDING",
        transactionRef: paymentUtr || null,
        proofImageUrl: paymentProofUrl || null,
        notes: paymentNotes || null,
      },
      create: {
        orderId: order.id,
        amount: order.grandTotal,
        paymentMethod: "UPI_QR",
        status: "VERIFICATION_PENDING",
        transactionRef: paymentUtr || null,
        proofImageUrl: paymentProofUrl || null,
        notes: paymentNotes || null,
      },
    });

    // Create Admin notification for payment verification
    await prisma.notification.create({
      data: {
        type: "PAYMENT_PROOF",
        title: `Payment Submitted: #${order.orderNumber}`,
        message: `${order.customer.name} (Table ${order.table.tableNumber}) submitted UPI verification for ₹${order.grandTotal}.`,
        link: `/admin/orders?order=${order.id}`,
        orderId: order.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment proof received. Awaiting restaurant verification.",
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
      { success: false, error: "Failed to record payment confirmation" },
      { status: 500 }
    );
  }
}

