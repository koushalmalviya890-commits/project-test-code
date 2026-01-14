import { NextResponse } from 'next/server'

const AI_ENDPOINT = 'https://cummaai-499831567403.us-central1.run.app/query'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // Make request to AI endpoint
    const aiResponse = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: message }),
    })

    if (!aiResponse.ok) {
      throw new Error('AI service responded with an error')
    }

    const data = await aiResponse.json()
    
    // Return the AI's answer
    return NextResponse.json({ response: data.answer })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
} 