import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { syncPlaceData } from "@/app/actions/sync-place"

export async function POST(request: Request) {
  const { placeId } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const placeDetails = await syncPlaceData(placeId)
    
    // Get the updated place record
    const { data, error } = await supabase
      .from('places')
      .select()
      .eq('place_id', placeId)
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