"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PostForm from "../_components/PostForm";
import { useSupabaseSession } from "../../../_hooks/useSupabaseSession";

interface PostFormData {
  title: string;
  content: string;
  thumbnailImageKey: string;
  selectedCategories: number[];
}

export default function PostCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { token } = useSupabaseSession();

  const handleSubmit = async (data: PostFormData) => {
    if (!data.title.trim() || !data.content.trim()) {
      setMessage("タイトルと本文は必須です");
      return;
    }


    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
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
        setMessage("記事を作成しました");
        setTimeout(() => {
          router.push("/admin/posts");
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "作成に失敗しました");
      }
    } catch (error) {
      console.error("記事作成エラー:", error);
      setMessage("作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PostForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
      message={message}
    />
  );
}
