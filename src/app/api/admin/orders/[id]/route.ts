import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, status, rejectionReason, paymentNotes } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        table: true,
        items: true,
        payment: true,
        invoice: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Role-based authorization check
    if (action === "VERIFY_PAYMENT" || action === "REJECT_PAYMENT") {
      if (!["OWNER", "ADMIN", "BILLING_STAFF"].includes(session.role)) {
        return NextResponse.json(
          { success: false, error: "You do not have permission to verify payments." },
          { status: 403 }
        );
      }
    }

    let updatedOrder;

    if (action === "VERIFY_PAYMENT") {
      // 1. Verify Payment & advance order status
      const nextStatus =
        existingOrder.status === "NEW_ORDER" || existingOrder.status === "PAYMENT_PENDING"
          ? "ORDER_ACCEPTED"
          : existingOrder.status;

      updatedOrder = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: {
            paymentStatus: "PAID",
            status: nextStatus,
            verifiedByUserId: session.userId,
            verifiedAt: new Date(),
          },
        });

        // Update payment record
        await tx.payment.upsert({
          where: { orderId: id },
          update: {
            status: "COMPLETED",
            verifiedByUserId: session.userId,
            verifiedAt: new Date(),
          },
          create: {
            orderId: id,
            amount: existingOrder.grandTotal,
            paymentMethod: existingOrder.paymentMethod,
            status: "COMPLETED",
            verifiedByUserId: session.userId,
            verifiedAt: new Date(),
          },
        });

        // Synchronize with billing: create invoice if not yet existing
        const existingInvoice = await tx.invoice.findUnique({
          where: { orderId: id },
        });

        if (!existingInvoice) {
          const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          const invCount = await tx.invoice.count();
          const invNumber = `INV-${todayStr}-${String(invCount + 1).padStart(3, "0")}`;

          await tx.invoice.create({
            data: {
              invoiceNumber: invNumber,
              orderId: id,
              customerId: existingOrder.customerId,
              customerName: existingOrder.customer.name,
              customerPhone: existingOrder.customer.phone,
              customerEmail: existingOrder.customer.email,
              tableNumber: existingOrder.table.tableNumber,
              subtotal: existingOrder.subtotal,
              taxRate: existingOrder.taxPercentage,
              taxAmount: existingOrder.taxAmount,
              discountAmount: existingOrder.discountAmount,
              grandTotal: existingOrder.grandTotal,
              paymentMethod: existingOrder.paymentMethod,
              paymentStatus: "PAID",
            },
          });
        }

        // Audit Log
        await tx.auditLog.create({
          data: {
            userId: session.userId,
            action: "VERIFY_PAYMENT",
            entity: "Order",
            entityId: id,
            details: `Verified payment of ₹${existingOrder.grandTotal} for Order #${existingOrder.orderNumber}`,
          },
        });

        return ord;
      });
    } else if (action === "REJECT_PAYMENT") {
      updatedOrder = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: {
            paymentStatus: "REJECTED",
            rejectionReason: rejectionReason || "Payment screenshot or UTR could not be verified",
          },
        });

        await tx.payment.upsert({
          where: { orderId: id },
          update: {
            status: "REJECTED",
            notes: rejectionReason || null,
          },
          create: {
            orderId: id,
            amount: existingOrder.grandTotal,
            paymentMethod: existingOrder.paymentMethod,
            status: "REJECTED",
            notes: rejectionReason || null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: session.userId,
            action: "REJECT_PAYMENT",
            entity: "Order",
            entityId: id,
            details: `Rejected payment for Order #${existingOrder.orderNumber}: ${rejectionReason}`,
          },
        });

        return ord;
      });
    } else if (status) {
      // General status progression
      const dataToUpdate: any = { status };

      if (status === "PREPARING") {
        dataToUpdate.preparedAt = new Date();
      } else if (status === "COMPLETED") {
        dataToUpdate.completedAt = new Date();
      }

      updatedOrder = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: dataToUpdate,
        });

        // If completed and no invoice yet, ensure invoice exists
        if (status === "COMPLETED") {
          const inv = await tx.invoice.findUnique({ where: { orderId: id } });
          if (!inv) {
            const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const invCount = await tx.invoice.count();
            const invNumber = `INV-${todayStr}-${String(invCount + 1).padStart(3, "0")}`;

            await tx.invoice.create({
              data: {
                invoiceNumber: invNumber,
                orderId: id,
                customerId: existingOrder.customerId,
                customerName: existingOrder.customer.name,
                customerPhone: existingOrder.customer.phone,
                customerEmail: existingOrder.customer.email,
                tableNumber: existingOrder.table.tableNumber,
                subtotal: existingOrder.subtotal,
                taxRate: existingOrder.taxPercentage,
                taxAmount: existingOrder.taxAmount,
                discountAmount: existingOrder.discountAmount,
                grandTotal: existingOrder.grandTotal,
                paymentMethod: existingOrder.paymentMethod,
                paymentStatus: ord.paymentStatus,
              },
            });
          }
        }

        await tx.auditLog.create({
          data: {
            userId: session.userId,
            action: `ORDER_STATUS_${status}`,
            entity: "Order",
            entityId: id,
            details: `Updated Order #${existingOrder.orderNumber} status to ${status}`,
          },
        });

        return ord;
      });
    } else {
      return NextResponse.json({ success: false, error: "No valid action provided" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}

