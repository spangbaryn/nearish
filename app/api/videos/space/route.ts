import { NextResponse } from 'next/server'
import { muxClient } from '../../../lib/mux-client'

export async function POST() {
  try {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: 'Mux configuration error' },
        { status: 500 }
      )
    }

    const { data: space } = await muxClient.createSpace()
    if (!space?.id) {
      return NextResponse.json(
        { error: 'Invalid response from Mux' },
        { status: 500 }
      )
    }

    const { data: token } = await muxClient.createSpaceToken(space.id) as { data: { token: string } };
    if (!token?.token) {
      return NextResponse.json(
        { error: 'Failed to create token' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      spaceId: space.id,
      token: token.token
    })
  } catch (error: any) {
    console.error('Mux space error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create space' },
      { status: 500 }
    )
  }
} 