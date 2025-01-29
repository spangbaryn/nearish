import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  const { transcription } = await request.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Extract ONLY the following information from the video transcription:
- first_name: Extract just their first name (e.g., "Eric")
- role: Extract their job title and convert to Title Case (e.g., "Head Chef", "Front Desk Manager", "Server")
- favorite_spot: Look for phrases like "favorite spot", "like to go", "hang out at", or "love going to" and extract the location name. If multiple locations mentioned, take the one most clearly indicated as favorite.

Return ONLY these three fields in a JSON object. If any field is unclear, return an empty string.
Example response:
{
  "first_name": "Eric",
  "role": "Head Chef",
  "favorite_spot": "Book and Cover"
}`
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
  if (!content) throw new Error('No content received from OpenAI');
  
  return NextResponse.json(JSON.parse(content));
} 