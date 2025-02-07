import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function refreshSession() {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      if (error.message.includes('Refresh Token Not Found')) {
        return false
      }
      console.error('Error getting session:', error)
      return false
    }
    
    if (!session?.refresh_token) {
      return false
    }
    
    if (session) {
      try {
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.error('Error refreshing session:', refreshError)
          return false
        }
        return true
      } catch (refreshError) {
        console.error('Error in refresh operation:', refreshError)
        return false
      }
    }
    return false
  } catch (error) {
    console.error('Error in refresh session:', error)
    return false
  }
}

export function clearAuthCookies() {
  const cookiesToClear = [
    'supabase-auth-token',
    'sb-access-token',
    'sb-refresh-token'
  ]

  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`
  })
}