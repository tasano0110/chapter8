'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import PostForm from '../_components/PostForm'

interface PostFormData {
  title: string
  content: string
  thumbnailUrl: string
  selectedCategories: number[]
}

export default function PostCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (data: PostFormData) => {
    if (!data.title.trim() || !data.content.trim()) {
      setMessage('タイトルと本文は必須です')
      return
    }

    if (data.thumbnailUrl && !data.thumbnailUrl.match(/^https?:\/\/.+/)) {
      setMessage('サムネイルURLは有効なURLを入力してください')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          thumbnailUrl: data.thumbnailUrl,
          categoryIds: data.selectedCategories,
        }),
      })

      if (response.ok) {
        setMessage('記事を作成しました')
        setTimeout(() => {
          router.push('/admin/posts')
        }, 1500)
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || '作成に失敗しました')
      }
    } catch (error) {
      console.error('記事作成エラー:', error)
      setMessage('作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <PostForm
        mode="create"
        onSubmit={handleSubmit}
        loading={loading}
        message={message}
      />
    </AdminLayout>
  )
}