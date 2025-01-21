import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getPlaceDetails } from "@/lib/google-places"

export async function POST(request: Request) {
  const { placeId } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const placeDetails = await getPlaceDetails(placeId)
    
    const { data, error } = await supabase
      .from('places')
      .update({
        name: placeDetails.name,
        formatted_address: placeDetails.formatted_address,
        phone_number: placeDetails.formatted_phone_number,
        website: placeDetails.website,
        last_synced_at: new Date().toISOString()
      })
      .eq('place_id', placeId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error syncing place data:', error)
    return NextResponse.json(
      { error: 'Failed to sync place data' },
      { status: 500 }
    )
  }
} 