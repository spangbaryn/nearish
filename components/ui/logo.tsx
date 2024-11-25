'use client'

import Image from 'next/image'
import { cn } from '@/components/lib/utils'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
}

export function Logo({ 
  className,
  size = 'md'
}: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getLogoUrl() {
      try {
        // First check if logo exists
        const { data: files, error: listError } = await supabase
          .storage
          .from('assets')
          .list('logo')

        if (listError) {
          console.error('Error listing files:', listError)
          setError(true)
          return
        }

        console.log('Files in logo folder:', files)

        const logoFile = files.find(file => file.name === 'logo.svg')
        if (!logoFile) {
          console.log('Logo file not found')
          setError(true)
          return
        }

        // Get public URL with correct path
        const { data: { publicUrl } } = supabase
          .storage
          .from('assets')
          .getPublicUrl('logo/logo.svg')

        console.log('Logo URL:', publicUrl)
        setLogoUrl(publicUrl)
        setError(false)
      } catch (err) {
        console.error('Error fetching logo:', err)
        setError(true)
      }
    }

    getLogoUrl()
  }, [supabase])

  return (
    <div className={cn(
      "flex aspect-square items-center justify-center rounded-lg bg-primary",
      sizes[size],
      className
    )}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="Logo"
          width={size === 'lg' ? 48 : size === 'md' ? 40 : 32}
          height={size === 'lg' ? 48 : size === 'md' ? 40 : 32}
          className="object-contain p-1"
          onError={(e) => {
            console.error('Error loading image:', e)
            setError(true)
          }}
        />
      ) : (
        <div className="text-primary-foreground font-semibold">
          {error ? 'N' : '...'}
        </div>
      )}
    </div>
  )
} 