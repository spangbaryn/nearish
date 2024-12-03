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
import { User } from "@/types/auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function UsersTable() {
  const router = useRouter()
  const { user: currentUser } = useAuth()

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Verify admin role before fetching all users
      if (currentUser?.role !== 'admin') {
        throw new Error('Unauthorized')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as User[]
    },
    enabled: currentUser?.role === 'admin' // Only run query if user is admin
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <div>Error loading users: {error.message}</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => (
          <TableRow 
            key={user.id} 
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => router.push(`/admin/users/${user.id}`)}
          >
            <TableCell>{user.email}</TableCell>
            <TableCell className="capitalize">{user.role}</TableCell>
            <TableCell>{user.metadata?.name || "—"}</TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 