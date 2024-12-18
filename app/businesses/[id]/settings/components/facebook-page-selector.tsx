"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface FacebookPage {
  id: string
  name: string
  access_token: string
}

interface PageSelectorProps {
  pages: FacebookPage[]
  onComplete: () => void
}

export function FacebookPageSelector({ pages, onComplete }: PageSelectorProps) {
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const params = useParams()
  const businessId = params.id as string
  const queryClient = useQueryClient()

  const handleSubmit = async () => {
    if (selectedPages.size === 0) {
      toast.error("Please select at least one page")
      return
    }

    setIsSubmitting(true)
    try {
      const selectedPageData = pages.filter(page => selectedPages.has(page.id))
      
      for (const page of selectedPageData) {
        const { data: connection, error: connectionError } = await supabase
          .from('business_social_connections')
          .upsert({
            business_id: businessId,
            platform: 'facebook',
            external_id: page.id,
            name: page.name,
          })
          .select()
          .single()

        if (connectionError) throw connectionError

        const { error: credentialsError } = await supabase
          .from('social_credentials')
          .insert({
            connection_id: connection.id,
            token: page.access_token,
            expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          })

        if (credentialsError) throw credentialsError
      }

      queryClient.invalidateQueries({
        queryKey: ['business-social-connections', businessId]
      })
      toast.success("Facebook pages connected successfully")
      onComplete()
    } catch (error) {
      toast.error("Failed to connect Facebook pages")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onComplete()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Facebook Pages</DialogTitle>
          <DialogDescription>
            Choose which pages you want to connect to your business
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center space-x-2">
              <Checkbox
                id={page.id}
                checked={selectedPages.has(page.id)}
                onCheckedChange={(checked) => {
                  const newSelected = new Set(selectedPages)
                  if (checked) {
                    newSelected.add(page.id)
                  } else {
                    newSelected.delete(page.id)
                  }
                  setSelectedPages(newSelected)
                }}
              />
              <label htmlFor={page.id} className="text-sm font-medium">
                {page.name}
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Connecting...
              </>
            ) : (
              'Connect Selected Pages'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 