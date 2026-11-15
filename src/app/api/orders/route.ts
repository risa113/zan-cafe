import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderInputSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerNotes: z.string().optional(),
  items: z
    .array(
      z.object({
        foodItemId: z.string().min(1),
        quantity: z.number().int().min(1),
        notes: z.string().optional(),
      })
    )
    .min(1, "At least one item is required in the cart"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid order input" },
        { status: 400 }
      );
    }

    const { tableNumber, customerName, customerPhone, customerEmail, customerNotes, items } =
      parsed.data;

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "").slice(-10);

    // 1. Verify or create Customer
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName.trim(),
          phone: cleanPhone,
          email: customerEmail?.trim() || null,
          totalVisits: 1,
          totalSpend: 0,
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName.trim(),
          email: customerEmail?.trim() || customer.email,
          lastVisitAt: new Date(),
          totalVisits: { increment: 1 },
        },
      });
    }

    // 2. Verify Table
    let table = await prisma.restaurantTable.findUnique({
      where: { tableNumber },
    });

    if (!table) {
      // Find fallback table or create it
      table = await prisma.restaurantTable.findFirst({
        where: { isActive: true },
      });
      if (!table) {
        table = await prisma.restaurantTable.create({
          data: {
            tableNumber: "T-01",
            displayName: "Table 01 - Main Lounge",
            status: "OCCUPIED",
          },
        });
      }
    } else {
      await prisma.restaurantTable.update({
        where: { id: table.id },
        data: { status: "OCCUPIED" },
      });
    }

    // 3. Fetch Food Items from DB to verify price & availability
    const foodItemIds = items.map((i) => i.foodItemId);
    const dbFoodItems = await prisma.foodItem.findMany({
      where: {
        id: { in: foodItemIds },
        isAvailable: true,
      },
    });

    if (dbFoodItems.length !== foodItemIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Some items in your cart are currently unavailable or out of stock.",
        },
        { status: 400 }
      );
    }

    // Map items and compute subtotal
    let subtotal = 0;
    const validatedOrderItems = items.map((cartItem) => {
      const dbItem = dbFoodItems.find((f) => f.id === cartItem.foodItemId)!;
      const actualPrice = dbItem.discountedPrice || dbItem.price;
      const lineTotal = actualPrice * cartItem.quantity;
      subtotal += lineTotal;

      return {
        foodItemId: dbItem.id,
        foodName: dbItem.name,
        price: actualPrice,
        quantity: cartItem.quantity,
        total: lineTotal,
        notes: cartItem.notes || null,
      };
    });

    // 4. Calculate Tax & Total
    const settings = await prisma.restaurantSettings.findUnique({
      where: { id: "default" },
    });
    const taxPercentage = settings?.taxPercentage ?? 5.0;
    const taxAmount = Math.round(subtotal * (taxPercentage / 100) * 100) / 100;
    const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;

    // 5. Generate Order Number
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const todayOrdersCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const orderSequence = String(todayOrdersCount + 1).padStart(3, "0");
    const orderNumber = `ZAN-${todayStr}-${orderSequence}`;

    // 6. Create Order in Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          tableId: table.id,
          status: "NEW_ORDER",
          paymentStatus: "PENDING",
          paymentMethod: "UPI_QR",
          subtotal,
          taxPercentage,
          taxAmount,
          discountAmount: 0,
          grandTotal,
          customerNotes: customerNotes?.trim() || null,
          items: {
            create: validatedOrderItems,
          },
        },
        include: {
          items: true,
          table: true,
          customer: true,
        },
      });

      // Create initial Payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: grandTotal,
          paymentMethod: "UPI_QR",
          status: "PENDING",
        },
      });

      // Log Customer visit
      await tx.customerVisit.create({
        data: {
          customerId: customer.id,
          tableId: table.id,
          orderId: order.id,
        },
      });

      // Update customer totalSpend
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalSpend: { increment: grandTotal },
        },
      });

      // Create Staff Notification
      await tx.notification.create({
        data: {
          type: "NEW_ORDER",
          title: `New Order #${orderNumber}`,
          message: `${customer.name} placed order of ₹${grandTotal} at Table ${table.tableNumber}`,
          link: `/admin/orders?order=${order.id}`,
          orderId: order.id,
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        grandTotal: newOrder.grandTotal,
        subtotal: newOrder.subtotal,
        taxAmount: newOrder.taxAmount,
        tableNumber: table.tableNumber,
        tableName: table.displayName,
        status: newOrder.status,
        paymentStatus: newOrder.paymentStatus,
        createdAt: newOrder.createdAt,
      },
      upiPayment: {
        upiId: settings?.upiId || "zancafe@upi",
        merchantName: settings?.restaurantName || "Zan Cafe",
        amount: grandTotal,
        qrImageUrl: settings?.upiQrImageUrl || null,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}

