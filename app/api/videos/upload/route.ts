import { NextResponse } from 'next/server'
import { muxClient } from '../../../lib/mux-client'

export async function POST() {
  try {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      console.error('Missing Mux credentials')
      return NextResponse.json(
        { error: 'Mux configuration error' },
        { status: 500 }
      )
    }

    const upload = await muxClient.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
      },
    })

    if (!upload?.url || !upload?.id) {
      console.error('Invalid Mux response:', upload)
      return NextResponse.json(
        { error: 'Invalid response from Mux' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      uploadUrl: upload.url,
      assetId: upload.id
    })
  } catch (error: any) {
    console.error('Mux upload error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create upload URL' },
      { status: 500 }
    )
  }
}