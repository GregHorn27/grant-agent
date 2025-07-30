import { NextRequest, NextResponse } from 'next/server'
import { parseGrantsFromResponse, formatGrantForDisplay } from '../../../utils/grantParser'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

// Web search grant validation function - validates grants from Claude web search results
function validateWebSearchGrant(grantData: {
  grantName?: string;
  funder?: string;
  sourceUrl?: string;
  applicationUrl?: string;
  deadline?: string;
  amount?: string;
  notes?: string;
}): { 
  isValid: boolean; 
  score: number;
  details?: any; 
  reason?: string;
} {
  let score = 0
  const validationDetails = {
    hasGrantName: false,
    hasFunder: false,
    hasSourceUrl: false,
    hasDeadline: false,
    hasAmount: false,
    hasWebsiteQuote: false,
    deadlineIsFuture: false
  }

  // Check for grant name (required)
  if (grantData.grantName && grantData.grantName.trim().length > 5) {
    validationDetails.hasGrantName = true
    score += 20
  }

  // Check for funder (required)
  if (grantData.funder && grantData.funder.trim().length > 3) {
    validationDetails.hasFunder = true
    score += 20
  }

  // Check for source URL (highly preferred)
  if (grantData.sourceUrl && grantData.sourceUrl.startsWith('http')) {
    validationDetails.hasSourceUrl = true
    score += 15
  }

  // Check for deadline (required)
  if (grantData.deadline) {
    validationDetails.hasDeadline = true
    score += 15
    
    // Verify deadline is in the future
    try {
      const deadlineDate = new Date(grantData.deadline)
      const today = new Date()
      if (deadlineDate > today) {
        validationDetails.deadlineIsFuture = true
        score += 10
      } else {
        score -= 20 // Penalize past deadlines heavily
      }
    } catch (error) {
      // Invalid date format
      score -= 10
    }
  }

  // Check for grant amount (preferred)
  if (grantData.amount && grantData.amount.includes('$')) {
    validationDetails.hasAmount = true
    score += 10
  }

  // Check for website quote as proof (preferred)
  if (grantData.notes && (grantData.notes.includes('QUOTE:') || grantData.notes.includes('Website Quote:'))) {
    validationDetails.hasWebsiteQuote = true
    score += 10
  }

  // Determine if grant is valid (minimum score required)
  const isValid = score >= 50 && validationDetails.hasGrantName && validationDetails.hasFunder

  if (!isValid) {
    let reason = 'Failed validation: '
    if (!validationDetails.hasGrantName) reason += 'Missing grant name. '
    if (!validationDetails.hasFunder) reason += 'Missing funder. '
    if (!validationDetails.hasDeadline) reason += 'Missing deadline. '
    if (validationDetails.hasDeadline && !validationDetails.deadlineIsFuture) reason += 'Past deadline. '
    if (score < 50) reason += `Low validation score (${score}/100). `
    
    return { isValid: false, score, reason: reason.trim() }
  }

  return {
    isValid: true,
    score,
    details: validationDetails
  }
}

// Smart URL filtering function - identifies promising grant pages for Firecrawl extraction
function isGrantRelevant(title: string, url: string): boolean {
  const grantKeywords = [
    'grant', 'funding', 'foundation', 'apply', 'application',
    'opportunity', 'award', 'fellowship', 'scholarship', 'program',
    'deadline', 'eligibility', 'guidelines'
  ]
  
  const relevantDomains = [
    'foundation.org', 'getty.edu', 'fordfoundation.org', 
    'packard.org', 'christensenfund.org', 'doi.gov',
    'fundsforngos.org', 'zeffy.com'
  ]
  
  const titleMatch = grantKeywords.some(keyword => 
    title.toLowerCase().includes(keyword)
  )
  
  const urlMatch = relevantDomains.some(domain => 
    url.includes(domain)
  ) || grantKeywords.some(keyword => 
    url.toLowerCase().includes(keyword)
  )
  
  return titleMatch || urlMatch
}

// Extract promising URLs from web search results for content analysis
function extractPromisingUrls(webSearchData: any): Array<{url: string, title: string, relevanceScore: number}> {
  const urls: Array<{url: string, title: string, relevanceScore: number}> = []
  
  try {
    for (const contentBlock of webSearchData.content || []) {
      if (contentBlock.type === "web_search_tool_result") {
        contentBlock.content?.forEach((result: any) => {
          if (result.url && result.title && isGrantRelevant(result.title, result.url)) {
            // Calculate relevance score based on keywords and domain
            let score = 50
            const title = result.title.toLowerCase()
            const url = result.url.toLowerCase()
            
            // Boost for high-value keywords
            if (title.includes('grant') || url.includes('grant')) score += 20
            if (title.includes('apply') || url.includes('apply')) score += 15
            if (title.includes('foundation')) score += 10
            if (title.includes('indigenous') || title.includes('hawaiian')) score += 15
            
            // Boost for trusted domains
            if (url.includes('getty.edu') || url.includes('doi.gov')) score += 20
            if (url.includes('foundation.org')) score += 15
            
            urls.push({
              url: result.url,
              title: result.title,
              relevanceScore: score
            })
          }
        })
      }
    }
    
    // Sort by relevance score and return top 3 for MVP
    return urls
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3)
      
  } catch (error) {
    console.error('Error extracting promising URLs:', error)
    return []
  }
}

// Firecrawl content extraction with error handling and validation
async function extractGrantContent(urls: Array<{url: string, title: string, relevanceScore: number}>): Promise<Array<{url: string, title: string, content: string, success: boolean}>> {
  if (!FIRECRAWL_API_KEY) {
    console.error('Firecrawl API key not configured')
    return []
  }

  console.log(`🔥 Extracting content from ${urls.length} promising grant URLs using Firecrawl...`)
  
  const results = await Promise.allSettled(
    urls.map(async (urlData) => {
      try {
        console.log(`🔥 Scraping: ${urlData.title} (${urlData.url})`)
        
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
          },
          body: JSON.stringify({
            url: urlData.url,
            formats: ['markdown'],
            timeout: 10000 // 10 second timeout for MVP
          })
        })

        if (!response.ok) {
          console.warn(`❌ Firecrawl failed for ${urlData.url}: ${response.status}`)
          return {
            url: urlData.url,
            title: urlData.title,
            content: '',
            success: false
          }
        }

        const data = await response.json()
        const content = data.markdown || data.content || ''
        
        // Basic content validation - check for grant indicators
        const hasGrantContent = content.toLowerCase().includes('grant') || 
                               content.toLowerCase().includes('apply') || 
                               content.toLowerCase().includes('deadline') || 
                               content.toLowerCase().includes('funding')
        
        if (!hasGrantContent || content.length < 500) {
          console.warn(`⚠️ Low quality content from ${urlData.url} (${content.length} chars, grant indicators: ${hasGrantContent})`)
        }
        
        console.log(`✅ Successfully extracted ${content.length} characters from ${urlData.title}`)
        
        return {
          url: urlData.url,
          title: urlData.title,
          content: content,
          success: true
        }
        
      } catch (error) {
        console.error(`❌ Error scraping ${urlData.url}:`, error)
        return {
          url: urlData.url,
          title: urlData.title,
          content: '',
          success: false
        }
      }
    })
  )

  // Extract successful results
  const extractedContent = results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value)
    .filter(result => result.success && result.content.length > 0)

  console.log(`🔥 Firecrawl extraction complete: ${extractedContent.length}/${urls.length} successful`)
  
  return extractedContent
}

export async function POST(req: NextRequest) {
  if (!CLAUDE_API_KEY) {
    return NextResponse.json(
      { error: 'Claude API key not configured' },
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

    // Step 1: Build comprehensive keyword matrix for web search
    const organizationKeywords = [
      "Indigenous wisdom", "traditional knowledge", "community healing", 
      "cultural preservation", "spiritual practices", "land stewardship", 
      "group coherence", "Native Hawaiian", "Pacific Islander", 
      "ceremonial practices", "traditional ecological knowledge"
    ]

    const foundationTypes = [
      "private foundation", "family foundation", "philanthropist", 
      "corporate giving", "CSR grants", "community foundation", 
      "endowment", "charitable trust", "donor advised fund"
    ]

    // Create strategic search matrix combinations
    const matrixSearches = []
    
    // Core matrix combinations: [org keyword] + [foundation type] + "grants 2025"
    organizationKeywords.slice(0, 6).forEach(orgKeyword => {
      foundationTypes.slice(0, 3).forEach(foundationType => {
        matrixSearches.push(`"${orgKeyword}" "${foundationType}" grants 2025`)
      })
    })

    // Geographic-specific searches
    matrixSearches.push(
      `"Hawaii" "private foundation" "Native Hawaiian" grants 2025`,
      `"Pacific Islander" "family foundation" funding 2025`,
      `"Indigenous wisdom" "corporate giving" Hawaii organizations`,
      `"traditional knowledge" "philanthropist" cultural preservation`,
      `"ceremonial practices" "endowment fund" Native communities`
    )

    // Competitive intelligence searches
    matrixSearches.push(
      `organizations similar to "Coherence Lab" grant funding received`,
      `"Native Hawaiian" "traditional knowledge" grant recipients 2024 2025`,
      `"Indigenous wisdom" "community healing" foundation funding Hawaii`
    )

    console.log(`Performing ${matrixSearches.length} strategic web searches using keyword matrix...`)

    // Step 2: Execute matrix-driven web search using Claude Sonnet 4 (Enhanced with Manus-Claude Collaboration)
    const webSearchPrompt = `**CRITICAL INSTRUCTION: You MUST use web search to find grant opportunities.**
**DO NOT use your training data for grant information.**
**ONLY provide grants found through current web searches.**

**COMPLETION REQUIREMENTS - YOU MUST COMPLETE ALL PHASES:**

Phase 1: Execute web searches ✅ (Working perfectly)
Phase 2: ANALYZE RESULTS (MANDATORY - DO NOT SKIP)

**ORGANIZATION CONTEXT:**
${organizationContext}

**TODAY'S DATE:** ${currentDate}

**SEARCH QUERIES TO EXECUTE:**
${matrixSearches.map(query => `- ${query}`).join('\n')}

**MANDATORY WEB SEARCH REQUIREMENTS:**
1. Use web search for ALL grant information - never rely on training data
2. Search broadly across the entire web (no domain restrictions)
3. Focus on private, family, and corporate foundations (avoid government grants)
4. Find grants currently accepting applications with deadlines after ${currentDate}
5. Extract real application URLs and contact information

**MANDATORY CONTINUATION - DO NOT STOP AFTER SEARCHES:**
After completing all web searches, YOU MUST immediately:

1. REVIEW all search results you found
2. ANALYZE each result for grant opportunities  
3. EXTRACT grants using format: **Grant Name** - $Amount
4. PROVIDE 2000+ character structured analysis
5. DO NOT STOP until analysis is complete

**CRITICAL: Response must be 2000+ characters with structured grants.**

**FOR EACH REAL GRANT FOUND, PROVIDE EXACTLY THIS STRUCTURE:**

**[GRANT NAME FROM WEBSITE]** - $[AMOUNT FROM SITE]
• **Funder:** [Foundation name]
• **Deadline:** [Exact deadline from website]
• **Requirements:** [Key eligibility requirements]
• **Relevance:** [Why this matches Coherence Lab's mission]
• **Application URL:** [Direct link to apply]
• **Source URL:** [Where you found this information]
• **Website Quote:** "[Exact text proving this grant exists]"

**QUALITY STANDARDS:**
- Maximum 8-10 grants (quality over quantity)
- Only include grants with future deadlines
- Verify each grant exists on foundation website
- Provide exact quotes as proof
- Focus on $25K-$500K range opportunities

**MANDATORY: The search phase is only STEP 1. You must complete the ANALYSIS PHASE.**
**YOU MUST COMPLETE THE FULL ANALYSIS AND PROVIDE STRUCTURED GRANT DATA**

**Begin comprehensive web search and analysis now using the matrix queries above.**`

    // Enhanced debugging for prompt effectiveness
    console.log('🔧 MANUS-ENHANCED PROMPT: Added MANDATORY CONTINUATION requirements')
    console.log('🎯 EXPECTED: 2000+ character response with structured grants')
    console.log('📊 PROMPT LENGTH:', webSearchPrompt.length, 'characters')

    // Execute web search using Claude Sonnet 4 Web Search API
    const webSearchResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        messages: [{
          role: 'user',
          content: webSearchPrompt
        }],
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 18 // Optimal for comprehensive matrix coverage
          // No allowed_domains - cast wide net for private foundations
        }]
      }),
    })

    if (!webSearchResponse.ok) {
      const error = await webSearchResponse.text()
      console.error('Claude Web Search API Error:', error)
      return NextResponse.json(
        { error: 'Failed to execute web search for grants' },
        { status: webSearchResponse.status }
      )
    }

    const webSearchData = await webSearchResponse.json()
    
    console.log('🔍 DEBUG: Starting response parsing with Manus method...')
    console.log('🔍 DEBUG: Web search response keys:', Object.keys(webSearchData))
    console.log('🔍 DEBUG: Response content blocks count:', webSearchData.content?.length || 0)
    
    // Log all content block types first (Manus debugging approach)
    if (webSearchData.content) {
      webSearchData.content.forEach((block: any, index: number) => {
        console.log(`🔍 DEBUG: Block ${index} type:`, block.type)
        if (block.type === 'text') {
          console.log(`🔍 DEBUG: Block ${index} text length:`, block.text?.length || 0)
          console.log(`🔍 DEBUG: Block ${index} has citations:`, !!block.citations)
          console.log(`🔍 DEBUG: Block ${index} text preview:`, block.text?.substring(0, 150) + '...')
        } else if (block.type === 'server_tool_use') {
          console.log(`🔍 DEBUG: Block ${index} tool name:`, block.name)
          console.log(`🔍 DEBUG: Block ${index} tool input:`, block.input?.query)
        } else if (block.type === 'web_search_tool_result') {
          console.log(`🔍 DEBUG: Block ${index} search results count:`, block.content?.length || 0)
        }
      })
    }
    
    // Extract using Manus method: iterate through content blocks
    let fullResponseText = ""
    let citations: any[] = []
    let textBlockCount = 0
    let grantResults = ''
    
    try {
      for (const contentBlock of webSearchData.content || []) {
        if (contentBlock.type === "text") {
          textBlockCount++
          console.log(`🔍 DEBUG: Processing text block ${textBlockCount}`)
          console.log(`🔍 DEBUG: Text content preview:`, contentBlock.text?.substring(0, 200) + '...')
          
          fullResponseText += contentBlock.text + " "
          
          // Extract citations if present (Manus method)
          if (contentBlock.citations) {
            console.log(`🔍 DEBUG: Found ${contentBlock.citations.length} citations in block ${textBlockCount}`)
            citations.push(...contentBlock.citations)
            contentBlock.citations.forEach((citation: any, citIndex: number) => {
              console.log(`🔍 DEBUG: Citation ${citIndex + 1}:`, {
                url: citation.url,
                title: citation.title,
                cited_text_preview: citation.cited_text?.substring(0, 100) + '...'
              })
            })
          }
        } else if (contentBlock.type === "server_tool_use") {
          console.log(`🔍 DEBUG: Found server_tool_use block:`, contentBlock.name, contentBlock.input?.query)
        } else if (contentBlock.type === "web_search_tool_result") {
          console.log(`🔍 DEBUG: Found web_search_tool_result with ${contentBlock.content?.length || 0} results`)
          if (contentBlock.content) {
            contentBlock.content.forEach((result: any, resultIndex: number) => {
              console.log(`🔍 DEBUG: Search result ${resultIndex + 1}:`, {
                url: result.url,
                title: result.title,
                page_age: result.page_age
              })
            })
          }
        }
      }
      
      grantResults = fullResponseText.trim()
      
      console.log(`🔍 DEBUG: Final response text length:`, grantResults.length)
      console.log(`🔍 DEBUG: Total citations found:`, citations.length)
      console.log(`🔍 DEBUG: Text blocks processed:`, textBlockCount)
      console.log(`🔍 DEBUG: Response text preview:`, grantResults.substring(0, 500) + '...')
      
      // Enhanced debugging for Manus-enhanced prompt effectiveness
      console.log('🎯 MANUS ANALYSIS: Response length validation')
      if (grantResults.length < 500) {
        console.log('❌ CRITICAL: Response too short!', grantResults.length, 'chars (expected 2000+)')
        console.log('🚨 LIKELY CAUSE: Claude stopped after search phase without analysis')
        console.log('🔍 DEBUG: Full response text:', grantResults)
      } else if (grantResults.length < 2000) {
        console.log('⚠️  WARNING: Response shorter than expected', grantResults.length, 'chars (expected 2000+)')
        console.log('🔍 Partial analysis may have occurred')
      } else {
        console.log('✅ SUCCESS: Response length meets Manus expectations', grantResults.length, 'chars')
      }
      
      if (grantResults.length === 0) {
        console.log('❌ WARNING: No text content extracted from response blocks!')
        console.log('🔍 DEBUG: Falling back to JSON stringification for analysis')
        grantResults = JSON.stringify(webSearchData.content, null, 2)
      } else {
        console.log('✅ Successfully extracted content using Manus multi-block method')
      }
      
    } catch (error) {
      console.error('🚨 Error during Manus extraction method:', error)
      console.log('🔍 DEBUG: Falling back to original approach...')
      
      // Fallback to original approach if Manus method fails
      if (webSearchData.content && webSearchData.content[0] && webSearchData.content[0].text) {
        grantResults = webSearchData.content[0].text
        console.log('✅ Fallback: Using content[0].text format')
      } else {
        grantResults = JSON.stringify(webSearchData)
        console.log('❌ Fallback: Using JSON stringification')
      }
    }

    console.log(`✅ Web search completed using ${matrixSearches.length} strategic queries`)

    // NEW HYBRID APPROACH: Step 2 - Extract promising URLs and get content via Firecrawl
    console.log('🎯 HYBRID APPROACH: Extracting promising URLs from web search results...')
    const promisingUrls = extractPromisingUrls(webSearchData)
    
    console.log(`📍 Found ${promisingUrls.length} promising grant URLs:`)
    promisingUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url.title} (Score: ${url.relevanceScore}) - ${url.url}`)
    })
    
    let parsedGrants: any[] = []
    
    if (promisingUrls.length > 0) {
      // Extract content using Firecrawl
      const extractedContent = await extractGrantContent(promisingUrls)
      
      if (extractedContent.length > 0) {
        console.log('🎯 HYBRID APPROACH: Analyzing extracted content with Claude...')
        
        // Prepare content for Claude analysis
        const contentForAnalysis = extractedContent.map(item => 
          `**SOURCE: ${item.title}**\n**URL: ${item.url}**\n\n${item.content}\n\n---\n\n`
        ).join('')
        
        // Send to Claude for grant extraction and analysis
        const analysisPrompt = `**GRANT ANALYSIS TASK: Extract structured grant opportunities from the following website content.**

**ORGANIZATION CONTEXT:**
${organizationContext}

**TODAY'S DATE:** ${currentDate}

**WEBSITE CONTENT TO ANALYZE:**
${contentForAnalysis}

**INSTRUCTIONS:**
1. Analyze the above website content for grant opportunities
2. Extract ONLY grants that are currently accepting applications with deadlines after ${currentDate}
3. Focus on grants relevant to Indigenous wisdom, traditional knowledge, community healing, and cultural preservation

**FOR EACH REAL GRANT FOUND, PROVIDE EXACTLY THIS STRUCTURE:**

**[GRANT NAME FROM WEBSITE]** - $[AMOUNT FROM SITE]
• **Funder:** [Foundation name]
• **Deadline:** [Exact deadline from website]
• **Requirements:** [Key eligibility requirements]
• **Relevance:** [Why this matches Coherence Lab's mission]
• **Application URL:** [Direct link to apply or main grant page]
• **Source URL:** [Where you found this information]

**IMPORTANT:**
- Only include grants with future deadlines
- Provide exact information from the websites
- Maximum 5 grants (quality over quantity)
- If no grants found in content, respond with "No current grant opportunities found in the analyzed content."

**Analyze the content and extract structured grant data now:**`

        console.log(`📝 Sending ${contentForAnalysis.length} characters to Claude for analysis...`)
        
        const analysisResponse = await fetch(CLAUDE_API_URL, {
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
              content: analysisPrompt
            }]
          }),
        })

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          const analysisText = analysisData.content?.[0]?.text || ''
          
          console.log(`✅ Grant analysis complete: ${analysisText.length} characters`)
          console.log('🔍 Analysis preview:', analysisText.substring(0, 300) + '...')
          
          // Parse grants from Claude's analysis
          parsedGrants = parseGrantsFromResponse(analysisText)
          console.log(`🎯 HYBRID SUCCESS: Parsed ${parsedGrants.length} grants from Firecrawl content analysis`)
        } else {
          console.error('❌ Claude analysis failed:', analysisResponse.status)
        }
      } else {
        console.log('⚠️ No content successfully extracted from promising URLs')
      }
    } else {
      console.log('⚠️ No promising URLs found in web search results')
    }
    
    // Fallback: if hybrid approach found no grants, try old parsing approach
    if (parsedGrants.length === 0) {
      console.log('🔄 FALLBACK: Trying original parsing approach...')
      parsedGrants = parseGrantsFromResponse(grantResults)
    }
    
    console.log(`🔍 DEBUG: Parsed ${parsedGrants.length} grants from response`)
    if (parsedGrants.length > 0) {
      parsedGrants.forEach((grant, index) => {
        console.log(`🔍 DEBUG: Grant ${index + 1}:`, {
          name: grant.grantName || 'NO NAME',
          funder: grant.funder || 'NO FUNDER',
          amount: grant.amount || 'NO AMOUNT',
          deadline: grant.deadline || 'NO DEADLINE',
          sourceUrl: grant.sourceUrl || 'NO SOURCE URL',
          applicationUrl: grant.applicationUrl || 'NO APPLICATION URL'
        })
      })
    } else {
      console.log('❌ WARNING: No grants were parsed from the response!')
      console.log('🔍 DEBUG: Raw response text sample for analysis:', grantResults.substring(0, 1000))
    }
    
    // Step 3: Validate web search results and enhance grant data
    console.log(`Validating ${parsedGrants.length} grants from web search results...`)
    const validatedGrants = []
    
    for (const grant of parsedGrants) {
      console.log(`Validating: ${grant.grantName}`)
      
      // Basic validation checks for web search results
      const validation = validateWebSearchGrant(grant)
      
      if (validation.isValid) {
        grant.isVerified = true
        grant.verificationStatus = 'Web Search Verified'
        grant.searchSource = 'Claude Web Search API'
        grant.validationScore = validation.score
        
        // Add validation details
        if (validation.details) {
          grant.verificationDetails = validation.details
        }
        
        validatedGrants.push(grant)
        console.log(`✅ Validated: ${grant.grantName} (Score: ${validation.score}/100)`)
      } else {
        console.log(`❌ Failed validation: ${grant.grantName} - ${validation.reason}`)
      }
    }
    
    console.log(`Validation complete: ${validatedGrants.length}/${parsedGrants.length} grants validated`)
    
    // Sort validated grants by deadline proximity (urgent deadlines first)
    validatedGrants.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1  // No deadline goes to end
      if (!b.deadline) return -1 // No deadline goes to end
      
      const aDate = new Date(a.deadline)
      const bDate = new Date(b.deadline)
      return aDate.getTime() - bDate.getTime() // Earlier deadlines first
    })
    
    // Only save validated grants to Notion database
    let savedGrants = []
    if (validatedGrants.length > 0) {
      try {
        const saveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/grants-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_grants',
            data: { grants: validatedGrants }
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

    // Format validated grants for display
    const formattedGrants = validatedGrants.map(grant => formatGrantForDisplay(grant)).join('\n\n')
    
    // Create response showing web search results
    const searchSummary = `**WEB SEARCH GRANT DISCOVERY COMPLETE**

Executed ${matrixSearches.length} strategic web searches using keyword matrix
Found ${parsedGrants.length} potential grants from web search
✅ ${validatedGrants.length} grants passed validation and quality checks
❌ ${parsedGrants.length - validatedGrants.length} grants failed validation

**VALIDATED GRANT OPPORTUNITIES:**

${formattedGrants}

---

**DATABASE UPDATE**: ${savedGrants.length > 0 ? 
  `Saved ${savedGrants.filter((g: any) => g.status === 'saved').length} validated grants to your database (${savedGrants.filter((g: any) => g.status === 'duplicate').length} duplicates found)` : 
  'No grants to save or database error occurred'}`

    return NextResponse.json({
      content: searchSummary,
      verifiedGrants: validatedGrants,
      totalFound: parsedGrants.length,
      totalVerified: validatedGrants.length,
      savedGrants: savedGrants,
      searchQueries: matrixSearches,
      usage: webSearchData.usage,
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