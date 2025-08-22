'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
}

interface PostFormData {
  title: string
  content: string
  thumbnailUrl: string
  selectedCategories: number[]
}

interface PostFormProps {
  mode: 'create' | 'edit'
  postId?: string
  initialData?: PostFormData
  onSubmit: (data: PostFormData) => Promise<void>
  onDelete?: () => Promise<void>
  loading: boolean
  message: string
}

export default function PostForm({
  mode,
  postId,
  initialData,
  onSubmit,
  onDelete,
  loading,
  message
}: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '')
  const [selectedCategories, setSelectedCategories] = useState<number[]>(initialData?.selectedCategories || [])
  const [categories, setCategories] = useState<Category[]>([])

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
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setContent(initialData.content)
      setThumbnailUrl(initialData.thumbnailUrl)
      setSelectedCategories(initialData.selectedCategories)
    }
  }, [initialData])

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId])
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      return
    }

    if (thumbnailUrl && !thumbnailUrl.match(/^https?:\/\/.+/)) {
      return
    }

    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      selectedCategories
    })
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの記事を削除しますか？')) {
      return
    }

    if (onDelete) {
      await onDelete()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {mode === 'create' ? '記事作成' : '記事編集'}
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
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            タイトル *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            本文 *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
            サムネイルURL
          </label>
          <input
            type="url"
            id="thumbnailUrl"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリ
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
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
            onClick={() => router.push('/admin/posts')}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            {mode === 'create' ? 'キャンセル' : '戻る'}
          </button>
        </div>
      </form>
    </div>
  )
}