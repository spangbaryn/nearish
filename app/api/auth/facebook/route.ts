import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const businessId = requestUrl.searchParams.get('businessId')
  
  if (!businessId) {
    return NextResponse.json({ error: 'Missing business ID' }, { status: 400 })
  }

  const facebookClientId = process.env.FACEBOOK_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`
  
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?`
    + `client_id=${facebookClientId}`
    + `&redirect_uri=${redirectUri}`
    + `&state=${businessId}`
    + `&scope=pages_manage_posts,pages_read_engagement`
  
  return NextResponse.redirect(facebookAuthUrl)
} 