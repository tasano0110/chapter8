'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'

interface Category {
  id: number
  name: string
}

export default function CategoryEditPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`)
        if (response.ok) {
          const categoryData: Category = await response.json()
          setName(categoryData.name)
        } else {
          setMessage('カテゴリーの取得に失敗しました')
        }
      } catch (error) {
        console.error('カテゴリー取得エラー:', error)
        setMessage('カテゴリーの取得に失敗しました')
      } finally {
        setInitialLoading(false)
      }
    }

    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setMessage('カテゴリー名は必須です')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      })

      if (response.ok) {
        setMessage('カテゴリーを更新しました')
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('カテゴリー更新エラー:', error)
      setMessage('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこのカテゴリーを削除しますか？')) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('カテゴリーを削除しました')
        setTimeout(() => {
          router.push('/admin/categories')
        }, 1500)
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('カテゴリー削除エラー:', error)
      setMessage('削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <AdminLayout>
        <div>読み込み中...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">カテゴリー編集</h1>

        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('更新しました') || message.includes('削除しました')
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー名 *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              削除
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/categories')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              戻る
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}