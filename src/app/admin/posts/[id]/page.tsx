'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'

interface Category {
  id: number
  name: string
}

interface Post {
  id: number
  title: string
  content: string
  thumbnailUrl: string
  categories: { id: number; name: string }[]
}

export default function PostEditPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/admin/posts/${postId}`),
          fetch('/api/admin/categories')
        ])

        if (postResponse.ok && categoriesResponse.ok) {
          const postData: Post = await postResponse.json()
          const categoriesData: Category[] = await categoriesResponse.json()

          setTitle(postData.title)
          setContent(postData.content)
          setThumbnailUrl(postData.thumbnailUrl || '')
          setSelectedCategories(postData.categories.map(cat => cat.id))
          setCategories(categoriesData)
        } else {
          setMessage('データの取得に失敗しました')
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
        setMessage('データの取得に失敗しました')
      } finally {
        setInitialLoading(false)
      }
    }

    if (postId) {
      fetchData()
    }
  }, [postId])

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
      setMessage('タイトルと本文は必須です')
      return
    }

    if (thumbnailUrl && !thumbnailUrl.match(/^https?:\/\/.+/)) {
      setMessage('サムネイルURLは有効なURLを入力してください')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          categoryIds: selectedCategories,
        }),
      })

      if (response.ok) {
        setMessage('記事を更新しました')
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('記事更新エラー:', error)
      setMessage('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの記事を削除しますか？')) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('記事を削除しました')
        setTimeout(() => {
          router.push('/admin/posts')
        }, 1500)
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('記事削除エラー:', error)
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">記事編集</h1>

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
              onClick={() => router.push('/admin/posts')}
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