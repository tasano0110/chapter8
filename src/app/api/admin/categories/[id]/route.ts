import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
  const id = parseInt(params.id);

  const category = await prisma.category.findUnique({
    where: { id: id },
    include: {
      posts: {
        include: {
          post: true,
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const formattedCategory = {
    id: category.id,
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };

  return NextResponse.json(formattedCategory);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  const body = await request.json();

  const updatedCategory = await prisma.category.update({
    where: { id: id },
    data: {
      name: body.name,
    },
    include: {
      posts: {
        include: {
          post: true,
        },
      },
    },
  });

  if (!updatedCategory) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const formattedCategory = {
    id: updatedCategory.id,
    name: updatedCategory.name,
    createdAt: updatedCategory.createdAt,
    updatedAt: updatedCategory.updatedAt,
  };

  return NextResponse.json(formattedCategory);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  const deletedCategory = await prisma.category.delete({
    where: { id: id },
  });
  return NextResponse.json({ message: "Category deleted successfully" });
}
