import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  phone: z
    .string()
    .min(10, "Please enter a valid 10-digit mobile number")
    .max(15)
    .regex(/^[0-9+ ]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  tableNumber: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, phone, email, tableNumber } = parsed.data;
    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);

    // Check if returning customer
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (customer) {
      // Returning customer: update visit count and last visit timestamp
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: name.trim(), // In case they updated spelling
          email: email?.trim() || customer.email,
          lastVisitAt: new Date(),
          totalVisits: { increment: 1 },
        },
      });
    } else {
      // New customer registration
      customer = await prisma.customer.create({
        data: {
          name: name.trim(),
          phone: cleanPhone,
          email: email?.trim() || null,
          totalVisits: 1,
          totalSpend: 0,
        },
      });
    }

    // If table number provided, log customer visit
    if (tableNumber) {
      const table = await prisma.restaurantTable.findUnique({
        where: { tableNumber },
      });
      if (table) {
        await prisma.customerVisit.create({
          data: {
            customerId: customer.id,
            tableId: table.id,
          },
        });
        // Mark table as occupied
        await prisma.restaurantTable.update({
          where: { id: table.id },
          data: { status: "OCCUPIED" },
        });
      }
    }

    // Return safe customer session data
    return NextResponse.json({
      success: true,
      isReturning: customer.totalVisits > 1,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        totalVisits: customer.totalVisits,
      },
    });
  } catch (error) {
    console.error("Customer register error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process customer registration" },
      { status: 500 }
    );
  }
}

