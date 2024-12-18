interface FacebookTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface FacebookPage {
  access_token: string
  category: string
  name: string
  id: string
}

interface FacebookPagesResponse {
  data: FacebookPage[]
}

export class FacebookAPI {
  private static async exchangeCodeForToken(code: string): Promise<FacebookTokenResponse> {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID!,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
      code,
    })

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    return response.json()
  }

  static async getPages(code: string): Promise<FacebookPage[]> {
    const { access_token } = await this.exchangeCodeForToken(code)

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook pages')
    }

    const data: FacebookPagesResponse = await response.json()
    return data.data
  }

  static async getPagePosts(pageId: string, accessToken: string) {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?` +
      `fields=id,message,created_time&access_token=${accessToken}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch page posts')
    }

    return response.json()
  }
} 