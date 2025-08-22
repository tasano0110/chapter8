'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
}

interface CategoryFormData {
  name: string
}

interface CategoryFormProps {
  mode: 'create' | 'edit'
  categoryId?: string
  initialData?: CategoryFormData
  onSubmit: (data: CategoryFormData) => Promise<void>
  onDelete?: () => Promise<void>
  loading: boolean
  message: string
}

export default function CategoryForm({
  mode,
  categoryId,
  initialData,
  onSubmit,
  onDelete,
  loading,
  message
}: CategoryFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name || '')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      return
    }

    await onSubmit({
      name: name.trim()
    })
  }

  const handleDelete = async () => {
    if (!confirm('本当にこのカテゴリーを削除しますか？')) {
      return
    }

    if (onDelete) {
      await onDelete()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {mode === 'create' ? 'カテゴリー作成' : 'カテゴリー編集'}
      </h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('成功') || message.includes('作成しました') || message.includes('更新しました') || message.includes('削除しました')
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
            placeholder={mode === 'create' ? 'カテゴリー名を入力してください' : ''}
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (mode === 'create' ? '作成中...' : '保存中...') : (mode === 'create' ? '作成' : '保存')}
          </button>
          
          {mode === 'edit' && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              削除
            </button>
          )}
          
          <button
            type="button"
            onClick={() => router.push('/admin/categories')}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            {mode === 'create' ? 'キャンセル' : '戻る'}
          </button>
        </div>
      </form>
    </div>
  )
}