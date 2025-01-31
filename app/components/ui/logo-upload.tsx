"use client"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface LogoUploadProps {
  businessId: string
  currentLogo?: string | null
  onSuccess: (url: string) => void
  className?: string
}

export function LogoUpload({ businessId, currentLogo, onSuccess, className }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    try {
      const filePath = `${businessId}/logo.jpg`

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(filePath, file, { 
          upsert: true,
          contentType: 'image/jpeg'
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(filePath)

      onSuccess(publicUrl)
      toast.success("Logo updated successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to upload logo")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div 
      className={cn("group relative cursor-pointer", className)}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
        <div className="text-white flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span>{isUploading ? "Uploading..." : "Replace with different happy photo 😁"}</span>
        </div>
      </div>
    </div>
  )
} 