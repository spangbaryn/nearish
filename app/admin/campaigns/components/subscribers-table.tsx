import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface SubscribersTableProps {
  listId?: string
}

export function SubscribersTable({ listId }: SubscribersTableProps) {
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['list-subscribers', listId],
    queryFn: async () => {
      if (!listId) return []
      
      const { data, error } = await supabase
        .from('profile_list_subscriptions')
        .select(`
          profiles (
            email
          )
        `)
        .eq('list_id', listId)
        .is('unsubscribed_at', null)

      if (error) throw error
      return data?.map(sub => sub.profiles) || []
    },
    enabled: !!listId
  })

  if (!listId) {
    return (
      <p className="text-sm text-muted-foreground">
        Select an email list to view subscribers
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium mb-4">
        Subscribers ({subscribers?.length || 0})
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers?.map((subscriber: any) => (
            <TableRow key={subscriber.email}>
              <TableCell>{subscriber.email}</TableCell>
            </TableRow>
          ))}
          {subscribers?.length === 0 && (
            <TableRow>
              <TableCell className="text-center text-muted-foreground">
                No subscribers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 