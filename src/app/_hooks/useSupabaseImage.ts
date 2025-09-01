'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export function useSupabaseImage(thumbnailImageKey: string | undefined) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!thumbnailImageKey) {
      setImageUrl(null)
      return
    }

    const fetchImageUrl = async () => {
      setLoading(true)
      try {
        const {
          data: { publicUrl },
        } = await supabase.storage
          .from('post_thumbnail')
          .getPublicUrl(thumbnailImageKey)

        setImageUrl(publicUrl)
      } catch (error) {
        console.error('Failed to fetch image URL:', error)
        setImageUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchImageUrl()
  }, [thumbnailImageKey])

  return { imageUrl, loading }
}