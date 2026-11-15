import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const foodItemSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  description: z.string().min(5, "Description is required"),
  price: z.number().positive("Price must be greater than 0"),
  discountedPrice: z.number().nullable().optional(),
  image: z.string().min(1, "Image URL is required"),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isVeg: z.boolean().default(false),
  spicyLevel: z.number().min(0).max(3).default(0),
  preparationTimeMinutes: z.number().default(15),
  displayOrder: z.number().default(0),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.foodItem.findMany({
      orderBy: [{ categoryId: "asc" }, { displayOrder: "asc" }],
      include: {
        category: true,
      },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = foodItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
        "-" +
        Date.now().toString().slice(-4);

    const created = await prisma.foodItem.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        discountedPrice: data.discountedPrice || null,
        image: data.image,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        isPopular: data.isPopular,
        isVeg: data.isVeg,
        spicyLevel: data.spicyLevel,
        preparationTimeMinutes: data.preparationTimeMinutes,
        displayOrder: data.displayOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CREATE_FOOD_ITEM",
        entity: "FoodItem",
        entityId: created.id,
        details: `Created menu item: ${created.name} at ₹${created.price}`,
      },
    });

    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json({ success: false, error: "Failed to create food item" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Item ID is required" }, { status: 400 });
    }

    const updated = await prisma.foodItem.update({
      where: { id: body.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.categoryId ? { categoryId: body.categoryId } : {}),
        ...(body.description ? { description: body.description } : {}),
        ...(typeof body.price === "number" ? { price: body.price } : {}),
        ...(body.discountedPrice !== undefined ? { discountedPrice: body.discountedPrice } : {}),
        ...(body.image ? { image: body.image } : {}),
        ...(typeof body.isAvailable === "boolean" ? { isAvailable: body.isAvailable } : {}),
        ...(typeof body.isFeatured === "boolean" ? { isFeatured: body.isFeatured } : {}),
        ...(typeof body.isPopular === "boolean" ? { isPopular: body.isPopular } : {}),
        ...(typeof body.isVeg === "boolean" ? { isVeg: body.isVeg } : {}),
        ...(typeof body.spicyLevel === "number" ? { spicyLevel: body.spicyLevel } : {}),
        ...(typeof body.preparationTimeMinutes === "number"
          ? { preparationTimeMinutes: body.preparationTimeMinutes }
          : {}),
        ...(typeof body.displayOrder === "number" ? { displayOrder: body.displayOrder } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_FOOD_ITEM",
        entity: "FoodItem",
        entityId: updated.id,
        details: `Updated item ${updated.name} (Price: ₹${updated.price}, Available: ${updated.isAvailable})`,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json({ success: false, error: "Failed to update food item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const deleted = await prisma.foodItem.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DELETE_FOOD_ITEM",
        entity: "FoodItem",
        entityId: id,
        details: `Deleted menu item: ${deleted.name}`,
      },
    });

    return NextResponse.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete item" }, { status: 500 });
  }
}

