import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// Field Classification System for Intelligent Updates
const FIELD_TIERS = {
  // Tier 1: Simple Replacement Fields
  TIER_1: ['website', 'yearFounded', 'teamSize', 'budgetRange', 'legalStructure', 'legalName'],
  // Tier 2: Smart List Merging
  TIER_2: ['focusAreas', 'targetPopulation'],
  // Tier 3: Intelligent Narrative Fields with Character Limits
  TIER_3: {
    'leadership': { limit: 1000, style: 'simple_list' },
    'missionStatement': { limit: 2000, style: 'narrative' },
    'uniqueQualifications': { limit: 2000, style: 'narrative' },
    'location': { limit: 2000, style: 'narrative' },
    'programDetails': { limit: 2000, style: 'narrative' }
  }
}

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
You are now in the **Grant Discovery & Application** phase. Your main capabilities are:
1. **Grant Search**: When users ask to "find grants" or "search for grants", you'll automatically search the web for relevant opportunities and save them to their database
2. **Grant Management**: When users say "show my grants" or "list grants", display their saved grants with status tracking
3. **Status Updates**: Help users update grant application status (applied, awarded, rejected, etc.)
4. **Organization Learning**: Continue learning about the organization from documents and conversations
5. **Application Assistance**: Help draft grant applications question by question
6. **Proactive Suggestions**: Regularly suggest grant searches and next steps

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
  // Core fields
  legalStructure?: string
  yearFounded?: string
  budgetRange?: string
  teamSize?: number | string
  // Critical conversational fields
  leadership?: string
  website?: string
  missionStatement?: string
  uniqueQualifications?: string
  focusAreas?: string[]
  targetPopulation?: string
  // Legacy fields (keeping for backwards compatibility)
  targetBudget?: string
  mainPrograms?: string[]
  communities?: string[]
  geographicScope?: string
  fundingPriorities?: string[]
  programDetails?: string | object
  [key: string]: string | string[] | number | object | undefined
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
async function extractProfileUpdates(userMessage: string, contexts: string[] = [], existingProfile: any = null): Promise<ProfileUpdate | null> {
  
  try {
    // Build context-aware extraction prompt with existing profile context
    const contextFields = contexts.length > 0 ? contexts.join(', ') : 'any profile information'
    
    // Include existing content for intelligent merging
    let existingContext = ''
    if (existingProfile) {
      existingContext = `\n\nCURRENT PROFILE CONTENT (for context and intelligent merging):
`
      if (existingProfile.leadership) existingContext += `- Current Leadership: ${existingProfile.leadership}\n`
      if (existingProfile.location) existingContext += `- Current Location: ${existingProfile.location}\n`
      if (existingProfile.missionStatement) existingContext += `- Current Mission: ${existingProfile.missionStatement}\n`
      if (existingProfile.uniqueQualifications) existingContext += `- Current Qualifications: ${existingProfile.uniqueQualifications}\n`
      if (existingProfile.programDetails) existingContext += `- Current Programs: ${existingProfile.programDetails}\n`
      if (existingProfile.focusAreas?.length) existingContext += `- Current Focus Areas: ${existingProfile.focusAreas.join(', ')}\n`
      if (existingProfile.targetPopulation) existingContext += `- Current Target Population: ${existingProfile.targetPopulation}\n`
    }
    
    const extractionPrompt = `Analyze this user message and extract organization profile information for intelligent updating. Focus on: ${contextFields}. Return ONLY a JSON object with the extracted information, or null if no profile information is present.

User message: "${userMessage}"${existingContext}

INSTRUCTIONS FOR INTELLIGENT EXTRACTION:
- For leadership: Extract person names and their roles. The system will intelligently merge with existing leadership.
- For narrative fields (mission, qualifications): Extract new content that should be added or updated.
- Only include fields that are explicitly mentioned or clearly implied in the user message.
- For leadership updates, focus on extracting the specific person and their role(s).

Extract information for these fields:
- leadership: Person name and role(s) mentioned (will be intelligently merged)
- website: Organization website URL
- missionStatement: New mission content or updates
- uniqueQualifications: New qualifications or strengths mentioned
- focusAreas: Array of new focus areas, programs, or activities
- targetPopulation: New communities or populations mentioned
- location: Geographic location, city, island, state, country information
- programDetails: Program descriptions, activities, ceremonies, initiatives
- teamSize: Number only (e.g., 3, not "3 people")
- yearFounded: Year as string
- budgetRange: Budget range or financial information
- legalStructure: "501(c)(3)", "LLC", "Corporation", etc.
- legalName: Official legal name of organization
- geographicScope: Geographic reach or location (legacy field)

Return only JSON or null:`


    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: extractionPrompt
        }]
      }),
    })


    if (!response.ok) {
      console.error('🔍 [DEBUG] Profile extraction failed with status:', response.status)
      return null
    }

    const data = await response.json()
    const extracted = data.content[0].text.trim()
    
    
    // Check if response appears to be truncated (common signs of incomplete JSON)
    if (extracted.length > 1000 && !extracted.endsWith('}') && !extracted.endsWith('```')) {
    }
    
    // Clean the JSON response to remove markdown code blocks
    const cleanedExtracted = cleanJsonResponse(extracted)
    
    if (cleanedExtracted === 'null' || !cleanedExtracted.startsWith('{')) {
      return null
    }

    try {
      const parsedResult = JSON.parse(cleanedExtracted)
      return parsedResult
    } catch (parseError) {
      console.error('🔍 [DEBUG] JSON parsing failed:', parseError instanceof Error ? parseError.message : String(parseError))
      console.error('🔍 [DEBUG] Attempted to parse:', cleanedExtracted)
      
      // Try to truncate if the JSON is incomplete
      const truncatedJson = cleanedExtracted.substring(0, cleanedExtracted.lastIndexOf('}') + 1)
      if (truncatedJson && truncatedJson.startsWith('{') && truncatedJson.endsWith('}')) {
        try {
          const parsedResult = JSON.parse(truncatedJson)
          return parsedResult
        } catch (truncatedError) {
          console.error('🔍 [DEBUG] Truncated JSON parsing also failed:', truncatedError instanceof Error ? truncatedError.message : String(truncatedError))
        }
      }
      
      return null
    }
  } catch (error) {
    console.error('🔍 [DEBUG] Error extracting profile updates:', error)
    console.error('🔍 [DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    return null
  }
}

// Helper function to parse leadership field into people and roles
function parseLeadershipField(existingText: string): Array<{name: string, roles: string[]}> {
  if (!existingText || existingText.trim() === '') return []
  
  const people = []
  
  // Handle natural language format: "Person A is/serves as Role, Person B is Role"
  // Also handle formal format: "Person A (Role), Person B (Role)"
  
  // Split by sentences and periods to handle different formats
  const sentences = existingText.split(/[.!;]/).map(s => s.trim()).filter(s => s)
  
  for (const sentence of sentences) {
    // Try formal format first: "Name (Role1, Role2)"
    const formalMatch = sentence.match(/^(.+?)\s*\(([^)]+)\)$/)
    if (formalMatch) {
      const name = formalMatch[1].trim()
      const rolesText = formalMatch[2] || ''
      const roles = rolesText.split(',').map(role => role.trim()).filter(role => role)
      people.push({ name, roles })
      continue
    }
    
    // Try natural language format: "Name is/serves as Role"
    const naturalMatch = sentence.match(/(.+?)\s+(?:is|serves as|acts as|works as)\s+(.+)/i)
    if (naturalMatch) {
      const name = naturalMatch[1].trim()
      const role = naturalMatch[2].trim()
      people.push({ name, roles: [role] })
      continue
    }
    
    // Try role-first format: "Role is Name" or "Role: Name"
    const roleFirstMatch = sentence.match(/(.+?)\s+(?:is|:)\s+(.+)/i)
    if (roleFirstMatch && !roleFirstMatch[1].includes('who')) {
      const role = roleFirstMatch[1].trim()
      const name = roleFirstMatch[2].trim()
      // Only if it looks like a role (contains keywords)
      if (role.toLowerCase().includes('director') || role.toLowerCase().includes('chair') || 
          role.toLowerCase().includes('founder') || role.toLowerCase().includes('executive')) {
        people.push({ name, roles: [role] })
        continue
      }
    }
  }
  
  return people
}

// Helper function to merge leadership information intelligently
function mergeLeadershipField(existingText: string, newPerson: string, newRoles: string[]): string {
  const existingPeople = parseLeadershipField(existingText)
  
  // Check if person already exists
  const existingPersonIndex = existingPeople.findIndex(person => 
    person.name.toLowerCase().includes(newPerson.toLowerCase()) || 
    newPerson.toLowerCase().includes(person.name.toLowerCase())
  )
  
  if (existingPersonIndex >= 0) {
    // Update existing person - merge roles
    const existingPerson = existingPeople[existingPersonIndex]
    const mergedRoles = [...new Set([...existingPerson.roles, ...newRoles])]
    existingPeople[existingPersonIndex] = { name: newPerson, roles: mergedRoles }
  } else {
    // Add new person
    existingPeople.push({ name: newPerson, roles: newRoles })
  }
  
  // Convert back to simple list format
  return existingPeople.map(person => `${person.name} (${person.roles.join(', ')})`).join(', ')
}

// Helper function to check character limits and detect potential conflicts
function checkContentAndLimits(fieldName: string, existingContent: string, newContent: string, mergedContent: string): { 
  withinLimit: boolean, 
  warning?: string, 
  suggestion?: string,
  potentialConflict?: boolean,
  conflictReason?: string
} {
  const tierConfig = FIELD_TIERS.TIER_3[fieldName]
  if (!tierConfig) return { withinLimit: true }
  
  const currentLength = mergedContent.length
  const limit = tierConfig.limit
  
  // Check for potential content conflicts
  let potentialConflict = false
  let conflictReason = ''
  
  // Detect if new content might be replacing rather than adding
  if (existingContent && newContent) {
    const existingWords = existingContent.toLowerCase().split(/\s+/)
    const newWords = newContent.toLowerCase().split(/\s+/)
    const sharedWords = existingWords.filter(word => newWords.includes(word) && word.length > 3)
    
    if (sharedWords.length > 3) {
      potentialConflict = true
      conflictReason = 'New content may overlap with existing information'
    }
  }
  
  // Check character limits
  if (currentLength <= limit) {
    if (currentLength >= limit * 0.9) {
      return {
        withinLimit: true,
        warning: `${fieldName} field is approaching capacity (${currentLength}/${limit} characters)`,
        potentialConflict,
        conflictReason
      }
    }
    return { withinLimit: true, potentialConflict, conflictReason }
  }
  
  // Over limit - suggest truncation
  const suggested = mergedContent.substring(0, limit - 50) + '...'
  return {
    withinLimit: false,
    warning: `${fieldName} field exceeds limit (${currentLength}/${limit} characters)`,
    suggestion: suggested,
    potentialConflict,
    conflictReason
  }
}

// Helper function to intelligently merge narrative fields using Claude AI
async function intelligentMergeField(fieldName: string, existingContent: string, newContent: string): Promise<string> {
  if (!existingContent || existingContent.trim() === '') {
    return newContent
  }
  
  try {
    const mergePrompt = `You are helping merge organization profile information intelligently. You need to combine existing content with new information to create enhanced, cohesive content.

FIELD: ${fieldName}
EXISTING CONTENT: "${existingContent}"
NEW INFORMATION: "${newContent}"

INSTRUCTIONS:
- Analyze both the existing content and new information
- If new information expands or enhances existing content, integrate it seamlessly
- If new information conflicts with existing content, prioritize the new information but preserve valuable existing details
- If new information duplicates existing content, avoid redundancy
- Maintain a natural, professional tone
- Keep the same style and format as the existing content
- Return ONLY the enhanced merged content, no explanation

ENHANCED MERGED CONTENT:`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: mergePrompt
        }]
      }),
    })

    if (!response.ok) {
      console.error('🔍 [DEBUG] Intelligent merge failed for', fieldName, '- using fallback merge')
      return fallbackMerge(existingContent, newContent)
    }

    const data = await response.json()
    const mergedContent = data.content[0].text.trim()
    
    // Validate the merged content isn't too short (Claude didn't fail)
    if (mergedContent.length < Math.min(existingContent.length, newContent.length)) {
      console.error('🔍 [DEBUG] Intelligent merge produced short result for', fieldName, '- using fallback')
      return fallbackMerge(existingContent, newContent)
    }
    
    return mergedContent
    
  } catch (error) {
    console.error('🔍 [DEBUG] Error in intelligent merge for', fieldName, ':', error)
    return fallbackMerge(existingContent, newContent)
  }
}

// Fallback merge function for when AI merge fails
function fallbackMerge(existingContent: string, newContent: string): string {
  // Simple intelligent fallback that avoids naive concatenation
  const separator = existingContent.endsWith('.') ? ' ' : '. '
  return `${existingContent}${separator}${newContent}`
}

// Function to update organization profile in Notion
async function updateOrganizationProfile(updates: ProfileUpdate): Promise<{ success: boolean, mergedContent?: Record<string, any> }> {
  
  try {
    // First get the active profile to get its ID
    const getProfileResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notion-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_active_profile'
      })
    })


    if (!getProfileResponse.ok) {
      const errorText = await getProfileResponse.text()
      console.error('🔍 [DEBUG] Failed to get active profile. Response:', errorText)
      throw new Error(`Failed to get active profile: ${errorText}`)
    }

    const profileData = await getProfileResponse.json()
    
    if (!profileData.success || !profileData.profile) {
      console.error('🔍 [DEBUG] No active profile found in response')
      throw new Error('No active profile found')
    }


    // Intelligent 3-Tier Update System
    const notionUpdates: Record<string, any> = {}
    const mergedContentTracker: Record<string, any> = {} // Track merged content for session memory
    const warnings: string[] = []
    const confirmationNeeded: { field: string, current: string, proposed: string, reason: string }[] = []
    
    // Process each update according to its tier
    for (const [field, value] of Object.entries(updates)) {
      if (!value) continue
      
      // Tier 1: Simple Replacement Fields
      if (FIELD_TIERS.TIER_1.includes(field)) {
        notionUpdates[field] = field === 'yearFounded' ? String(value) : value
        continue
      }
      
      // Tier 2: Smart List Merging
      if (FIELD_TIERS.TIER_2.includes(field)) {
        if (field === 'focusAreas' && Array.isArray(value)) {
          const existingAreas = Array.isArray(profileData.profile.focusAreas) ? profileData.profile.focusAreas : []
          notionUpdates.focusAreas = [...new Set([...existingAreas, ...value])]
        } else if (field === 'targetPopulation') {
          const existingPopulation = profileData.profile.targetPopulation || ''
          const newPopulation = Array.isArray(value) ? value.join(', ') : String(value)
          notionUpdates.targetPopulation = existingPopulation ? `${existingPopulation}, ${newPopulation}` : newPopulation
        }
        continue
      }
      
      // Tier 3: Intelligent Narrative Fields
      if (FIELD_TIERS.TIER_3[field]) {
        const existingContent = profileData.profile[field] || ''
        let mergedContent = ''
        
        if (field === 'leadership') {
          // Special handling for leadership - Claude has already extracted the leadership info
          const leadInput = String(value)
          
          // Parse the leadership update to extract person and roles
          let personName = ''
          let roles: string[] = []
          
          // Try to extract person and role from natural language
          const personRoleMatch = leadInput.match(/(.+?)\s+(?:is|serves as|acts as)\s+(.+)/i)
          if (personRoleMatch) {
            personName = personRoleMatch[1].trim()
            roles = [personRoleMatch[2].trim()]
          } else {
            // Fallback - treat the whole input as a person description
            personName = leadInput.trim()
            roles = ['team member']
          }
          
          mergedContent = mergeLeadershipField(existingContent, personName, roles)
        } else {
          // All other Tier 3 fields use AI-powered intelligent merging
          mergedContent = await intelligentMergeField(field, existingContent, String(value))
        }
        
        // Check character limits and potential conflicts
        const contentCheck = checkContentAndLimits(field, existingContent, String(value), mergedContent)
        
        if (!contentCheck.withinLimit) {
          confirmationNeeded.push({
            field,
            current: existingContent,
            proposed: contentCheck.suggestion || mergedContent.substring(0, FIELD_TIERS.TIER_3[field].limit),
            reason: contentCheck.warning || 'Content exceeds character limit'
          })
        } else {
          notionUpdates[field] = mergedContent
          mergedContentTracker[field] = mergedContent // Track for session memory
          if (contentCheck.warning) {
            warnings.push(contentCheck.warning)
          }
          if (contentCheck.potentialConflict) {
            warnings.push(`${field}: ${contentCheck.conflictReason} - please verify the merged content is accurate`)
          }
        }
        
        continue
      }
    }
    
    // Legacy field mappings (for backwards compatibility)
    if (updates.mainPrograms && !updates.focusAreas) {
      const existingFocusAreas = Array.isArray(profileData.profile.focusAreas) ? profileData.profile.focusAreas : []
      const newPrograms = Array.isArray(updates.mainPrograms) ? updates.mainPrograms : []
      notionUpdates.focusAreas = [...new Set([...existingFocusAreas, ...newPrograms])]
    }
    if (updates.communities && !updates.targetPopulation) {
      const existingPopulation = profileData.profile.targetPopulation || ''
      const communities = Array.isArray(updates.communities) ? updates.communities : [updates.communities]
      const newPopulation = communities.join(', ')
      notionUpdates.targetPopulation = existingPopulation ? `${existingPopulation}, ${newPopulation}` : newPopulation
    }
    if (updates.geographicScope) {
      notionUpdates.location = updates.geographicScope
    }
    
    // Handle confirmations needed (character limits, conflicts)
    if (confirmationNeeded.length > 0) {
      // For now, we'll proceed with the changes but could enhance this to actually ask the user
      // This would require a different return structure to communicate back to the chat interface
      console.log('Confirmations needed:', confirmationNeeded)
      for (const confirmation of confirmationNeeded) {
        notionUpdates[confirmation.field] = confirmation.proposed
        mergedContentTracker[confirmation.field] = confirmation.proposed // Track for session memory
        warnings.push(`${confirmation.field}: ${confirmation.reason}`)
      }
    }
    if (updates.teamSize) {
      // Extract number from teamSize - handle both numbers and descriptive text
      let teamSizeValue: number | undefined
      
      if (typeof updates.teamSize === 'number') {
        teamSizeValue = updates.teamSize
      } else if (typeof updates.teamSize === 'string') {
        // Extract first number from string like "2 core team members plus volunteers"
        const numberMatch = updates.teamSize.match(/(\d+)/)
        teamSizeValue = numberMatch ? parseInt(numberMatch[1], 10) : undefined
      }
      
      if (teamSizeValue !== undefined) {
        notionUpdates.teamSize = teamSizeValue
      } else {
      }
    }
    if (updates.programDetails) {
      // Handle different data types from Claude - arrays, objects, or strings
      let programValue: string
      
      if (Array.isArray(updates.programDetails)) {
        // Array of strings - join with bullet points
        programValue = updates.programDetails.map(detail => `• ${detail}`).join('\n')
      } else if (typeof updates.programDetails === 'object' && updates.programDetails !== null) {
        // Object - convert to formatted string
        programValue = Object.entries(updates.programDetails)
          .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              // Nested object - format nicely
              const nestedEntries = Object.entries(value).map(([k, v]) => `  ${k}: ${v}`).join('\n')
              return `${key}:\n${nestedEntries}`
            }
            return `${key}: ${value}`
          })
          .join('\n\n')
      } else {
        // String or other primitive - use as-is
        programValue = String(updates.programDetails)
      }
      
      notionUpdates.programDetails = programValue
    }


    // Check if we have any updates to make
    if (Object.keys(notionUpdates).length === 0) {
      return { success: true } // No updates needed is considered success
    }

    // Update the profile
    const updatePayload = {
      action: 'update_profile',
      data: {
        id: profileData.profile.id,
        updates: notionUpdates
      }
    }

    const updateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notion-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    })

    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json()
      return { success: true, mergedContent: mergedContentTracker }
    } else {
      const errorText = await updateResponse.text()
      console.error('🔍 [DEBUG] Update failed. Response:', errorText)
      return { success: false }
    }
  } catch (error) {
    console.error('🔍 [DEBUG] Error in updateOrganizationProfile:', error)
    console.error('🔍 [DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    return { success: false }
  }
}

// Function to load active profile for session context
async function loadActiveProfile() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notion-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_active_profile' })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.success ? data.profile : null
    }
  } catch (error) {
    console.error('Failed to load active profile:', error)
  }
  return null
}

// Function to detect if message contains profile update keywords
function detectProfileUpdateContext(message: string): string[] {
  const keywords = {
    leadership: ['leadership', 'director', 'executive', 'ceo', 'founder', 'board', 'chair'],
    website: ['website', 'site', 'url', 'web', 'https', 'http'],
    missionStatement: ['mission', 'purpose', 'goal', 'objective', 'vision'],
    teamSize: ['team size', 'staff', 'people', 'members', 'employees'],
    focusAreas: ['focus', 'programs', 'areas', 'activities', 'services'],
    targetPopulation: ['serve', 'community', 'population', 'audience', 'participants'],
    uniqueQualifications: ['unique', 'qualifications', 'strengths', 'expertise', 'experience'],
    location: ['located', 'location', 'based', 'operate', 'island', 'city', 'state', 'country', 'geographic'],
    programDetails: ['program', 'initiative', 'project', 'ceremony', 'ceremonies', 'activities', 'offerings']
  }
  
  const messageText = message.toLowerCase()
  const detectedContexts = []
  
  for (const [context, words] of Object.entries(keywords)) {
    if (words.some(word => messageText.includes(word))) {
      detectedContexts.push(context)
    }
  }
  
  return detectedContexts
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

    // Load active profile for session context
    const activeProfile = await loadActiveProfile()
    
    // Get the latest user message for profile extraction
    const latestUserMessage = messages[messages.length - 1]
    let profileUpdated = false
    let updateSummary = ''
    let updatedProfile = activeProfile // Track profile changes in session

    // Check if the latest message is a grant-related request
    if (latestUserMessage.role === 'user') {
      const messageContent = latestUserMessage.content.toLowerCase()
      
      // Grant search requests
      const isGrantSearchRequest = messageContent.includes('find grants') || 
                                   messageContent.includes('search grants') || 
                                   messageContent.includes('grant search') ||
                                   messageContent.includes('find me grants') ||
                                   messageContent.includes('look for grants')

      // Show existing grants requests
      const isShowGrantsRequest = messageContent.includes('show my grants') || 
                                  messageContent.includes('show grants') || 
                                  messageContent.includes('list grants') ||
                                  messageContent.includes('view grants') ||
                                  messageContent.includes('my grant database')

      // Grant status update requests
      const isStatusUpdateRequest = messageContent.includes('mark') && (messageContent.includes('applied') || messageContent.includes('interested') || messageContent.includes('awarded') || messageContent.includes('rejected'))

      if (isGrantSearchRequest) {
        try {
          // Call the grant search API
          const grantSearchResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/search-grants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              searchQuery: latestUserMessage.content
            })
          })

          if (grantSearchResponse.ok) {
            const grantData = await grantSearchResponse.json()
            return NextResponse.json({
              content: grantData.content,
              usage: grantData.usage,
              grantSearch: true
            })
          } else {
            return NextResponse.json({
              content: "I encountered an error while searching for grants. Please try again or let me know if you'd like help in a different way.",
              grantSearch: false
            })
          }
        } catch (error) {
          console.error('Grant search error:', error)
          return NextResponse.json({
            content: "I encountered an error while searching for grants. Please try again or let me know if you'd like help in a different way.",
            grantSearch: false
          })
        }
      }

      // Handle show grants requests
      if (isShowGrantsRequest) {
        try {
          const grantsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/grants-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'get_grants',
              data: { limit: 20 }
            })
          })

          if (grantsResponse.ok) {
            const grantsData = await grantsResponse.json()
            if (grantsData.success && grantsData.grants.length > 0) {
              let content = `# Your Grant Database\n\nHere are your saved grants (${grantsData.grants.length} total):\n\n`
              
              grantsData.grants.forEach((grant: any, index: number) => {
                const urgency = grant.deadline ? (() => {
                  const deadlineDate = new Date(grant.deadline)
                  const today = new Date()
                  const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  if (daysUntil <= 14) return '🚨 URGENT'
                  if (daysUntil <= 30) return '⏰ SOON'
                  return '📅'
                })() : '📅'
                
                content += `${urgency} **${grant.grantName}** - ${grant.amount}\n`
                content += `   • **Status:** ${grant.status}\n`
                if (grant.funder) content += `   • **Funder:** ${grant.funder}\n`
                if (grant.deadline) content += `   • **Deadline:** ${grant.deadline}\n`
                if (grant.relevanceScore) content += `   • **Relevance:** ${grant.relevanceScore}/100\n`
                content += '\n'
              })

              content += `\n**Commands you can use:**\n- "Mark [grant name] as applied" - Update grant status\n- "Find new grants" - Search for more opportunities\n- "Show urgent grants only" - Filter by deadline`

              return NextResponse.json({
                content: content,
                showGrants: true
              })
            } else {
              return NextResponse.json({
                content: "You don't have any grants saved yet. Try saying **'Find grants'** to discover opportunities for your organization!",
                showGrants: true
              })
            }
          } else {
            return NextResponse.json({
              content: "I had trouble accessing your grant database. Please try again.",
              showGrants: false
            })
          }
        } catch (error) {
          console.error('Show grants error:', error)
          return NextResponse.json({
            content: "I encountered an error accessing your grants. Please try again.",
            showGrants: false
          })
        }
      }

      // Handle grant status updates (basic implementation - could be enhanced with NLP)
      if (isStatusUpdateRequest) {
        try {
          // This is a simplified implementation - in production, you'd want better parsing
          let status = 'Interested'
          if (messageContent.includes('applied')) status = 'Applied'
          else if (messageContent.includes('awarded')) status = 'Awarded'
          else if (messageContent.includes('rejected')) status = 'Rejected'

          return NextResponse.json({
            content: `I'd love to help update your grant status! However, I need you to be more specific about which grant you want to update. 

**Try saying something like:**
- "Update the Indigenous Knowledge Grant to Applied status"
- "Mark the Community Healing Initiative as Interested"

Or you can **show your grants first** by saying "Show my grants" and then tell me which one to update.`,
            statusUpdate: true
          })
        } catch (error) {
          console.error('Status update error:', error)
          return NextResponse.json({
            content: "I had trouble processing that status update. Please try rephrasing your request.",
            statusUpdate: false
          })
        }
      }

      // Detect profile update context to avoid unnecessary extractions
      const updateContexts = detectProfileUpdateContext(latestUserMessage.content)
      
      if (updateContexts.length > 0) {
      
        const profileUpdates = await extractProfileUpdates(latestUserMessage.content, updateContexts, activeProfile)
        
        if (profileUpdates) {
        
        // Attempt to update the profile
        const updateResult = await updateOrganizationProfile(profileUpdates)
        
        
          if (updateResult.success) {
            profileUpdated = true
            
            // Update session profile memory with new values
            if (updatedProfile) {
              // For Tier 3 fields, use merged content (if available) instead of raw extracted values
              const mergedContent = updateResult.mergedContent || {}
              
              // Tier 3 Intelligent Narrative Fields - use merged content
              if (mergedContent.leadership) updatedProfile.leadership = mergedContent.leadership
              else if (profileUpdates.leadership) updatedProfile.leadership = profileUpdates.leadership
              
              if (mergedContent.location) updatedProfile.location = mergedContent.location
              else if (profileUpdates.location) updatedProfile.location = profileUpdates.location
              
              if (mergedContent.missionStatement) updatedProfile.missionStatement = mergedContent.missionStatement
              else if (profileUpdates.missionStatement) updatedProfile.missionStatement = profileUpdates.missionStatement
              
              if (mergedContent.uniqueQualifications) updatedProfile.uniqueQualifications = mergedContent.uniqueQualifications
              else if (profileUpdates.uniqueQualifications) updatedProfile.uniqueQualifications = profileUpdates.uniqueQualifications
              
              if (mergedContent.programDetails) updatedProfile.programDetails = mergedContent.programDetails
              else if (profileUpdates.programDetails) updatedProfile.programDetails = profileUpdates.programDetails
              
              // Tier 1 & 2 fields - use original logic (simple replacement/merging)
              if (profileUpdates.website) updatedProfile.website = profileUpdates.website
              if (profileUpdates.focusAreas) updatedProfile.focusAreas = profileUpdates.focusAreas
              if (profileUpdates.targetPopulation) updatedProfile.targetPopulation = profileUpdates.targetPopulation
              if (profileUpdates.teamSize) updatedProfile.teamSize = profileUpdates.teamSize
              if (profileUpdates.yearFounded) updatedProfile.yearFounded = profileUpdates.yearFounded
              if (profileUpdates.budgetRange) updatedProfile.budgetRange = profileUpdates.budgetRange
              if (profileUpdates.legalStructure) updatedProfile.legalStructure = profileUpdates.legalStructure
              if (profileUpdates.legalName) updatedProfile.legalName = profileUpdates.legalName
            }
            
            // Create a summary of what was updated
            const updates = []
            if (profileUpdates.leadership) updates.push(`Leadership: ${profileUpdates.leadership}`)
            if (profileUpdates.website) updates.push(`Website: ${profileUpdates.website}`)
            if (profileUpdates.location) updates.push(`Location: ${profileUpdates.location}`)
            if (profileUpdates.missionStatement) updates.push(`Mission: ${profileUpdates.missionStatement.substring(0, 100)}...`)
            if (profileUpdates.uniqueQualifications) updates.push(`Qualifications: ${profileUpdates.uniqueQualifications.substring(0, 100)}...`)
            if (profileUpdates.programDetails) updates.push(`Programs: ${profileUpdates.programDetails.substring(0, 100)}...`)
            if (profileUpdates.focusAreas) updates.push(`Focus Areas: ${profileUpdates.focusAreas.join(', ')}`)
            if (profileUpdates.targetPopulation) updates.push(`Target Population: ${profileUpdates.targetPopulation}`)
            if (profileUpdates.teamSize) updates.push(`Team Size: ${profileUpdates.teamSize}`)
            if (profileUpdates.yearFounded) updates.push(`Year Founded: ${profileUpdates.yearFounded}`)
            if (profileUpdates.budgetRange) updates.push(`Budget Range: ${profileUpdates.budgetRange}`)
            if (profileUpdates.legalStructure) updates.push(`Legal Structure: ${profileUpdates.legalStructure}`)
            if (profileUpdates.legalName) updates.push(`Legal Name: ${profileUpdates.legalName}`)
            
            updateSummary = updates.length > 0 ? '\n\n✅ **Profile Updated!** I\'ve saved the following to your Notion database:\n- ' + updates.join('\n- ') : ''
          }
        }
      } else {
        // No profile update context detected - skip extraction entirely
      }
    }

    // Convert our message format to Claude's format
    const claudeMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content
    }))

    // Create enhanced system prompt with session profile context
    let enhancedSystemPrompt = SYSTEM_PROMPT
    
    if (updatedProfile) {
      enhancedSystemPrompt += `\n\nCURRENT ORGANIZATION CONTEXT:
You are working with ${updatedProfile.profileName || 'this organization'}.
- Location: ${updatedProfile.location || 'Not specified'}
- Focus Areas: ${updatedProfile.focusAreas?.join(', ') || 'Not specified'}
- Mission: ${updatedProfile.missionStatement || 'Not specified'}
- Team Size: ${updatedProfile.teamSize || 'Not specified'}
- Leadership: ${updatedProfile.leadership || 'Not specified'}
- Website: ${updatedProfile.website || 'Not specified'}

Reference this context naturally in your responses. The user doesn't need basic info repeated unless they ask.`
    }
    
    if (profileUpdated) {
      enhancedSystemPrompt += `\n\nIMPORTANT: The user just provided profile information that has been successfully saved to their Notion database. Acknowledge this update in your response and show what specific information was saved.`
    }

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
      profileUpdated: profileUpdated,
      activeProfile: updatedProfile ? {
        name: updatedProfile.profileName,
        location: updatedProfile.location,
        focusAreas: updatedProfile.focusAreas
      } : null
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}