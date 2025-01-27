import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    
    const { data, error } = await supabase
      .from('business_timeline_events')
      .update({
        title: body.title,
        description: body.description,
        date: body.date,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating timeline event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 