import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { prompt } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return NextResponse.json({ 
      generatedContent: completion.choices[0].message.content 
    })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}