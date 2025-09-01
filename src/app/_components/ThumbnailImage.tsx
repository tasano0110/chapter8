'use client'

import React from 'react'
import Image from 'next/image'
import { useSupabaseImage } from '../_hooks/useSupabaseImage'

interface ThumbnailImageProps {
  thumbnailImageKey?: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export default function ThumbnailImage({
  thumbnailImageKey,
  alt,
  width = 400,
  height = 200,
  className = '',
}: ThumbnailImageProps) {
  const { imageUrl, loading } = useSupabaseImage(thumbnailImageKey)

  if (!thumbnailImageKey || loading) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">
          {loading ? '読み込み中...' : 'サムネイルなし'}
        </span>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">画像が見つかりません</span>
      </div>
    )
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}