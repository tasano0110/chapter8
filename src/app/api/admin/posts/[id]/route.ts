import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/utils/supabase";

const prisma = new PrismaClient();

type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
  const token = request.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ status: error.message }, { status: 400 });
  }
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
    thumbnailImageKey: post.thumbnailImageKey,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    categories: post.postCategories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
    })),
  };
  return NextResponse.json(formattedPost);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const token = request.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ status: error.message }, { status: 400 });
  }
  const id = parseInt(params.id);
  const body = await request.json();

  // まず既存のカテゴリー関連を全て削除
  await prisma.postCategory.deleteMany({
    where: {
      postId: id,
    },
  });

  const categoryIds: number[] = Array.isArray(body?.categoryIds)
    ? (body.categoryIds as unknown[]).filter(
        (v): v is number => typeof v === "number"
      )
    : [];

  // 記事を更新
  const updatedPost = await prisma.post.update({
    where: {
      id: id,
    },
    data: {
      title: body.title,
      content: body.content,
      thumbnailImageKey: body.thumbnailImageKey || "",
      postCategories:
        categoryIds.length > 0
          ? {
              create: categoryIds.map((categoryId: number) => ({ categoryId })),
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

  const formattedPost = {
    id: updatedPost.id,
    title: updatedPost.title,
    content: updatedPost.content,
    thumbnailImageKey: updatedPost.thumbnailImageKey,
    createdAt: updatedPost.createdAt,
    updatedAt: updatedPost.updatedAt,
    categories: updatedPost.postCategories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
    })),
  };

  return NextResponse.json(formattedPost);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const token = request.headers.get("Authorization") ?? "";
  const { error } = await supabase.auth.getUser(token);
  if (error) {
    return NextResponse.json({ status: error.message }, { status: 400 });
  }
  const id = parseInt(params.id);
  
  // 記事を取得してサムネイル画像のキーを確認
  const post = await prisma.post.findUnique({
    where: { id: id },
  });

  if (post && post.thumbnailImageKey) {
    // Supabaseから画像を削除
    await supabase.storage
      .from('post_thumbnail')
      .remove([post.thumbnailImageKey]);
  }

  const deletedPost = await prisma.post.delete({
    where: {
      id: id,
    },
  });

  return NextResponse.json({ message: "Post deleted successfully" });
}
