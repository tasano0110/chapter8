"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../utils/supabase";
import { useSupabaseSession } from "../../_hooks/useSupabaseSession";
// AdminLayout is provided by app/admin/layout.tsx

interface Post {
  id: number;
  title: string;
  content: string;
  thumbnailImageKey: string;
  updatedAt: string;
  categories: { id: number; name: string }[];
}

interface ThumbnailState {
  [key: number]: string | null;
}

export default function PostsAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnailUrls, setThumbnailUrls] = useState<ThumbnailState>({});
  const { token } = useSupabaseSession();

  useEffect(() => {
    if (!token) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/admin/posts", {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data);

          // サムネイル画像のURLを取得（thumbnailImageKey を使用）
          const thumbnailPromises = data.map(async (post: Post) => {
            if (post.thumbnailImageKey) {
              const {
                data: { publicUrl },
              } = await supabase.storage
                .from("post_thumbnail")
                .getPublicUrl(post.thumbnailImageKey);
              return { postId: post.id, url: publicUrl };
            }
            return { postId: post.id, url: null };
          });

          const thumbnailResults = await Promise.all(thumbnailPromises);
          const thumbnailUrlMap = thumbnailResults.reduce(
            (acc: ThumbnailState, result) => {
              acc[result.postId] = result.url;
              return acc;
            },
            {}
          );

          setThumbnailUrls(thumbnailUrlMap);
        }
      } catch (error) {
        console.error("記事の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">記事一覧</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                サムネイル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                更新日
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {thumbnailUrls[post.id] ? (
                    <Image
                      src={thumbnailUrls[post.id]!}
                      alt={post.title}
                      width={80}
                      height={60}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-15 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">画像なし</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {post.categories.map((cat) => cat.name).join(", ")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(post.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            記事がありません
          </div>
        )}
      </div>
    </>
  );
}
