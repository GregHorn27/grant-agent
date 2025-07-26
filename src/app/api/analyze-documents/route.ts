import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// Document Analysis System Prompt
const ANALYSIS_PROMPT = `You are analyzing documents to learn about an organization for grant writing purposes. Your goal is to extract and understand:

## Key Information to Extract:
1. **Organization Name & Legal Structure** (501c3, LLC, etc.)
2. **Mission Statement** - What they do and why
3. **Focus Areas** - Primary activities, programs, services
4. **Geographic Location** - Where they operate
5. **Target Population** - Who they serve
6. **Unique Qualifications** - Special expertise, partnerships, track record
7. **Past Grant Experience** - Previous funders, successful projects
8. **Current Needs** - What they might seek funding for
9. **Budget Size/Scope** - Scale of operations
10. **Key People** - Leadership, board members

## Output Format:
Provide a comprehensive but conversational analysis in this format:

# Organization Profile Analysis

## Overview
[Brief summary of what the organization does]

## Key Details
- **Name**: [Organization name]
- **Type**: [Legal structure if mentioned]
- **Location**: [Geographic focus]
- **Mission**: [Mission statement or core purpose]

## Focus Areas
[List their primary activities/programs]

## Unique Strengths
[What makes them special/qualified for grants]

## Grant Readiness
[Assessment of their readiness for different types of grants]

## Questions for Clarification
[2-3 specific questions about gaps in the information]

## Recommended Next Steps
[Specific suggestions for grant strategy based on their profile]

Be conversational and friendly. If information is missing or unclear, ask specific clarifying questions. Focus on actionable insights that will help with grant discovery and application.`

// Structured Profile Extraction Prompt
const PROFILE_EXTRACTION_PROMPT = `Based on the same documents, extract structured data to create an organization profile.

CRITICAL: Return ONLY the JSON object below. No markdown, no code blocks, no explanation, no other text. Just the raw JSON object starting with { and ending with }.

{
  "profileName": "Organization Name",
  "legalName": "Full Legal Name (if different from profile name)",
  "legalStructure": "501(c)(3)" | "Fiscally-Sponsored" | "LLC" | "Corporation" | "Other",
  "location": "City, State/Province, Country",
  "missionStatement": "Complete mission statement",
  "focusAreas": ["focus area 1", "focus area 2", "focus area 3"],
  "targetPopulation": "Description of who they serve",
  "uniqueQualifications": "Key strengths, expertise, partnerships",
  "leadership": "Key leadership names and roles",
  "budgetRange": "Under $50K" | "$50K-$250K" | "$250K-$1M" | "Over $1M",
  "website": "https://website.com (if mentioned)"
}

If any information is not found, use empty string "" for text fields and empty array [] for arrays. Make your best guess for budgetRange based on project scope mentioned.

IMPORTANT: Your response must start with { and end with }. Do NOT wrap in code blocks or any other formatting.`

// Function to clean JSON response from Claude (remove markdown formatting if present)  
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

// Function to save organization profile to Notion
async function saveProfileToNotion(profileData: any, logToFile = console.log) {
  try {
    
    const notionResponse = await fetch('http://localhost:3000/api/notion-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save_profile',
        data: {
          ...profileData,
          activeStatus: true, // Set as active profile
          documentsAnalyzed: [`Analysis from ${new Date().toISOString()}`]
        }
      })
    })

    const result = await notionResponse.json()
    
    if (result.success) {
      return {
        success: true,
        profileId: result.profile.id,
        profileUrl: result.profile.url
      }
    } else {
      logToFile(`❌ Failed to save to Notion: ${result.error}`)
      return {
        success: false,
        error: result.error
      }
    }
  } catch (error) {
    logToFile(`💥 Error saving to Notion: ${error.message}`)
    return {
      success: false,
      error: error.message
    }
  }
}

async function extractTextFromFile(file: File, logToFile = console.log): Promise<string> {
  
  let buffer;
  try {
    buffer = await file.arrayBuffer()
  } catch (bufferError) {
    logToFile(`❌ Error getting file buffer: ${bufferError.message}`)
    throw new Error(`Failed to read file buffer: ${bufferError.message}`)
  }
  
  try {
    // Check file extension as fallback for MIME type detection issues
    const isTextFile = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
    const isMarkdownFile = file.type === 'text/markdown' || file.name.toLowerCase().endsWith('.md')
    
    if (isTextFile || isMarkdownFile) {
      const text = new TextDecoder().decode(buffer)
      return text
    } else {
      throw new Error(`Unsupported file: ${file.name}. Only text (.txt) and markdown (.md) files are supported.`)
    }
  } catch (error) {
    logToFile(`💥 Error extracting text from ${file.name}: ${error.message}`)
    throw new Error(`Failed to extract text from ${file.name}: ${error.message}`)
  }
}

export async function POST(req: NextRequest) {
  // Write all logs to a file we can check
  const fs = require('fs');
  const logToFile = (message) => {
    try {
      fs.appendFileSync('/tmp/pdf-debug.log', `${new Date().toISOString()}: ${message}\n`);
      console.log(message);
    } catch (e) {
      console.log(message);
    }
  };
  
  if (!CLAUDE_API_KEY) {
    return NextResponse.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    )
  }

  try {
    
    let formData;
    try {
      formData = await req.formData()
    } catch (formDataError) {
      logToFile('❌ FormData parsing failed: ' + formDataError.message)
      return NextResponse.json(
        { error: `Failed to parse FormData: ${formDataError.message}` },
        { status: 400 }
      )
    }
    
    const files = formData.getAll('files') as File[]
    const userMessage = formData.get('userMessage') as string || "Please analyze these documents to learn about my organization."
    
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }


    const extractedTexts = []
    let successfulExtractions = 0
    
    // Extract text from all files with better error handling
    for (const file of files) {
      try {
        
        const text = await extractTextFromFile(file, logToFile)
        
        if (text && text.trim().length > 0) {
          extractedTexts.push({
            filename: file.name,
            content: text.substring(0, 15000), // Limit to avoid context limits
            success: true
          })
          successfulExtractions++
        } else {
          throw new Error('No text content extracted')
        }
      } catch (error) {
        logToFile(`❌ Error processing file ${file.name}: ${error.message}`)
        const errorMessage = error.message || 'Unknown error';
        extractedTexts.push({
          filename: file.name,
          content: `[Could not extract text from ${file.name}: ${errorMessage}]`,
          success: false,
          error: errorMessage
        })
      }
    }

    if (successfulExtractions === 0) {
      const failedFiles = extractedTexts.filter(({ success }) => !success);
      const errorDetails = failedFiles.map(f => `• **${f.filename}**: ${f.error || 'Unknown error'}`).join('\n');
      
      return NextResponse.json({
        content: `I wasn't able to extract text from any of the uploaded files. Here are the specific issues:

${errorDetails}

**Common solutions:**
1. **For corrupted/malformed PDFs**: Try re-saving or re-exporting the PDF from the original application
2. **For password-protected files**: Remove password protection and re-upload  
3. **For scanned/image PDFs**: Use OCR software first, or provide a text version
4. **Alternative**: Describe your organization manually in our conversation

I'm here to help either way! What would you prefer to do?`,
        extractedFiles: extractedTexts,
        success: false
      })
    }

    // Combine all extracted texts
    const combinedContent = extractedTexts
      .filter(({ success }) => success)
      .map(({ filename, content }) => `\n\n=== ${filename} ===\n${content}`)
      .join('')

    const failedFiles = extractedTexts.filter(({ success }) => !success)

    // Create analysis prompt with user message context
    const analysisContent = `The user said: "${userMessage}"

Here are the documents they uploaded:
${combinedContent}

${failedFiles.length > 0 ? `\nNote: I couldn't extract text from these files: ${failedFiles.map(f => f.filename).join(', ')}. Please mention this to the user.` : ''}

${ANALYSIS_PROMPT}`


    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: analysisContent
          }
        ]
      }),
    })


    if (!response.ok) {
      const error = await response.text()
      logToFile(`❌ Claude API Error: ${error}`)
      return NextResponse.json(
        { error: 'Failed to analyze documents with Claude' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Extract structured profile data for Notion
    
    const profileExtractionContent = `Here are the documents:
${combinedContent}

${PROFILE_EXTRACTION_PROMPT}`

    const profileResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: profileExtractionContent
          }
        ]
      }),
    })

    let notionResult = null
    
    if (profileResponse.ok) {
      try {
        const profileData = await profileResponse.json()
        const rawProfileText = profileData.content[0].text.trim()
        
        // Clean JSON response (remove markdown formatting if present)
        const cleanedProfileText = cleanJsonResponse(rawProfileText)
        
        // Parse JSON response
        const profileJson = JSON.parse(cleanedProfileText)
        
        // Save to Notion
        notionResult = await saveProfileToNotion(profileJson, logToFile)
        
      } catch (profileError) {
        logToFile(`⚠️ Profile extraction failed: ${profileError.message}`)
        logToFile(`🔍 Error details: ${profileError.stack}`)
      }
    } else {
      logToFile(`❌ Profile extraction API call failed: ${profileResponse.status}`)
    }
    
    return NextResponse.json({
      content: data.content[0].text,
      extractedFiles: extractedTexts.map(({ filename, success }) => ({ filename, success })),
      successfulExtractions,
      totalFiles: files.length,
      usage: data.usage,
      notionProfile: notionResult // Include Notion save result
    })

  } catch (error) {
    console.error('Document Analysis Error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}