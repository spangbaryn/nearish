import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, X } from "lucide-react"

interface PendingInvite {
  id: string
  email: string
  role: string
  created_at: string
}

export function PendingInvites({ businessId }: { businessId: string }) {
  const { data: invites, isLoading, refetch } = useQuery({
    queryKey: ['pending-invites', businessId],
    queryFn: async () => {
      const response = await fetch(`/api/businesses/${businessId}/invites`)
      if (!response.ok) throw new Error('Failed to fetch invites')
      return response.json() as Promise<PendingInvite[]>
    }
  })

  const cancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/businesses/invite/${inviteId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to cancel invitation')
      toast.success('Invitation cancelled')
      refetch()
    } catch (error) {
      toast.error('Failed to cancel invitation')
    }
  }

  if (isLoading) return null

  if (!invites?.length) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
      <div className="space-y-2">
        {invites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{invite.email}</p>
                <p className="text-sm text-muted-foreground capitalize">{invite.role}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => cancelInvite(invite.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 