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

// Profile update interface
interface ProfileUpdate {
  legalStructure?: string
  yearFounded?: string
  budgetRange?: string
  targetBudget?: string
  mainPrograms?: string[]
  communities?: string[]
  geographicScope?: string
  fundingPriorities?: string[]
  // Enhanced fields
  teamSize?: number
  keyPersonnel?: string
  programDetails?: string
  fundingHistory?: string
  researchMethodology?: string
  communityPartnerships?: string
  [key: string]: string | string[] | number | undefined
}

// Function to clean JSON response from Claude (remove markdown formatting if present)
function cleanJsonResponse(jsonString: string): string {
  let result = jsonString.trim()
  
  // Remove markdown code blocks using simple string operations
  if (result.startsWith('```json')) {
    result = result.slice(7)
  } else if (result.startsWith('```')) {
    result = result.slice(3)
  }
  
  if (result.endsWith('```')) {
    result = result.slice(0, -3)
  }
  
  return result.trim()
}

// Function to extract profile information from user responses
async function extractProfileUpdates(userMessage: string): Promise<ProfileUpdate | null> {
  console.log('🔍 [DEBUG] Starting profile extraction for user message:', userMessage)
  
  try {
    const extractionPrompt = `Analyze this user message and extract any organization profile information. Return ONLY a JSON object with the extracted information, or null if no profile information is present.

User message: "${userMessage}"

Extract information for these fields (only include if explicitly mentioned):
- legalStructure: "501(c)(3)", "LLC", "Corporation", etc.
- yearFounded: Year as string
- budgetRange: Current budget description
- targetBudget: Future budget goals
- mainPrograms: Array of program descriptions
- communities: Array of communities/populations served
- geographicScope: Description of geographic reach
- fundingPriorities: Array of funding needs
- teamSize: Number of team members/staff
- keyPersonnel: Names and roles of key team members
- programDetails: Detailed descriptions of programs and methodologies
- fundingHistory: Past grants, budget evolution, funding context
- researchMethodology: Research approaches, study methods, measurement techniques
- communityPartnerships: Specific community relationships and partnerships

Return only JSON or null:`

    console.log('🔍 [DEBUG] Sending extraction request to Claude API...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: extractionPrompt
        }]
      }),
    })

    console.log('🔍 [DEBUG] Profile extraction response status:', response.status)

    if (!response.ok) {
      console.error('🔍 [DEBUG] Profile extraction failed with status:', response.status)
      return null
    }

    const data = await response.json()
    const extracted = data.content[0].text.trim()
    
    console.log('🔍 [DEBUG] Raw extraction result:', extracted)
    
    // Clean the JSON response to remove markdown code blocks
    const cleanedExtracted = cleanJsonResponse(extracted)
    console.log('🔍 [DEBUG] Cleaned extraction result:', cleanedExtracted)
    
    if (cleanedExtracted === 'null' || !cleanedExtracted.startsWith('{')) {
      console.log('🔍 [DEBUG] No profile information found in message')
      return null
    }

    const parsedResult = JSON.parse(cleanedExtracted)
    console.log('🔍 [DEBUG] Parsed profile updates:', JSON.stringify(parsedResult, null, 2))
    
    return parsedResult
  } catch (error) {
    console.error('🔍 [DEBUG] Error extracting profile updates:', error)
    console.error('🔍 [DEBUG] Error stack:', error.stack)
    return null
  }
}

// Function to update organization profile in Notion
async function updateOrganizationProfile(updates: ProfileUpdate): Promise<boolean> {
  console.log('🔍 [DEBUG] Starting updateOrganizationProfile with updates:', JSON.stringify(updates, null, 2))
  
  try {
    // First get the active profile to get its ID
    console.log('🔍 [DEBUG] Fetching active profile from Notion...')
    const getProfileResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notion-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_active_profile'
      })
    })

    console.log('🔍 [DEBUG] Get active profile response status:', getProfileResponse.status)

    if (!getProfileResponse.ok) {
      const errorText = await getProfileResponse.text()
      console.error('🔍 [DEBUG] Failed to get active profile. Response:', errorText)
      throw new Error(`Failed to get active profile: ${errorText}`)
    }

    const profileData = await getProfileResponse.json()
    console.log('🔍 [DEBUG] Profile data received:', JSON.stringify(profileData, null, 2))
    
    if (!profileData.success || !profileData.profile) {
      console.error('🔍 [DEBUG] No active profile found in response')
      throw new Error('No active profile found')
    }

    console.log('🔍 [DEBUG] Active profile ID:', profileData.profile.id)

    // Map our updates to Notion fields
    const notionUpdates: Record<string, any> = {}
    
    if (updates.legalStructure) {
      notionUpdates.legalStructure = updates.legalStructure
      console.log('🔍 [DEBUG] Mapped legalStructure:', updates.legalStructure)
    }
    if (updates.budgetRange) {
      notionUpdates.budgetRange = updates.budgetRange
      console.log('🔍 [DEBUG] Mapped budgetRange:', updates.budgetRange)
    }
    if (updates.mainPrograms) {
      // Add to focus areas
      const existingFocusAreas = Array.isArray(profileData.profile.focusAreas) ? profileData.profile.focusAreas : []
      const newPrograms = Array.isArray(updates.mainPrograms) ? updates.mainPrograms : []
      notionUpdates.focusAreas = [...new Set([...existingFocusAreas, ...newPrograms])]
      console.log('🔍 [DEBUG] Mapped focusAreas - existing:', existingFocusAreas, 'new:', newPrograms, 'combined:', notionUpdates.focusAreas)
    }
    if (updates.communities) {
      const communities = Array.isArray(updates.communities) ? updates.communities : [updates.communities]
      notionUpdates.targetPopulation = communities.join(', ')
      console.log('🔍 [DEBUG] Mapped targetPopulation:', notionUpdates.targetPopulation)
    }
    if (updates.geographicScope) {
      notionUpdates.location = updates.geographicScope
      console.log('🔍 [DEBUG] Mapped location:', updates.geographicScope)
    }
    if (updates.teamSize) {
      notionUpdates.teamSize = updates.teamSize
      console.log('🔍 [DEBUG] Mapped teamSize:', updates.teamSize)
    }
    if (updates.keyPersonnel) {
      notionUpdates.keyPersonnel = updates.keyPersonnel
      console.log('🔍 [DEBUG] Mapped keyPersonnel:', updates.keyPersonnel)
    }
    if (updates.programDetails) {
      notionUpdates.programDetails = updates.programDetails
      console.log('🔍 [DEBUG] Mapped programDetails:', updates.programDetails)
    }
    if (updates.fundingHistory) {
      notionUpdates.fundingHistory = updates.fundingHistory
      console.log('🔍 [DEBUG] Mapped fundingHistory:', updates.fundingHistory)
    }
    if (updates.researchMethodology) {
      notionUpdates.researchMethodology = updates.researchMethodology
      console.log('🔍 [DEBUG] Mapped researchMethodology:', updates.researchMethodology)
    }
    if (updates.communityPartnerships) {
      notionUpdates.communityParterships = updates.communityPartnerships
      console.log('🔍 [DEBUG] Mapped communityPartnerships:', updates.communityPartnerships)
    }

    console.log('🔍 [DEBUG] Final Notion updates payload:', JSON.stringify(notionUpdates, null, 2))

    // Check if we have any updates to make
    if (Object.keys(notionUpdates).length === 0) {
      console.log('🔍 [DEBUG] No updates to apply, skipping Notion API call')
      return true // No updates needed is considered success
    }

    // Update the profile
    console.log('🔍 [DEBUG] Sending update request to Notion API...')
    const updatePayload = {
      action: 'update_profile',
      data: {
        id: profileData.profile.id,
        updates: notionUpdates
      }
    }
    console.log('🔍 [DEBUG] Update payload:', JSON.stringify(updatePayload, null, 2))

    const updateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notion-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    })

    console.log('🔍 [DEBUG] Update response status:', updateResponse.status)
    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json()
      console.log('🔍 [DEBUG] Update successful! Result:', JSON.stringify(updateResult, null, 2))
      return true
    } else {
      const errorText = await updateResponse.text()
      console.error('🔍 [DEBUG] Update failed. Response:', errorText)
      return false
    }
  } catch (error) {
    console.error('🔍 [DEBUG] Error in updateOrganizationProfile:', error)
    console.error('🔍 [DEBUG] Error stack:', error.stack)
    return false
  }
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

    // Get the latest user message for profile extraction
    const latestUserMessage = messages[messages.length - 1]
    let profileUpdated = false
    let updateSummary = ''

    // Check if the latest message contains profile information
    if (latestUserMessage.role === 'user') {
      console.log('🔍 [DEBUG] Checking latest user message for profile information:', latestUserMessage.content)
      
      const profileUpdates = await extractProfileUpdates(latestUserMessage.content)
      
      if (profileUpdates) {
        console.log('🔍 [DEBUG] Profile updates extracted, attempting to update profile...')
        
        // Attempt to update the profile
        const updateSuccess = await updateOrganizationProfile(profileUpdates)
        
        console.log('🔍 [DEBUG] Profile update result:', updateSuccess)
        
        if (updateSuccess) {
          profileUpdated = true
          console.log('🔍 [DEBUG] Profile update successful, creating summary...')
          
          // Create a summary of what was updated
          const updates = []
          if (profileUpdates.legalStructure) updates.push(`Legal Structure: ${profileUpdates.legalStructure}`)
          if (profileUpdates.yearFounded) updates.push(`Year Founded: ${profileUpdates.yearFounded}`)
          if (profileUpdates.budgetRange) updates.push(`Current Budget: ${profileUpdates.budgetRange}`)
          if (profileUpdates.targetBudget) updates.push(`Target Budget: ${profileUpdates.targetBudget}`)
          if (profileUpdates.mainPrograms) updates.push(`Programs: ${profileUpdates.mainPrograms.join(', ')}`)
          if (profileUpdates.communities) updates.push(`Communities: ${profileUpdates.communities.join(', ')}`)
          if (profileUpdates.geographicScope) updates.push(`Geographic Scope: ${profileUpdates.geographicScope}`)
          if (profileUpdates.teamSize) updates.push(`Team Size: ${profileUpdates.teamSize}`)
          if (profileUpdates.keyPersonnel) updates.push(`Key Personnel: ${profileUpdates.keyPersonnel}`)
          if (profileUpdates.programDetails) updates.push(`Program Details: ${profileUpdates.programDetails.substring(0, 100)}...`)
          if (profileUpdates.fundingHistory) updates.push(`Funding History: ${profileUpdates.fundingHistory.substring(0, 100)}...`)
          if (profileUpdates.researchMethodology) updates.push(`Research Methodology: ${profileUpdates.researchMethodology.substring(0, 100)}...`)
          if (profileUpdates.communityPartnerships) updates.push(`Community Partnerships: ${profileUpdates.communityPartnerships.substring(0, 100)}...`)
          
          updateSummary = updates.length > 0 ? '\n\n✅ **Profile Updated!** I\'ve saved the following to your Notion database:\n- ' + updates.join('\n- ') : ''
          console.log('🔍 [DEBUG] Update summary created:', updateSummary)
        } else {
          console.log('🔍 [DEBUG] Profile update failed')
        }
      } else {
        console.log('🔍 [DEBUG] No profile updates found in user message')
      }
    }

    // Convert our message format to Claude's format
    const claudeMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content
    }))

    // Enhance system prompt if profile was updated
    const enhancedSystemPrompt = profileUpdated 
      ? SYSTEM_PROMPT + `\n\nIMPORTANT: The user just provided profile information that has been successfully saved to their Notion database. Acknowledge this update in your response and show what specific information was saved.`
      : SYSTEM_PROMPT

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
        system: enhancedSystemPrompt,
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
    let responseContent = data.content[0].text
    
    // Add update summary if profile was updated
    if (profileUpdated && updateSummary) {
      responseContent += updateSummary
    }
    
    return NextResponse.json({
      content: responseContent,
      usage: data.usage,
      profileUpdated: profileUpdated
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}