import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const featuredOnly = searchParams.get("featured") === "true";

    const categories = await prisma.foodCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        foodItems: {
          where: {
            isAvailable: true,
            ...(featuredOnly ? { isFeatured: true } : {}),
            ...(search
              ? {
                  OR: [
                    { name: { contains: search } },
                    { description: { contains: search } },
                  ],
                }
              : {}),
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    // If filtered by specific category slug
    const filtered = categorySlug
      ? categories.filter((c) => c.slug === categorySlug)
      : categories;

    // All available food items flat list
    const allItems = await prisma.foodItem.findMany({
      where: {
        isAvailable: true,
        ...(featuredOnly ? { isFeatured: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      categories: filtered,
      allItems,
    });
  } catch (error) {
    console.error("Menu API error:", error);
    return NextResponse.json({ success: false, error: "Failed to load menu" }, { status: 500 });
  }
}

