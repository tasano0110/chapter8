'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'
import { useSupabaseSession } from '../../../_hooks/useSupabaseSession'

interface Category {
  id: number
  name: string
}

interface PostFormData {
  title: string
  content: string
  thumbnailImageKey: string
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
  initialData,
  onSubmit,
  onDelete,
  loading,
  message
}: PostFormProps) {
  const router = useRouter()
  const { token } = useSupabaseSession()
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailImageKey || '')
  const [thumbnailImageKey, setThumbnailImageKey] = useState(initialData?.thumbnailImageKey || '')
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<null | string>(null)
  const [selectedCategories, setSelectedCategories] = useState<number[]>(initialData?.selectedCategories || [])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!token) return

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('カテゴリの取得に失敗しました:', error)
      }
    }

    fetchCategories()
  }, [token])

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setContent(initialData.content)
      setThumbnailUrl(initialData.thumbnailImageKey)
      setThumbnailImageKey(initialData.thumbnailImageKey)
      setSelectedCategories(initialData.selectedCategories)
    }
  }, [initialData])

  useEffect(() => {
    if (!thumbnailImageKey) return

    const fetcher = async () => {
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from('post_thumbnail')
        .getPublicUrl(thumbnailImageKey)

      setThumbnailImageUrl(publicUrl)
    }

    fetcher()
  }, [thumbnailImageKey])

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId])
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    }
  }

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length == 0) {
      return
    }

    const file = event.target.files[0]
    const filePath = `private/${uuidv4()}`

    const { data, error } = await supabase.storage
      .from('post_thumbnail')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      alert(error.message)
      return
    }

    setThumbnailImageKey(data.path)
  }

  const handleImageDelete = async () => {
    if (!thumbnailImageKey) return

    try {
      const { error } = await supabase.storage
        .from('post_thumbnail')
        .remove([thumbnailImageKey])

      if (error) {
        alert(error.message)
        return
      }

      setThumbnailImageKey('')
      setThumbnailImageUrl(null)
      setThumbnailUrl('')
    } catch (error) {
      console.error('画像の削除に失敗しました:', error)
      alert('画像の削除に失敗しました')
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
      thumbnailImageKey: thumbnailImageKey || thumbnailUrl.trim(),
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
          <label htmlFor="thumbnailImageKey" className="block text-sm font-medium text-gray-700 mb-2">
            サムネイル画像
          </label>
          <input
            type="file"
            id="thumbnailImageKey"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {thumbnailImageUrl && (
            <div className="mt-2">
              <div className="relative inline-block">
                <Image
                  src={thumbnailImageUrl}
                  alt="thumbnail"
                  width={400}
                  height={400}
                  className="object-cover rounded"
                />
                <button
                  type="button"
                  onClick={handleImageDelete}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  title="画像を削除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                画像を変更するには新しいファイルを選択してください
              </p>
            </div>
          )}
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