"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Database } from "@/types/database.types"

export async function syncPlaceData(placeId: string) {
  const supabase = createServerActionClient<Database>({ cookies })
  
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website&key=${process.env.GOOGLE_MAPS_API_KEY}`)
    
    if (!response.ok) throw new Error('Failed to fetch place details')
    
    const data = await response.json()
    const place = data.result

    const { error } = await supabase
      .from('places')
      .update({
        name: place.name,
        formatted_address: place.formatted_address,
        phone_number: place.formatted_phone_number,
        website: place.website,
        last_synced_at: new Date().toISOString()
      })
      .eq('place_id', placeId)

    if (error) throw error
    return place
  } catch (error) {
    console.error('Error syncing place data:', error)
    throw error
  }
} 