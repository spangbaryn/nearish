import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { FacebookAPI } from '@/lib/facebook'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const businessId = requestUrl.searchParams.get('state')
  
  if (!code || !businessId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=Invalid Facebook authorization`
    )
  }

  try {
    const pages = await FacebookAPI.getPages(code)
    const supabase = createRouteHandlerClient({ cookies })
    
    // Store pages data temporarily
    await supabase.from('temp_facebook_pages').insert(
      pages.map(page => ({
        business_id: businessId,
        page_id: page.id,
        page_name: page.name,
        access_token: page.access_token,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
      }))
    )

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/businesses/${businessId}/settings?showPageSelector=true`
    )
  } catch (error) {
    console.error('Facebook OAuth error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/error?message=Facebook authorization failed`
    )
  }
} 