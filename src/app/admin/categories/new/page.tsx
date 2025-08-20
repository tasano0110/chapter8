'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'

export default function CategoryCreatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setMessage('カテゴリー名は必須です')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      })

      if (response.ok) {
        setMessage('カテゴリーを作成しました')
        setTimeout(() => {
          router.push('/admin/categories')
        }, 1500)
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || '作成に失敗しました')
      }
    } catch (error) {
      console.error('カテゴリー作成エラー:', error)
      setMessage('作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">カテゴリー作成</h1>

        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('作成しました') 
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
              placeholder="カテゴリー名を入力してください"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '作成中...' : '作成'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/categories')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}