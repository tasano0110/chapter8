"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PostForm from "../_components/PostForm";
import { useSupabaseSession } from "../../../_hooks/useSupabaseSession";

interface Post {
  id: number;
  title: string;
  content: string;
  thumbnailImageKey: string;
  categories: { id: number; name: string }[];
}

interface PostFormData {
  title: string;
  content: string;
  thumbnailImageKey: string;
  selectedCategories: number[];
}

export default function PostEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { token } = useSupabaseSession();

  const [initialData, setInitialData] = useState<PostFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const postResponse = await fetch(`/api/admin/posts/${postId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        if (postResponse.ok) {
          const postData: Post = await postResponse.json();

          setInitialData({
            title: postData.title,
            content: postData.content,
            thumbnailImageKey: postData.thumbnailImageKey || "",
            selectedCategories: postData.categories.map((cat) => cat.id),
          });
        } else {
          setMessage("データの取得に失敗しました");
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
        setMessage("データの取得に失敗しました");
      } finally {
        setInitialLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId, token]);

  const handleSubmit = async (data: PostFormData) => {
    if (!data.title.trim() || !data.content.trim()) {
      setMessage("タイトルと本文は必須です");
      return;
    }


    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ?? "",
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          thumbnailImageKey: data.thumbnailImageKey,
          categoryIds: data.selectedCategories,
        }),
      });

      if (response.ok) {
        setMessage("記事を更新しました");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "更新に失敗しました");
      }
    } catch (error) {
      console.error("記事更新エラー:", error);
      setMessage("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ?? "",
        },
      });

      if (response.ok) {
        setMessage("記事を削除しました");
        setTimeout(() => {
          router.push("/admin/posts");
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "削除に失敗しました");
      }
    } catch (error) {
      console.error("記事削除エラー:", error);
      setMessage("削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <PostForm
      mode="edit"
      postId={postId}
      initialData={initialData || undefined}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      loading={loading}
      message={message}
    />
  );
}
