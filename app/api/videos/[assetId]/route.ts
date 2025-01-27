import { NextResponse, NextRequest } from 'next/server'
import { muxClient } from '../../../lib/mux-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params

    let attempts = 0
    let asset = null

    while (attempts < 5) {
      try {
        // First try to get the upload status
        const upload = await muxClient.video.uploads.retrieve(assetId)
        
        if (upload.asset_id) {
          // If we have an asset_id, get the asset details
          asset = await muxClient.video.assets.retrieve(upload.asset_id)
          if (asset.status === 'ready' && asset.playback_ids?.[0]) {
            break
          }
        }
      } catch (error: any) {
        if (error?.status !== 404) {
          throw error
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }

    if (!asset || !asset.playback_ids?.[0]) {
      return NextResponse.json({ error: 'Asset not ready' }, { status: 404 })
    }

    return NextResponse.json({
      id: asset.id,
      playback_id: asset.playback_ids[0].id,
      thumbnail_url: `https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.jpg`,
      duration: asset.duration,
      status: asset.status
    })
  } catch (error: any) {
    console.error('Mux asset error:', error)
    return NextResponse.json(
      { error: 'Failed to get asset details' },
      { status: 500 }
    )
  }
}