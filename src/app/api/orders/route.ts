import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signCustomerToken, CUSTOMER_COOKIE_NAME } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const orderInputSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required").max(30),
  customerName: z.string().min(2, "Name is required").max(80),
  customerPhone: z.string().min(10, "Valid phone number is required").max(20),
  customerEmail: z.string().email().max(100).optional().or(z.literal("")),
  customerNotes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        foodItemId: z.string().min(1).max(50),
        quantity: z.number().int().min(1).max(99),
        notes: z.string().max(250).optional(),
      })
    )
    .min(1, "At least one item is required in the cart")
    .max(50, "Order cannot exceed 50 distinct items"),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // Rate Limiting: 10 orders per 10 minutes per IP
    const limiter = rateLimit(`order_post:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 10,
    });

    if (!limiter.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Order rate limit reached. Please wait a few minutes before submitting another order.",
        },
        { status: 429 }
      );
    }

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
    const sanitizedCustomerName = sanitizeText(customerName, 80);
    const sanitizedEmail = customerEmail ? sanitizeText(customerEmail.toLowerCase(), 100) : null;
    const sanitizedCustomerNotes = customerNotes ? sanitizeText(customerNotes, 500) : null;

    // 1. Verify or create Customer
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: sanitizedCustomerName,
          phone: cleanPhone,
          email: sanitizedEmail,
          totalVisits: 1,
          totalSpend: 0,
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: sanitizedCustomerName,
          email: sanitizedEmail || customer.email,
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
        notes: cartItem.notes ? sanitizeText(cartItem.notes, 250) : null,
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
          customerNotes: sanitizedCustomerNotes,
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

    // Sign customer session cookie so customer can track their own order securely
    const customerToken = signCustomerToken({
      customerId: customer.id,
      phone: customer.phone,
      name: customer.name,
    });

    const response = NextResponse.json({
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

    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: customerToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}

