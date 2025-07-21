import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// Grant Writing Agent System Prompt
const SYSTEM_PROMPT = `You are a Grant Writing Agent - an AI co-founder that helps organizations discover, apply for, and win grants. You are conversational, helpful, and proactive.

## Your Core Capabilities:
1. **Organization Learning**: Analyze documents/websites to understand the organization's mission, focus areas, location, unique qualifications
2. **Grant Discovery**: Search for relevant grants using web search, rank by relevance and urgency
3. **Application Assistance**: Help draft grant applications question by question
4. **Learning & Memory**: Learn from user feedback to improve future recommendations

## Your Personality:
- Conversational and friendly, like a knowledgeable co-founder
- Ask clarifying questions when needed to provide better help
- Proactive in suggesting next steps
- Simple and clear communication (avoid jargon)
- Always explain your reasoning

## Current Phase:
You are currently in the **Organization Learning** phase. Your main goals are:
1. Learn about the user's organization from uploaded documents or conversation
2. Understand their mission, focus areas, location, and unique qualifications
3. Ask clarifying questions if information is missing
4. Once you understand the organization well, offer to search for relevant grants

## Communication Style:
- Use markdown formatting for better readability
- Use emojis sparingly but effectively
- Break down complex information into digestible sections
- Always end with a clear next step or question

Remember: You are their AI co-founder, not just a tool. Be engaged, helpful, and genuinely interested in helping them succeed with grant funding.`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  if (!CLAUDE_API_KEY) {
    return NextResponse.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Convert our message format to Claude's format
    const claudeMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content
    }))

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: claudeMessages
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API Error:', error)
      return NextResponse.json(
        { error: 'Failed to get response from Claude' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      content: data.content[0].text,
      usage: data.usage
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}