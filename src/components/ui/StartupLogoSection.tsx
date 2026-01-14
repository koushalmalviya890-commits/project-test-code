// 'use client'

// import { useCallback, useState } from 'react'
// import { useDropzone } from 'react-dropzone'
// import Image from 'next/image'
// import { UploadCloud, X, Loader2 } from 'lucide-react'
// import { cn } from '@/lib/utils'
// import { toast } from 'sonner'

// interface StartupLogoSectionProps {
//   imageUrl?: string | null
//   isEditing?: boolean
//   onChange: (url: string | null) => void
// }

// export function StartupLogoSection({
//   imageUrl,
//   isEditing = false,
//   onChange,
// }: StartupLogoSectionProps) {
//   const [isUploading, setIsUploading] = useState(false)

//   const uploadToS3 = async (file: File) => {
//     const response = await fetch('/api/upload', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ fileType: file.type }),
//     })

//     if (!response.ok) throw new Error('Failed to get upload URL')
//     const { url, key } = await response.json()

//     const uploadResponse = await fetch(url, {
//       method: 'PUT',
//       body: file,
//       headers: { 'Content-Type': file.type },
//     })

//     if (!uploadResponse.ok) throw new Error('Failed to upload file')

//     return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`
//   }

//   const handleRemove = async () => {
//     if (!imageUrl) return
//     const key = new URL(imageUrl).pathname.substring(1)

//     const response = await fetch('/api/upload', {
//       method: 'DELETE',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ fileKey: key }),
//     })

//     if (!response.ok) {
//       toast.error('Failed to remove logo')
//       return
//     }

//     onChange(null)
//     toast.success('Logo removed')
//   }

//   const onDrop = useCallback(
//     async (acceptedFiles: File[]) => {
//       try {
//         setIsUploading(true)
//         const url = await uploadToS3(acceptedFiles[0])
//         onChange(url)
//         toast.success('Logo uploaded successfully')
//       } catch (err) {
//         console.error(err)
//         toast.error('Upload failed')
//       } finally {
//         setIsUploading(false)
//       }
//     },
//     [onChange]
//   )

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
//     },
//     disabled: !isEditing || isUploading,
//     maxFiles: 1,
//   })

//   return (
//     <div className="flex items-start gap-6">
//       {/* Logo upload card */}
//       <div className="flex flex-col items-center space-y-2">
//         <div
//           {...(isEditing ? getRootProps() : {})}
//           className={cn(
//             'group relative flex h-32 w-32 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-center text-sm text-muted-foreground transition hover:bg-gray-100',
//             isDragActive && 'bg-blue-50 border-blue-300',
//             isEditing ? 'cursor-pointer' : 'cursor-default'
//           )}
//         >
//           <input {...getInputProps()} />

//           {isUploading ? (
//             <div className="flex flex-col items-center">
//               <Loader2 className="h-6 w-6 animate-spin mb-1" />
//               <span className="text-xs">Uploading...</span>
//             </div>
//           ) : imageUrl ? (
//             <Image
//               fill
//               src={imageUrl}
//               alt="Startup Logo"
//               className="object-cover rounded-md"
//             />
//           ) : (
//             <div className="flex flex-col items-center justify-center">
//               <UploadCloud className="mb-1 h-6 w-6" />
//               <span className="text-xs text-muted-foreground text-center">
//                 Startup Logo <br />
//                 This will be displayed on your profile
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Delete button shown outside image below */}
//         {isEditing && imageUrl && !isUploading && (
//           <button
//             onClick={handleRemove}
//             className="mt-1 flex items-center gap-1 text-xs text-rose-500 hover:underline"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StartupLogoSectionProps {
  imageUrl?: string | null
  isEditing?: boolean
  onChange: (url: string | null) => void
}

export function StartupLogoSection({
  imageUrl,
  isEditing = false,
  onChange,
}: StartupLogoSectionProps) {
  const [isUploading, setIsUploading] = useState(false)

  const uploadToS3 = async (file: File) => {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileType: file.type }),
    })

    if (!response.ok) throw new Error('Failed to get upload URL')
    const { url, key } = await response.json()

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })

    if (!uploadResponse.ok) throw new Error('Failed to upload file')

    return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`
  }

  const handleRemove = async () => {
    if (!imageUrl) return
    const key = new URL(imageUrl).pathname.substring(1)

    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileKey: key }),
    })

    if (!response.ok) {
      toast.error('Failed to remove logo')
      return
    }

    onChange(null)
    toast.success('Logo removed')
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true)
        const url = await uploadToS3(acceptedFiles[0])
        onChange(url)
        toast.success('Logo uploaded successfully')
      } catch (err) {
        console.error(err)
        toast.error('Upload failed')
      } finally {
        setIsUploading(false)
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    disabled: !isEditing || isUploading,
    maxFiles: 1,
  })

  return (
    <div className="flex items-start gap-6">
      {/* Logo upload card */}
      <div className="flex flex-col items-center space-y-2">
        <div
          {...(isEditing ? getRootProps() : {})}
          className={cn(
            'group relative flex h-32 w-32 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-center text-sm text-muted-foreground transition hover:bg-gray-100',
            isDragActive && 'bg-blue-50 border-blue-300',
            isEditing ? 'cursor-pointer' : 'cursor-default'
          )}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin mb-1" />
              <span className="text-xs">Uploading...</span>
            </div>
          ) : imageUrl ? (
            <>
              <Image
                fill
                src={imageUrl}
                alt="Startup Logo"
                className="object-cover rounded-md"
              />
              {isEditing && !isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow hover:bg-rose-100"
                >
                  <X className="h-4 w-4 text-rose-500" />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="mb-1 h-6 w-6" />
              <span className="text-xs text-muted-foreground text-center">
                Startup Logo <br />
                This will be displayed on your profile
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

