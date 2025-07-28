// Grant Parser Utility
// Extracts structured grant data from Claude's text response format

interface ParsedGrant {
  grantName: string
  funder: string
  amount: string
  deadline?: string
  relevanceScore?: number
  description?: string
  requirements?: string
  applicationUrl?: string
  priorityRank?: number
  notes?: string
  status?: string
}

export function parseGrantsFromResponse(responseText: string): ParsedGrant[] {
  const grants: ParsedGrant[] = []
  
  try {
    // Split response into individual grant entries
    // Looking for pattern: "1. **Grant Name** - $Amount"
    const grantSections = responseText.split(/\d+\.\s*\*\*/).filter(section => section.trim().length > 0)
    
    grantSections.forEach((section, index) => {
      try {
        const grant = parseIndividualGrant(section, index + 1)
        if (grant) {
          grants.push(grant)
        }
      } catch (error) {
        console.warn(`Failed to parse grant section ${index + 1}:`, error)
      }
    })
    
    return grants
  } catch (error) {
    console.error('Error parsing grants response:', error)
    return []
  }
}

function parseIndividualGrant(section: string, rank: number): ParsedGrant | null {
  try {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    if (lines.length === 0) return null
    
    // Extract grant name and amount from first line
    // Format: "Grant Name** - $Amount Range"
    const firstLine = lines[0]
    const nameMatch = firstLine.match(/^(.+?)\*\*\s*-\s*(.+)$/)
    
    if (!nameMatch) return null
    
    const grantName = nameMatch[1].trim()
    const amount = nameMatch[2].trim()
    
    // Initialize grant object
    const grant: ParsedGrant = {
      grantName,
      amount,
      priorityRank: rank,
      status: 'Discovered'
    }
    
    // Parse other fields from remaining lines
    lines.slice(1).forEach(line => {
      // Remove bullet points and markdown formatting
      const cleanLine = line.replace(/^[-*•]\s*/, '').trim()
      
      if (cleanLine.startsWith('**Funder:**')) {
        grant.funder = cleanLine.replace(/^\*\*Funder:\*\*\s*/, '').trim()
      } else if (cleanLine.startsWith('**Deadline:**')) {
        const deadlineText = cleanLine.replace(/^\*\*Deadline:\*\*\s*/, '').trim()
        grant.deadline = parseDeadlineToISO(deadlineText)
      } else if (cleanLine.startsWith('**Relevance:**')) {
        grant.description = cleanLine.replace(/^\*\*Relevance:\*\*\s*/, '').trim()
      } else if (cleanLine.startsWith('**Application Notes:**')) {
        grant.requirements = cleanLine.replace(/^\*\*Application Notes:\*\*\s*/, '').trim()
      } else if (cleanLine.startsWith('**URL:**')) {
        const urlText = cleanLine.replace(/^\*\*URL:\*\*\s*/, '').trim()
        if (urlText && urlText !== 'Not available' && urlText.startsWith('http')) {
          grant.applicationUrl = urlText
        }
      }
    })
    
    // Calculate relevance score based on urgency and content
    grant.relevanceScore = calculateRelevanceScore(grant, section)
    
    return grant
    
  } catch (error) {
    console.warn('Error parsing individual grant:', error)
    return null
  }
}

function parseDeadlineToISO(deadlineText: string): string | undefined {
  try {
    // Handle various deadline formats
    if (!deadlineText || deadlineText.toLowerCase().includes('ongoing')) {
      return undefined
    }
    
    // Remove common prefixes and suffixes
    let cleanDeadline = deadlineText
      .replace(/^(due\s+|deadline:\s*)/i, '')
      .replace(/\s*\(.*\)$/, '') // Remove parenthetical notes
      .trim()
    
    // Try to parse as date
    const date = new Date(cleanDeadline)
    
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0] // Return YYYY-MM-DD format
    }
    
    return undefined
  } catch (error) {
    console.warn('Error parsing deadline:', deadlineText, error)
    return undefined
  }
}

function calculateRelevanceScore(grant: ParsedGrant, fullSection: string): number {
  let score = 50 // Base score
  
  try {
    const lowerSection = fullSection.toLowerCase()
    
    // Boost score for urgency indicators
    if (lowerSection.includes('🚨') || lowerSection.includes('urgent')) {
      score += 30
    }
    
    // Boost for high relevance keywords
    const highRelevanceKeywords = [
      'indigenous', 'native', 'traditional knowledge', 'cultural preservation',
      'community healing', 'spiritual practices', 'land stewardship', 'ceremony'
    ]
    
    highRelevanceKeywords.forEach(keyword => {
      if (lowerSection.includes(keyword)) {
        score += 10
      }
    })
    
    // Boost for larger amounts (rough parsing)
    if (grant.amount) {
      const amountText = grant.amount.toLowerCase()
      if (amountText.includes('million')) {
        score += 15
      } else if (amountText.includes('k') || amountText.includes('000')) {
        const numbers = grant.amount.match(/\d+/g)
        if (numbers) {
          const amount = parseInt(numbers[0])
          if (amount >= 100) score += 10
          if (amount >= 50) score += 5
        }
      }
    }
    
    // Reduce score for past deadlines (safety check)
    if (grant.deadline) {
      const deadlineDate = new Date(grant.deadline)
      const today = new Date()
      if (deadlineDate < today) {
        score -= 50 // Heavily penalize past deadlines
      }
    }
    
    // Ensure score stays within bounds
    return Math.max(0, Math.min(100, score))
    
  } catch (error) {
    console.warn('Error calculating relevance score:', error)
    return 50 // Return default score on error
  }
}

// Utility function to extract urgency from grant text
export function getGrantUrgency(grant: ParsedGrant): 'urgent' | 'soon' | 'normal' {
  if (!grant.deadline) return 'normal'
  
  try {
    const deadlineDate = new Date(grant.deadline)
    const today = new Date()
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDeadline <= 14) return 'urgent'
    if (daysUntilDeadline <= 30) return 'soon'
    return 'normal'
  } catch (error) {
    return 'normal'
  }
}

// Utility function to format grants for display
export function formatGrantForDisplay(grant: ParsedGrant): string {
  const urgency = getGrantUrgency(grant)
  const urgencyIcon = urgency === 'urgent' ? '🚨 URGENT' : urgency === 'soon' ? '⏰ SOON' : '📅'
  
  let display = `${urgencyIcon} **${grant.grantName}** - ${grant.amount}\n`
  
  if (grant.funder) {
    display += `   • **Funder:** ${grant.funder}\n`
  }
  
  if (grant.deadline) {
    display += `   • **Deadline:** ${grant.deadline}\n`
  }
  
  if (grant.description) {
    display += `   • **Relevance:** ${grant.description}\n`
  }
  
  if (grant.requirements) {
    display += `   • **Requirements:** ${grant.requirements}\n`
  }
  
  if (grant.applicationUrl) {
    display += `   • **Apply:** ${grant.applicationUrl}\n`
  }
  
  return display
}