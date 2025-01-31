import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

type RouteContext = any // Bypass strict typing temporarily

const slugSchema = z.object({
  slug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
})

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { id } = context.params
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { slug } = slugSchema.parse(body)

    // Check if slug is already taken
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('public_url_slug', slug)
      .neq('id', id)
      .single()

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'This URL is already taken' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('businesses')
      .update({ public_url_slug: slug })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update slug' },
      { status: 500 }
    )
  }
} 