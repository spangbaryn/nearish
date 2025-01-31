import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Edit2 } from 'lucide-react'

interface SlugEditorProps {
  businessId: string
  currentSlug: string | null
}

export function SlugEditor({ businessId, currentSlug }: SlugEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [slug, setSlug] = useState(currentSlug || '')
  const queryClient = useQueryClient()

  const slugMutation = useMutation({
    mutationFn: async (newSlug: string) => {
      const res = await fetch(`/api/businesses/${businessId}/slug`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: newSlug })
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }
      
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', businessId] })
      setIsEditing(false)
      toast.success('URL updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  if (!isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input value={currentSlug || ''} readOnly className="flex-1" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        slugMutation.mutate(slug)
      }}
      className="space-y-2"
    >
      <Input
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase())}
        placeholder="enter-custom-url"
      />
      <div className="flex space-x-2">
        <Button 
          type="submit" 
          disabled={slugMutation.isPending}
        >
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsEditing(false)
            setSlug(currentSlug || '')
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
} 