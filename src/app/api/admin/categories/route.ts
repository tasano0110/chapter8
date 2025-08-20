import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      posts: true,
    },
  });

  const formattedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }));

  return NextResponse.json(formattedCategories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name: string | undefined = body?.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "'name' is required." },
        { status: 400 }
      );
    }

    const newCategory = await prisma.category.create({
      data: { name },
    });

    const formattedCategory = {
      id: newCategory.id,
      name: newCategory.name,
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt,
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error("Failed to create category", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
