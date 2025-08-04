"use client";

import React, { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface Errors {
  name: string;
  email: string;
  message: string;
}

export default function Contact(): React.JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [errors, setErrors] = useState<Errors>({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    //エラーメッセージをクリア
    if (errors[e.target.name as keyof Errors]) {
      setErrors({ ...errors, [e.target.name as keyof Errors]: "" });
    }
  };

  //バリデーション関数
  const validateForm = (): boolean => {
    const newErrors: Errors = {
      name: "",
      email: "",
      message: "",
    };

    //nameのバリデーション
    if (!formData.name.trim()) {
      newErrors.name = "お名前は必須です。";
    } else if (formData.name.length > 30) {
      newErrors.name = "お名前は30文字以内で入力してください。";
    }

    //emailのバリデーション
    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスは必須です。";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "正しいメールアドレスの形式で入力してください。";
      }
    }

    //messageのバリデーション
    if (!formData.message.trim()) {
      newErrors.message = "本文は必須です。";
    } else if (formData.message.length > 500) {
      newErrors.message = "500文字以内で入力してください。";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.message;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    //バリデーションチェック
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const response = await fetch(
      "https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/contacts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.ok) {
      alert("送信しました");
      handleClear();
    }
    setIsLoading(false);
  };

  //クリアボタンによるフォームクリア処理
  const handleClear = (): void => {
    setFormData({ name: "", email: "", message: "" });
    setErrors({ name: "", email: "", message: "" });
  };

  return (
    <>
      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-16 px-10">
        <div className="bg-white">
          <h1 className="text-3xl font-bold mb-12 text-gray-900 text-center">
            問い合わせフォーム
          </h1>

          {/* お問い合わせフォーム */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* お名前 */}
            <div className="flex items-center gap-8">
              <label className="block text-lg font-medium text-gray-900 w-24 text-left">
                お名前
              </label>
              <div className="flex-1 w-full">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
            </div>

            {/* メールアドレス */}
            <div className="flex items-center gap-8">
              <label className="block text-lg font-medium text-gray-900 w-24 text-left">
                メールアドレス
              </label>
              <div className="flex-1 w-full">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
            </div>

            {/* 本文 */}
            <div className="flex gap-8">
              <label className="block text-lg font-medium text-gray-900 w-24 text-left pt-4">
                本文
              </label>
              <div className="flex-1 w-full">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={8}
                  className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg resize-none"
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm">{errors.message}</p>
                )}
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-center gap-4 pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 transition-colors duration-200 text-lg font-medium"
              >
                送信
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-300 text-gray-800 px-8 py-3 rounded-md hover:bg-gray-400 transition-colors duration-200 text-lg font-medium"
              >
                クリア
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
