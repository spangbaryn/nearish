import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabase } from "@/lib/supabase"
import { replaceEmailTags } from "@/lib/email-utils"
import { sendCampaignEmail, EmailServiceError } from "@/lib/email-service"
import { AuthError } from "@/lib/errors"

type ProfileSubscription = {
  profiles: {
    email: string
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const campaignId = (await params).id

  try {
    // Get campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        email_templates (
          subject,
          content
        )
      `)
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      throw new Error('Campaign not found')
    }

    // Process template content with dynamic tags
    console.log('Processing template content...')
    const processedContent = await replaceEmailTags(
      campaign.email_templates.content,
      campaign.collection_id,
      supabase
    )
    console.log('Template content after processing:', processedContent)

    // Get subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('profile_list_subscriptions')
      .select('profiles (email)')
      .eq('list_id', campaign.list_id)
      .is('unsubscribed_at', null) as { data: ProfileSubscription[], error: any }

    if (subscribersError) {
      throw new Error('Failed to fetch subscribers')
    }

    if (!subscribers?.length) {
      throw new Error('No subscribers found')
    }

    // Send campaign using the processed content
    const { response, recipientCount } = await sendCampaignEmail(
      campaign.id,
      campaign.email_templates.subject,
      processedContent,
      subscribers.map(sub => sub.profiles.email)
    )

    // Update campaign sent timestamp
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', campaignId)

    if (updateError) {
      throw new Error('Failed to update campaign status')
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign sent successfully',
      recipientCount
    })
  } catch (error: any) {
    console.error('Campaign send error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: error instanceof AuthError ? 401 : 500 }
    )
  }
}