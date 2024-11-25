import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export async function uploadLogo(file: File) {
  const { data, error } = await supabase.storage
    .from('assets')
    .upload(`logo/logo.svg`, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error
  return data
}

export async function checkLogoExists() {
  try {
    const { data, error } = await supabase
      .storage
      .from('assets')
      .list('logo')

    if (error) throw error

    return data?.some(file => file.name === 'logo.svg') ?? false
  } catch (err) {
    console.error('Error checking logo:', err)
    return false
  }
}

export async function getSignedLogoUrl() {
  try {
    const { data, error } = await supabase
      .storage
      .from('assets')
      .createSignedUrl('logo/logo.svg', 60 * 60) // 1 hour expiry

    if (error) throw error
    return data?.signedUrl
  } catch (err) {
    console.error('Error getting logo URL:', err)
    return null
  }
}

export function getLogoUrl(path: string) {
  const { data } = supabase.storage
    .from('assets')
    .getPublicUrl(`logo/${path}`)
  
  return data.publicUrl
} 