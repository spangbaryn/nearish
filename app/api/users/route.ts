import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

// Create a type-safe admin client
const createAdminClient = () => {
  return createClient<Database>(
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

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    })
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw new Error('Authentication error')
    if (!session) throw new Error('Not authenticated')

    const userRole = session.user.user_metadata?.role
    console.log('Current user role:', userRole)
    
    if (userRole !== 'admin') {
      throw new Error('Insufficient permissions')
    }

    // Get users list using admin client
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('Error from Supabase:', error)
      throw new Error('Failed to load users')
    }

    if (!data?.users) {
      throw new Error('No users data received')
    }

    // Transform the data to ensure we're using the correct metadata
    const transformedUsers = data.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      user_metadata: user.user_metadata || {},
      raw_user_meta_data: user.user_metadata || {}
    }))

    return NextResponse.json({ users: transformedUsers })
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