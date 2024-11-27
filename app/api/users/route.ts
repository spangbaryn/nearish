import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'
import { 
  ApiError, 
  UsersResponse, 
  API_ERROR_CODES 
} from '@/types/api'

const createApiError = (
  code: string,
  message: string,
  status = 400
): ApiError => ({
  code,
  message,
  status
})

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

export async function GET(): Promise<NextResponse<UsersResponse>> {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    })
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw createApiError(
        API_ERROR_CODES.AUTHENTICATION,
        'Authentication error',
        401
      )
    }
    
    if (!session) {
      throw createApiError(
        API_ERROR_CODES.AUTHENTICATION,
        'Not authenticated',
        401
      )
    }

    const userRole = session.user.user_metadata?.role
    
    if (userRole !== 'admin') {
      throw createApiError(
        API_ERROR_CODES.AUTHORIZATION,
        'Insufficient permissions',
        403
      )
    }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      throw createApiError(
        API_ERROR_CODES.SERVER_ERROR,
        'Failed to load users',
        500
      )
    }

    if (!data?.users) {
      throw createApiError(
        API_ERROR_CODES.NOT_FOUND,
        'No users data received',
        404
      )
    }

    const transformedUsers = data.users.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
      user_metadata: user.user_metadata || {},
      raw_user_meta_data: user.user_metadata || {}
    }))

    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    const apiError = error as ApiError
    return NextResponse.json(
      { error: { 
          code: apiError.code || 'unknown_error',
          message: apiError.message,
          status: apiError.status || 500
        } 
      }, 
      { status: apiError.status || 500 }
    )
  }
} 