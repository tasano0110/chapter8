'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/AdminLayout'

interface Category {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('カテゴリの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div>読み込み中...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">カテゴリー一覧</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {categories.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            カテゴリがありません
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/admin/categories/${category.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                  <div className="text-sm text-gray-500">
                    作成日: {new Date(category.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}