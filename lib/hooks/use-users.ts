import { useState, useCallback, useRef, useEffect } from 'react'
import { useApi } from './use-api'
import { User, UsersResponse, ApiError } from '@/types/api'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { fetchApi } = useApi()
  const mountedRef = useRef(false)

  const loadUsers = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching users...')
      const response = await fetchApi<UsersResponse>('/users')
      
      if (!mountedRef.current) return
      
      if (!response.data?.users) {
        throw new Error('No users data received')
      }

      console.log('Setting users:', response.data.users)
      setUsers(response.data.users)
    } catch (err) {
      if (!mountedRef.current) return

      console.error('Error details:', err)
      const errorMessage = (err as ApiError).code 
        ? `${(err as ApiError).code}: ${(err as ApiError).message}`
        : (err as Error).message || 'An unknown error occurred'
      
      setError(errorMessage)
      console.error('Error loading users:', err)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [fetchApi])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    users,
    loading,
    error,
    loadUsers
  }
} 