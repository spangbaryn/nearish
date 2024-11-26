'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
}

export function Logo({ size = 'md', className, ...props }: LogoProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchLogo() {
      try {
        // First check if logo exists
        const { data: files, error: listError } = await supabase
          .storage
          .from('assets')
          .list('logo')

        if (listError) {
          console.error('Error listing files:', listError)
          return
        }

        const logoFile = files.find(file => file.name === 'logo.svg')
        if (!logoFile) {
          console.log('Logo file not found')
          return
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('assets')
          .getPublicUrl('logo/logo.svg')

        setImageUrl(publicUrl)
      } catch (err) {
        console.error('Error fetching logo:', err)
      }
    }

    fetchLogo()
  }, [supabase])

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-md bg-primary',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Logo"
          className="aspect-square h-full w-full"
          width={40}
          height={40}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-lg font-bold text-primary-foreground">N</span>
        </div>
      )}
    </div>
  )
} 