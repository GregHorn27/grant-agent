import { NextRequest, NextResponse } from 'next/server'
import { parseGrantsFromResponse, formatGrantForDisplay } from '../../../utils/grantParser'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(req: NextRequest) {
  if (!CLAUDE_API_KEY) {
    return NextResponse.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { searchQuery } = await req.json()

    // Load active organization profile for context
    const profileResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notion-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_active_profile'
      })
    })

    let organizationContext = ''
    if (profileResponse.ok) {
      const profileData = await profileResponse.json()
      if (profileData.success && profileData.profile) {
        const profile = profileData.profile
        organizationContext = `
Organization Profile:
- Name: ${profile.profileName || 'Not specified'}
- Mission: ${profile.missionStatement || 'Not specified'}
- Focus Areas: ${profile.focusAreas?.join(', ') || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Target Population: ${profile.targetPopulation || 'Not specified'}
- Unique Qualifications: ${profile.uniqueQualifications || 'Not specified'}`
      }
    }

    // Get current date for deadline filtering
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // Create comprehensive grant research prompt
    const researchPrompt = `You are a grant research specialist with web search access. Your task is to find grant opportunities for this organization:

${organizationContext}

**IMPORTANT DATE CONTEXT:**
Today's date: ${currentDate}

Search Instructions:
- Use web search to find grant opportunities across the internet
- Cast a WIDE net - include grants of ANY size (from $1,000 to multi-million dollar grants)
- Focus on relevance to the organization's mission and focus areas
- Look for Indigenous/Native Hawaiian grants, community healing, traditional knowledge, environmental, cultural preservation, spiritual practices
- Search foundation websites, government grant databases (grants.gov), corporate giving programs
- Include both specific grants with deadlines AND ongoing programs
- **CRITICAL**: Only include grants with deadlines that have NOT passed yet (must be after today's date)
- Include grants due tomorrow or next week - we want to apply quickly for urgent opportunities!

Ranking Criteria:
- Prioritize by combination of RELEVANCE to organization + DEADLINE URGENCY
- **TOP PRIORITY**: High relevance + urgent deadlines (next 7-14 days) - mark these with 🚨 URGENT
- **SECOND PRIORITY**: High relevance + near-term deadlines (next 30 days) 
- **THIRD PRIORITY**: High relevance + medium-term deadlines (1-6 months)
- **FOURTH PRIORITY**: High relevance + ongoing programs (no specific deadline)
- Include some lower relevance grants if they have very urgent deadlines

Output Format:
Return a simple ranked list in this exact format:

**GRANT DISCOVERY RESULTS**

1. **Grant Name** - $Amount Range
   - **Funder:** Organization Name
   - **Deadline:** Specific date or "Ongoing"
   - **Relevance:** Brief explanation of why this fits the organization
   - **Application Notes:** Key requirements or considerations
   - **URL:** Direct link to application or more info

2. **Next Grant...**

Continue for 15-25 grants total, ranked by apply-now priority.

Begin your research now and provide the comprehensive ranked list.`

    // Send request to Claude with web search capability
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: researchPrompt
        }]
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
    const grantResults = data.content[0].text

    // Parse grants from Claude's response
    const parsedGrants = parseGrantsFromResponse(grantResults)
    
    // Save grants to Notion database
    let savedGrants = []
    if (parsedGrants.length > 0) {
      try {
        const saveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/grants-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_grants',
            data: { grants: parsedGrants }
          })
        })

        if (saveResponse.ok) {
          const saveData = await saveResponse.json()
          savedGrants = saveData.grants || []
          console.log(`Grant discovery: ${saveData.message}`)
        } else {
          console.error('Failed to save grants to database')
        }
      } catch (error) {
        console.error('Error saving grants:', error)
      }
    }

    // Format grants for display
    const formattedGrants = parsedGrants.map(grant => formatGrantForDisplay(grant)).join('\n\n')
    
    // Combine original Claude response with structured data
    const enhancedResponse = `${grantResults}

---

**DATABASE UPDATE**: ${savedGrants.length > 0 ? 
  `Saved ${savedGrants.filter(g => g.status === 'saved').length} new grants to your database (${savedGrants.filter(g => g.status === 'duplicate').length} duplicates found)` : 
  'No grants to save or database error occurred'}`

    return NextResponse.json({
      content: enhancedResponse,
      parsedGrants: parsedGrants,
      savedGrants: savedGrants,
      usage: data.usage,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Grant Search API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}