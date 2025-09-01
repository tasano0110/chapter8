"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Post } from "../types/Post";
import ThumbnailImage from "../_components/ThumbnailImage";

type LocalCategory = string | { id: number | string; name: string };
type LocalPost = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  thumbnailImageKey?: string;
  categories: LocalCategory[];
};

export default function BlogApp(): React.JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        const res = await fetch("/api/posts");
        const data = (await res.json()) as LocalPost[];
        const normalized: Post[] = (data || []).map((p) => ({
          id: String(p.id),
          title: p.title,
          content: p.content,
          createdAt: p.createdAt,
          thumbnailImageKey: p.thumbnailImageKey,
          categories: (p.categories || []).map((c) =>
            typeof c === "string"
              ? { id: c, name: c }
              : { id: String(c.id), name: c.name }
          ),
        }));
        setPosts(normalized);
      } catch (err) {
        // エラーが発生した場合は空の配列のままにする
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 日付フォーマット関数をインラインで定義
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // ローディング状態
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-10 px-10">
        <div className="text-center">
          <p>読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto py-10 px-10">
        <div className="flex flex-col gap-5">
          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p>投稿がありません。</p>
            </div>
          ) : (
            posts.map((post: Post) => (
              <Link
                href={`/posts/${post.id}`}
                key={post.id}
                className="w-3/5 mx-auto bg-white border border-gray-300 p-5 block no-underline text-gray-900 hover:shadow-lg transition-shadow"
              >
                {/* サムネイル画像 */}
                {post.thumbnailImageKey && (
                  <div className="mb-4">
                    <ThumbnailImage
                      thumbnailImageKey={post.thumbnailImageKey}
                      alt={post.title}
                      width={600}
                      height={300}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
                {/* メタ情報（日付とカテゴリ） */}
                <div className="flex justify-between items-center mb-5">
                  <time className="text-gray-500 text-xs">
                    {formatDate(post.createdAt)}
                  </time>
                  <div className="flex gap-2.5">
                    {(post.categories || []).map(
                      (
                        category: { id: string; name: string },
                        index: number
                      ) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs bg-gray-500 text-white font-medium tracking-wide"
                        >
                          {category.name}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* タイトルと内容 */}
                <h2 className="text-xl font-bold mb-5">{post.title}</h2>
                <p className="text-gray-800 leading-relaxed">{post.content}</p>
              </Link>
            ))
          )}
        </div>
      </main>
    </>
  );
}
