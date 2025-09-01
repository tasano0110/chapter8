import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      postCategories: {
        include: {
          category: true,
        },
      },
    },
  });

  const formattedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    thumbnailImageKey: post.thumbnailImageKey,
    categories: post.postCategories.map((pc) => pc.category.name),
  }));

  return NextResponse.json(formattedPosts);
}
