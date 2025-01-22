import Mux from '@mux/mux-node'
import fetch from 'node-fetch'

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  throw new Error('Missing Mux credentials')
}

const baseUrl = 'https://api.mux.com'
const auth = Buffer.from(
  `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
).toString('base64')

export const muxClient = {
  ...new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  }),
  async createSpace() {
    const response = await fetch(`${baseUrl}/video/v1/spaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        type: 'recording',
        broadcasts: [],
        passthrough: "browser-recording"
      }),
    })
    const json = await response.json()
    return { data: json.data }
  },
  async createSpaceToken(spaceId: string) {
    const response = await fetch(`${baseUrl}/video/v1/spaces/${spaceId}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ type: 'publisher' }),
    })
    return response.json()
  }
}