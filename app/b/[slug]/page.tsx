import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { PublicBusinessProfile } from '@/components/business/public-profile'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

type PageContext = {
  params: Promise<{ slug: string }>
}

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
export async function generateMetadata(context: PageContext) {
  const { params } = context
  const resolvedParams = await params
  
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

async function trackPageView(businessId: string, req: Request, slug: string) {
  const headers = new Headers(req.headers)
  const userAgent = headers.get('user-agent') || 'unknown'
  const referrer = headers.get('referer') || null
  const ip = headers.get('x-forwarded-for') || 'unknown'

  await supabase.from('page_views').insert({
    business_id: businessId,
    path: `/b/${slug}`,
    ip,
    user_agent: userAgent,
    referrer
  })
}

type BusinessResponse = {
  id: string
  name: string
  brand_color: string
  logo_url: string | null
  places: {
    formatted_address: string
    phone_number: string | null
    website: string | null
    logo_url: string | null
  }[] | null
}

export default async function PublicBusinessPage(context: PageContext) {
  const resolvedParams = await context.params
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
      places (
        formatted_address,
        phone_number,
        website,
        logo_url
      )
    `)
    .eq('public_url_slug', resolvedParams.slug)
    .eq('is_published', true)
    .single()

  if (error) {
    console.error('Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    throw error
  }

  if (!business || !business.id) {
    notFound()
  }

  const place = business.places?.[0]

  const businessData = {
    id: business.id,
    name: business.name,
    brand_color: business.brand_color,
    logo_url: business.logo_url,
    place: place ? {
      formatted_address: place.formatted_address,
      phone_number: place.phone_number,
      website: place.website,
      place_logo_url: place.logo_url
    } : null
  }

  const host = headersList.get('host') || 'localhost:3000'
  const pathname = headersList.get('pathname') || `/b/${resolvedParams.slug}`
  const req = new Request(`http://${host}${pathname}`, {
    headers: headersList
  })
  await trackPageView(business.id, req, resolvedParams.slug)

  return <PublicBusinessProfile business={businessData} />
}