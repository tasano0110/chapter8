"use client";

import Link from "next/link";
import React from "react";
import { useSupabaseSession } from "../_hooks/useSupabaseSession";
import { supabase } from "@/utils/supabase";

export const Header: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const { session, isLoding } = useSupabaseSession();

  return (
    <header className="bg-gray-600 text-white py-10 px-5">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white no-underline">
          Blog
        </Link>
        {!isLoding && (
          <div className="flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href="/admin"
                  className="text-white text-xl hover:text-gray-300 transition-colors duration-200 no-underline"
                >
                  管理画面
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white text-xl hover:text-gray-300 transition-colors duration-200"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/contact"
                  className="text-white text-xl hover:text-gray-300 transition-colors duration-200 no-underline"
                >
                  お問い合わせ
                </Link>
                <Link
                  href="/login"
                  className="text-white text-xl hover:text-gray-300 transition-colors duration-200 no-underline"
                >
                  ログイン
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
