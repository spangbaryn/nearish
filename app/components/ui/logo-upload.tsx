"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface LogoUploadProps {
  businessId: string
  currentLogo?: string
  onSuccess: (logoUrl: string) => void
  className?: string
}

export function LogoUpload({ businessId, currentLogo, onSuccess, className }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    try {
      // Always use .jpg extension for consistency
      const filePath = `${businessId}/logo.jpg`

      // Upload to storage with upsert: true to replace existing file
      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(filePath, file, { 
          upsert: true,
          contentType: 'image/jpeg'
        })

      if (uploadError) throw uploadError

      // Get public URL
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
    <Button
      variant="outline"
      size="sm"
      className={cn("relative", className)}
      disabled={isUploading}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept="image/*"
        onChange={handleUpload}
      />
      <Upload className="h-4 w-4 mr-2" />
      {isUploading ? "Uploading..." : currentLogo ? "Replace Logo" : "Upload Logo"}
    </Button>
  )
} 