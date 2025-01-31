import { supabase } from "@/lib/supabase"

export async function generateBusinessSlug(businessName: string, businessId: string) {
  // Convert business name to slug format
  let baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  // Try the base slug first
  const { data } = await supabase
    .from('businesses')
    .select('public_url_slug')
    .eq('public_url_slug', baseSlug)
    .neq('id', businessId)
    .single()

  // If base slug is available, use it
  if (!data) return baseSlug

  // Otherwise, try adding numbers until we find an available slug
  let counter = 1
  let slug = `${baseSlug}-${counter}`
  
  while (true) {
    const { data } = await supabase
      .from('businesses')
      .select('public_url_slug')
      .eq('public_url_slug', slug)
      .neq('id', businessId)
      .single()

    if (!data) return slug
    counter++
    slug = `${baseSlug}-${counter}`
  }
} 