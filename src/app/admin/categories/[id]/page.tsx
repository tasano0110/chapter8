"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import CategoryForm from "../_components/CategoryForm";
import { useSupabaseSession } from "../../../_hooks/useSupabaseSession";

interface Category {
  id: number;
  name: string;
}

export default function CategoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { token } = useSupabaseSession();

  const [initialData, setInitialData] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
        if (response.ok) {
          const categoryData: Category = await response.json();
          setInitialData({ name: categoryData.name });
        } else {
          setMessage("カテゴリーの取得に失敗しました");
        }
      } catch (error) {
        console.error("カテゴリー取得エラー:", error);
        setMessage("カテゴリーの取得に失敗しました");
      } finally {
        setInitialLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, token]);

  const handleSubmit = async (data: { name: string }) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ?? "",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage("カテゴリーを更新しました");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "更新に失敗しました");
      }
    } catch (error) {
      console.error("カテゴリー更新エラー:", error);
      setMessage("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ?? "",
        },
      });

      if (response.ok) {
        setMessage("カテゴリーを削除しました");
        setTimeout(() => {
          router.push("/admin/categories");
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "削除に失敗しました");
      }
    } catch (error) {
      console.error("カテゴリー削除エラー:", error);
      setMessage("削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <CategoryForm
      mode="edit"
      categoryId={categoryId}
      initialData={initialData || undefined}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      loading={loading}
      message={message}
    />
  );
}
