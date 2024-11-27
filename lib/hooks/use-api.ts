import { useCallback } from 'react'
import { ApiResponse, ApiError } from '@/types/api'

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export function useApi() {
  const fetchApi = useCallback(async <T>(
    endpoint: string, 
    options?: FetchOptions
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`/api${endpoint}`, {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      })

      const data = await response.json()

      if (data.error) {
        throw {
          code: data.error.code || 'unknown_error',
          message: data.error.message || 'An error occurred',
          status: response.status,
        } as ApiError
      }

      return { data } as ApiResponse<T>
    } catch (error) {
      if ((error as ApiError).code) {
        throw error
      }
      throw {
        code: 'unknown_error',
        message: error instanceof Error ? error.message : 'An error occurred',
        status: 500,
      } as ApiError
    }
  }, [])

  return { fetchApi }
} 