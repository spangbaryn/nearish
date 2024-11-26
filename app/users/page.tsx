'use client'

import { useEffect, useState } from 'react'
import { UserRole } from '@/lib/roles'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  email: string
  created_at: string
  user_metadata: {
    role?: UserRole
  }
}

interface UserTableProps {
  users: User[]
}

// Helper function to get role from user data
function getUserRole(user: User): UserRole | undefined {
  return user.user_metadata?.role
}

// Separate table component for better organization
function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableCaption>A list of all users in the system.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const role = getUserRole(user)
          return (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {role ? (
                  <Badge variant={role === 'admin' ? 'destructive' : 'secondary'}>
                    {role}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">No role</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {/* Add actions here */}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// Loading state component
function LoadingState() {
  return <div className="p-4">Loading users...</div>
}

// Error state component
function ErrorState({ error, onRetry }: { error: string, onRetry: () => void }) {
  return (
    <div className="p-4">
      <div className="text-red-500 mb-4">Error: {error}</div>
      <Button onClick={onRetry}>
        Try Again
      </Button>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/users')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!Array.isArray(data?.users)) {
        throw new Error('Invalid response format')
      }

      setUsers(data.users)
    } catch (error) {
      console.error('Error loading users:', error)
      setError(error instanceof Error ? error.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={loadUsers} />

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <UserTable users={users} />
    </div>
  )
} 