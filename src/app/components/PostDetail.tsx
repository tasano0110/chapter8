"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Post } from "../types/Post";

interface PostDetailProps {
  id: string;
}

export default function PostDetail({ id }: PostDetailProps): React.JSX.Element {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPostDetail = async (): Promise<void> => {
      if (!id) return;

      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        const normalized: Post = {
          id: String(data.id),
          title: data.title,
          content: data.content,
          createdAt: data.createdAt,
          categories: (data.categories || []).map((c: any) =>
            typeof c === "string"
              ? { id: c, name: c }
              : { id: String(c.id), name: c.name }
          ),
        };
        setPost(normalized);
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetail();
  }, [id]);

  // 日付フォーマット関数をインラインで定義
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-10">
        <div className="text-center">読み込み中...</div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-10">
        <div className="text-center">記事が見つかりません。</div>
      </main>
    );
  }

  return (
    <>
      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-10 px-10">
        <article className="bg-white border border-gray-300 p-8">
          {/* サムネイル画像 */}
          {post.thumbnail && (
            <div className="mb-8">
              <Image
                src={post.thumbnail.url}
                alt={post.title}
                width={post.thumbnail.width}
                height={post.thumbnail.height}
                className="w-full h-64 object-cover rounded"
              />
            </div>
          )}

          {/* メタ情報 */}
          <div className="flex justify-between items-center mb-8">
            <time className="text-gray-500 text-sm">
              {formatDate(post.createdAt)}
            </time>
            <div className="flex gap-2.5">
              {(post.categories || []).map(
                (category: { id: string; name: string }) => (
                  <span
                    key={category.id}
                    className="px-3 py-1 rounded text-sm bg-gray-500 text-white font-medium tracking-wide"
                  >
                    {category.name}
                  </span>
                )
              )}
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-3xl font-bold mb-8 text-gray-900">
            {post.title}
          </h1>

          {/* 本文 */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed text-lg">
              {post.content}
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
