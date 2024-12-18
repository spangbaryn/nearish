import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { pageId, accessToken, dateRange } = await request.json()

    const fbResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/feed?` +
      `access_token=${accessToken}&` +
      `fields=id,message,created_time,permalink_url,status_type,full_picture,shares,likes.summary(true)&` +
      `since=${new Date(dateRange.from).getTime() / 1000}&` +
      `until=${new Date(dateRange.to).getTime() / 1000}`
    )

    const fbData = await fbResponse.json()

    if (!fbResponse.ok) {
      console.error('Facebook API error:', fbData)
      return NextResponse.json(
        { error: fbData.error?.message || 'Failed to fetch posts from Facebook' },
        { status: fbResponse.status }
      )
    }

    if (!fbData.data) {
      console.error('Unexpected Facebook response:', fbData)
      return NextResponse.json(
        { error: 'Invalid response from Facebook API' },
        { status: 500 }
      )
    }

    return NextResponse.json(fbData.data)
  } catch (error: any) {
    console.error('Facebook posts fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
} 