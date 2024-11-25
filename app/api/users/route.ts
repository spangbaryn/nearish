import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Create a type-safe admin client
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Validate user has admin access
const validateAdminAccess = async (supabase: ReturnType<typeof createRouteHandlerClient>) => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    throw new Error('Authentication error')
  }
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const userRole = session.user.user_metadata?.role
  if (userRole !== 'admin') {
    throw new Error('Insufficient permissions')
  }
}

export async function GET() {
  try {
    // Validate admin access
    const supabase = createRouteHandlerClient({ cookies })
    await validateAdminAccess(supabase)

    // Get users list
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      throw new Error('Failed to load users')
    }

    if (!data?.users) {
      throw new Error('No users data received')
    }

    return NextResponse.json({ users: data.users })
  } catch (error) {
    console.error('Error in users API route:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { 
      status: 
        message === 'Not authenticated' ? 401 :
        message === 'Insufficient permissions' ? 403 : 
        500 
    })
  }
} 