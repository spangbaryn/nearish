"use client"

import { MapPin, Phone, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"

interface PublicBusinessProfileProps {
  business: {
    id: string
    name: string
    brand_color: string
    logo_url: string
    place?: {
      formatted_address: string
      phone_number: string | null
      website: string | null
      logo_url: string | null
    } | null
  }
}

export function PublicBusinessProfile({ business }: PublicBusinessProfileProps) {
  return (
    <div>
      <div 
        className="h-[120px]" 
        style={{ backgroundColor: business.brand_color || '#000000' }} 
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8">
          <div className="relative -mt-12 mx-auto sm:mx-0 sm:-mt-8">
            {(business.logo_url || business.place?.logo_url) ? (
              <img
                src={business.logo_url || business.place?.logo_url || undefined}
                alt={business.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl border-4 border-background shadow-lg object-cover bg-white"
              />
            ) : null}
          </div>

          <div className="text-center sm:text-left pt-4 sm:pt-8 space-y-3 sm:space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{business.name}</h1>
            <div className="flex justify-center sm:justify-start gap-6 sm:gap-4">
              {business.place?.formatted_address && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(business.place?.formatted_address || '')
                    toast.success('Address copied to clipboard')
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <MapPin className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
              )}

              {business.place?.phone_number && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(business.place?.phone_number || '')
                    toast.success('Phone number copied to clipboard')
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <Phone className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
              )}

              {business.place?.website && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(business.place?.website || '')
                    toast.success('Website URL copied to clipboard')
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <Globe className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 