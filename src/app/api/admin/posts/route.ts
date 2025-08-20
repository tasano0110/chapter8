import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const posts = await prisma.post.findMany({
    orderBy: {
      updatedAt: "desc",
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
    thumbnailUrl: post.thumbnailUrl,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    categories: post.postCategories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
    })),
  }));

  return NextResponse.json(formattedPosts);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, content, thumbnailUrl } = body ?? {};

    if (!title || !content) {
      return NextResponse.json(
        { error: "'title' and 'content' are required." },
        { status: 400 }
      );
    }

    // Accept either `categoryIds: number[]` or `categories: number[] | {id:number}[]`
    let categoryIds: number[] = [];
    if (Array.isArray(body?.categoryIds)) {
      categoryIds = (body.categoryIds as unknown[]).filter(
        (id): id is number => typeof id === "number"
      );
    } else if (Array.isArray(body?.categories)) {
      categoryIds = (body.categories as unknown[])
        .map((c) => (typeof c === "number" ? c : (c as any)?.id))
        .filter((id: unknown): id is number => typeof id === "number");
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        thumbnailUrl: thumbnailUrl || "",
        postCategories:
          categoryIds.length > 0
            ? {
                create: categoryIds.map((id: number) => ({ categoryId: id })),
              }
            : undefined,
      },
      include: {
        postCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(newPost);
  } catch (error) {
    console.error("Failed to create post", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
