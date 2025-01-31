import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { generateBusinessSlug } from '@/lib/utils/slugs'

type RouteContext = any // Bypass strict typing temporarily

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const id = context.params.id
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { publish } = await request.json()
    
    // Get business name for slug generation
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', id)
      .single()

    if (!business) {
      return new NextResponse('Business not found', { status: 404 })
    }

    const slug = publish ? await generateBusinessSlug(business.name, id) : null

    const { error } = await supabase
      .from('businesses')
      .update({
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
        public_url_slug: slug
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Error publishing business:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 