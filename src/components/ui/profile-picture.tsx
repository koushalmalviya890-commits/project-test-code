'use client'

import Image from 'next/image'
import { ImageUpload } from './image-upload'
import { UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfilePictureProps {
  imageUrl?: string | null
  size?: number
  isEditing?: boolean
  onImageChange?: (urls: string[]) => void
  onImageRemove?: () => void
  className?: string
}

export function ProfilePicture({
  imageUrl,
  size = 128,
  isEditing = false,
  onImageChange,
  onImageRemove,
  className
}: ProfilePictureProps) {
  if (isEditing) {
    return (
      <div className={cn("w-full max-w-[256px]", className)}>
        <ImageUpload
          value={imageUrl ? [imageUrl] : []}
          onChange={(urls) => {
            if (onImageChange) onImageChange(urls);
          }}
          onRemove={(url) => {
            if (onImageRemove) onImageRemove();
          }}
          disabled={false}
        />
      </div>
    )
  }

  // Most basic implementation possible to avoid hydration mismatches
  return (
    <div className="relative w-full h-full rounded-full overflow-hidden bg-muted">
      <div className="flex items-center justify-center w-full h-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile Picture"
            fill
            sizes={`${size}px`}
            priority
            className="object-cover"
          />
        ) : (
          <UserCircle className="w-3/4 h-3/4 text-muted-foreground" />
        )}
      </div>
    </div>
  )
} 