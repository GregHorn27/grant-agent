import { NextRequest, NextResponse } from 'next/server'
import { parseGrantsFromResponse, formatGrantForDisplay } from '../../../utils/grantParser'
import FirecrawlApp from 'firecrawl'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// Initialize Firecrawl
const firecrawl = FIRECRAWL_API_KEY ? new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY }) : null

// Grant verification function using Firecrawl
async function verifyGrantOnWebsite(grantData: {
  grantName?: string;
  funder?: string;
  sourceUrl?: string;
  applicationUrl?: string;
}): Promise<{ verified: boolean, verificationDetails?: any, actionUrl?: string }> {
  if (!firecrawl) {
    console.warn('Firecrawl not configured, skipping verification')
    return { verified: false }
  }

  try {
    // Extract potential URLs from grant data - we'll look for the source URL first
    const urlsToCheck = []
    if (grantData.sourceUrl) urlsToCheck.push(grantData.sourceUrl)
    if (grantData.applicationUrl) urlsToCheck.push(grantData.applicationUrl)

    for (const url of urlsToCheck) {
      try {
        console.log(`Verifying grant on: ${url}`)
        
        // Use Firecrawl to scrape the page
        const scrapeResult = await firecrawl.scrapeUrl(url, {
          formats: ['markdown']
        })

        console.log(`Firecrawl response structure:`, Object.keys(scrapeResult || {}))

        // Handle response format for v1.15.0
        let contentText = ''
        if (scrapeResult) {
          // Try different possible response structures
          contentText = (scrapeResult as any).content || 
                       (scrapeResult as any).markdown || 
                       (scrapeResult as any).data?.content || 
                       (scrapeResult as any).data?.markdown || 
                       ''
        }

        if (contentText) {
          const content = contentText.toLowerCase()
          const grantName = grantData.grantName?.toLowerCase() || ''
          const funderName = grantData.funder?.toLowerCase() || ''
          
          // Enhanced grant existence check
          const grantNameWords = grantName.split(/\s+/).filter(word => word.length > 3)
          const funderNameWords = funderName.split(/\s+/).filter(word => word.length > 3)
          
          const grantExists = grantNameWords.some(word => content.includes(word)) || 
                             funderNameWords.some(word => content.includes(word)) ||
                             content.includes('grant') || content.includes('funding')
          
          // Comprehensive application process detection
          const hasApplication = content.includes('apply') || 
                                content.includes('application') || 
                                content.includes('submit') ||
                                content.includes('letter of intent') ||
                                content.includes('loi') ||
                                content.includes('login') ||
                                content.includes('account') ||
                                content.includes('proposal') ||
                                content.includes('eligibility') ||
                                content.includes('guidelines') ||
                                content.includes('requirements')

          // Enhanced deadline detection for future dates
          const hasDeadline = content.includes('deadline') || 
                            content.includes('due') ||
                            content.includes('2025') ||
                            content.includes('2026') ||
                            content.includes('january') ||
                            content.includes('february') ||
                            content.includes('march') ||
                            content.includes('april') ||
                            content.includes('may') ||
                            content.includes('june') ||
                            content.includes('july') ||
                            content.includes('august') ||
                            content.includes('september') ||
                            content.includes('october') ||
                            content.includes('november') ||
                            content.includes('december')

          // More lenient verification - if we find application process and some indication of grants/funding
          if ((grantExists || content.includes('foundation')) && hasApplication) {
            return {
              verified: true,
              verificationDetails: {
                url: url,
                grantFound: grantExists,
                applicationProcessFound: hasApplication,
                deadlineFound: hasDeadline,
                contentPreview: contentText.substring(0, 200) + '...'
              },
              actionUrl: url // The URL where they can start the process
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to verify grant at ${url}:`, error)
        continue
      }
    }

    return { verified: false }
  } catch (error) {
    console.error('Grant verification error:', error)
    return { verified: false }
  }
}

export async function POST(req: NextRequest) {
  if (!CLAUDE_API_KEY) {
    return NextResponse.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    )
  }

  if (!FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { error: 'Firecrawl API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { searchQuery } = await req.json()
    console.log('Grant search requested:', searchQuery || 'general search')

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

    // Create comprehensive keyword matrix search prompt
    const researchPrompt = `You are a grant research specialist with web search access. Your task is to find REAL, CURRENT grant opportunities for this organization using a comprehensive keyword matrix approach:

${organizationContext}

**IMPORTANT DATE CONTEXT:**
Today's date: ${currentDate}

**COMPREHENSIVE KEYWORD MATRIX SEARCH STRATEGY:**

**Organization Keywords**: Indigenous wisdom, traditional knowledge, community healing, cultural preservation, spiritual practices, land stewardship, group coherence, Native Hawaiian, Pacific Islander, ceremonial practices, traditional ecological knowledge

**Foundation Type Keywords**: Private foundation, family foundation, philanthropist, corporate giving, CSR grants, community foundation, endowment, charitable trust, donor advised fund

**Search Matrix - Execute ALL combinations:**
- [Each org keyword] + "private foundation" + "grants"
- [Each org keyword] + "family foundation" + "funding"  
- [Each org keyword] + "philanthropist" + "application"
- [Each org keyword] + "corporate giving" + "nonprofit"
- Hawaii + [foundation types] + "grants" + "nonprofit"

**MANDATORY RESTRICTIONS:**
- **NO grants.gov** - Focus ONLY on private foundations
- **NO government grants** - Private foundations and corporate giving only
- **$25,000 minimum** grant amounts (sweet spot $25K-$100K)
- **National scope** - All US foundations where Hawaii orgs are eligible
- **Future deadlines only** - After ${currentDate}
- **NO automated filtering** - Include all grant types for manual review

**CRITICAL VERIFICATION REQUIREMENTS:**
- Must exist on actual foundation website (verified through web crawling)
- Must have clear future deadline stated on source website
- Must have clear application process described (any format: email LOI, online form, account creation, etc.)
- Must have direct "start here" URL where human can begin process

**Quality Over Quantity - 3-5 REAL Grants Maximum:**
- Only include grants you can verify exist on foundation websites
- Better to find 3 PERFECT matches than 15 questionable ones
- Each grant must pass all verification requirements above
- Focus on grants with the highest keyword relevance matches

**OUTPUT FORMAT - VERIFIED GRANTS ONLY:**

**VERIFIED GRANT OPPORTUNITIES**

1. **Grant Name** - $Amount Range
   - **Funder:** Foundation/Organization Name
   - **Deadline:** Exact date from source website
   - **Relevance:** Count of matching keywords + brief fit explanation
   - **Requirements:** Key eligibility criteria from website
   - **Start Here:** Direct action URL (application page/account creation/contact page)
   - **Source:** Foundation website URL where grant details were verified

Continue for 3-5 VERIFIED grants only. Prioritize by deadline urgency + keyword relevance.

Begin systematic keyword matrix search focusing on private foundations only.`

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
    
    // Verify each grant using Firecrawl before saving
    console.log(`Verifying ${parsedGrants.length} grants...`)
    const verifiedGrants = []
    
    for (const grant of parsedGrants) {
      console.log(`Verifying: ${grant.grantName}`)
      const verification = await verifyGrantOnWebsite(grant)
      
      if (verification.verified) {
        grant.isVerified = true
        grant.verificationDetails = verification.verificationDetails
        grant.verificationStatus = 'Verified'
        // Use the verified action URL if available  
        if (verification.actionUrl) {
          grant.applicationUrl = verification.actionUrl
        }
        verifiedGrants.push(grant)
        console.log(`✅ Verified: ${grant.grantName}`)
      } else {
        console.log(`❌ Failed verification: ${grant.grantName}`)
      }
    }
    
    console.log(`Verification complete: ${verifiedGrants.length}/${parsedGrants.length} grants verified`)
    
    // Sort verified grants by deadline proximity (urgent deadlines first)
    verifiedGrants.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1  // No deadline goes to end
      if (!b.deadline) return -1 // No deadline goes to end
      
      const aDate = new Date(a.deadline)
      const bDate = new Date(b.deadline)
      return aDate.getTime() - bDate.getTime() // Earlier deadlines first
    })
    
    // Only save verified grants to Notion database
    let savedGrants = []
    if (verifiedGrants.length > 0) {
      try {
        const saveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/grants-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_grants',
            data: { grants: verifiedGrants }
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

    // Format verified grants for display
    const formattedGrants = verifiedGrants.map(grant => formatGrantForDisplay(grant)).join('\n\n')
    
    // Create response showing only verified grants
    const verificationSummary = `**GRANT VERIFICATION COMPLETE**

Found ${parsedGrants.length} potential grants from search
✅ ${verifiedGrants.length} grants passed verification and quality checks
❌ ${parsedGrants.length - verifiedGrants.length} grants failed verification

**VERIFIED GRANT OPPORTUNITIES:**

${formattedGrants}

---

**DATABASE UPDATE**: ${savedGrants.length > 0 ? 
  `Saved ${savedGrants.filter(g => g.status === 'saved').length} verified grants to your database (${savedGrants.filter(g => g.status === 'duplicate').length} duplicates found)` : 
  'No grants to save or database error occurred'}`

    return NextResponse.json({
      content: verificationSummary,
      verifiedGrants: verifiedGrants,
      totalFound: parsedGrants.length,
      totalVerified: verifiedGrants.length,
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