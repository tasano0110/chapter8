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

  const post = await prisma.post.findUnique({
    where: { id: id },
    include: {
      postCategories: {
        include: {
          category: true,
        },
      },
    },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const formattedPost = {
    id: post.id,
    title: post.title,
    content: post.content,
    thumbnailUrl: post.thumbnailUrl,
    createdAt: post.createdAt,
    categories: post.postCategories.map((pc) => pc.category.name),
  };

  return NextResponse.json(formattedPost);
}
