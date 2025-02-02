import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function refreshSession() {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session) {
      // Force token refresh
      await supabase.auth.refreshSession()
      return true
    }
    return false
  } catch (error) {
    console.error('Error refreshing session:', error)
    return false
  }
}

export function clearAuthCookies() {
  // Clear specific auth cookies
  document.cookie = 'supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
} 