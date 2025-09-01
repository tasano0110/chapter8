"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryForm from "../_components/CategoryForm";
import { useSupabaseSession } from "../../../_hooks/useSupabaseSession";

export default function CategoryCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { token } = useSupabaseSession();

  const handleSubmit = async (data: { name: string }) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ?? "",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage("カテゴリーを作成しました");
        setTimeout(() => {
          router.push("/admin/categories");
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "作成に失敗しました");
      }
    } catch (error) {
      console.error("カテゴリー作成エラー:", error);
      setMessage("作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CategoryForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
      message={message}
    />
  );
}
