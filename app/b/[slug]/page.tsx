import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { PublicBusinessProfile } from '@/components/business/public-profile'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

type PageProps = any // Bypass strict typing temporarily

// Create anonymous client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Rate limiting helper
const rateLimit = async (ip: string) => {
  const { data, error } = await supabase
    .from('rate_limits')
    .select('count')
    .eq('ip', ip)
    .eq('path', '/b')
    .gte('created_at', new Date(Date.now() - 60000).toISOString())
    .single()

  if ((data?.count ?? 0) > 30) {
    throw new Error('Rate limit exceeded')
  }

  await supabase.from('rate_limits').insert({
    ip,
    path: '/b',
    count: 1
  })
}

// Add export const revalidate = 3600 // Revalidate every hour
export const dynamic = 'force-dynamic'

// Add headers configuration
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const headersList = headers()
  
  return {
    robots: 'noindex, nofollow',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    ]
  }
}

async function trackPageView(businessId: string, req: Request, params: { slug: string }) {
  const headers = new Headers(req.headers)
  const userAgent = headers.get('user-agent') || 'unknown'
  const referrer = headers.get('referer') || null
  const ip = headers.get('x-forwarded-for') || 'unknown'

  await supabase.from('page_views').insert({
    business_id: businessId,
    path: `/b/${params.slug}`,
    ip,
    user_agent: userAgent,
    referrer
  })
}

export default async function PublicBusinessPage({ 
  params 
}: PageProps) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'
  
  await rateLimit(ip)

  const { data: business, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      brand_color,
      logo_url,
      place:places(
        formatted_address,
        phone_number,
        website,
        logo_url
      )
    `)
    .eq('public_url_slug', params.slug)
    .eq('is_published', true)
    .single()

  console.log('Fetching business:', { slug: params.slug, error, business })

  if (!business || !business.id) {
    console.log('Business not found')
    notFound()
  }

  const businessData = {
    ...business,
    place: business.place?.[0] || null
  }

  const host = headersList.get('host') || 'localhost:3000'
  const pathname = headersList.get('pathname') || `/b/${params.slug}`
  const req = new Request(`http://${host}${pathname}`, {
    headers: headersList
  })
  await trackPageView(business.id, req, params)

  return <PublicBusinessProfile business={businessData} />
}