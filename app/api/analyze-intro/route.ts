import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { openai } from '@/lib/services/openai.service';

export async function POST(request: Request) {
  try {
    const { transcription } = await request.json();
    
    if (!transcription) {
      throw new AppError('ValidationError', 'No transcription provided');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Extract ONLY the following information from the video transcription:
- first_name: Extract just their first name (e.g., "Eric")
- role: Extract their job title and convert to Title Case (e.g., "Head Chef", "Front Desk Manager", "Server")
- favorite_spot: Look for phrases like "favorite spot", "like to go", "hang out at", or "love going to" and extract the location name. If multiple locations mentioned, take the one most clearly indicated as favorite.

Return ONLY these three fields in a JSON object. If any field is unclear, return an empty string.`
        },
        {
          role: "user",
          content: transcription
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new AppError('OpenAIError', 'No content received from OpenAI');
    }
    
    return NextResponse.json(JSON.parse(content));
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    
    console.error('OpenAI Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcription' },
      { status: 500 }
    );
  }
} 