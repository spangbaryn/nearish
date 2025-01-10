import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabase } from "@/lib/supabase"
import { replaceEmailTags } from "@/lib/email-utils"
import { sendCampaignEmail, EmailServiceError } from "@/lib/email-service"
import { AppError, ValidationError, AuthError } from "@/lib/errors"
import { withErrorHandler } from "@/lib/api/error-handler"
import type { Database } from "@/types/database.types"

type SubscriptionWithProfile = {
  profiles: {
    email: string;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    const campaignId = (await params).id

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
      throw new ValidationError('Campaign not found')
    }

    if (!campaign.email_templates?.content) {
      throw new ValidationError('Template content not found')
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
    const { data: subscriptionData, error: subscribersError } = await supabase
      .from('profile_list_subscriptions')
      .select(`
        profiles (
          email
        )
      `)
      .eq('list_id', campaign.list_id)
      .is('unsubscribed_at', null) as { data: SubscriptionWithProfile[] | null, error: any }

    if (subscribersError) {
      throw new AppError('Failed to fetch subscribers', 'DATABASE_ERROR', 500)
    }

    if (!subscriptionData?.length) {
      throw new ValidationError('No subscribers found')
    }

    // Send campaign using the processed content
    const { response, recipientCount } = await sendCampaignEmail(
      campaign.id,
      campaign.email_templates.subject,
      processedContent,
      subscriptionData.map(sub => sub.profiles.email)
    )

    // Update campaign sent timestamp
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', campaignId)

    if (updateError) {
      throw new AppError('Failed to update campaign status', 'DATABASE_ERROR', 500)
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign sent successfully',
      recipientCount
    })
  })
}