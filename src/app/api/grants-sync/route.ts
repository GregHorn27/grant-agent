import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const GRANTS_DATABASE_ID = process.env.NOTION_GRANTS_DB_ID!

// Grant Interface matching Notion database fields
interface Grant {
  grantName: string
  funder: string
  amount: string
  deadline?: string
  status?: string
  relevanceScore?: number
  description?: string
  requirements?: string
  applicationUrl?: string
  priorityRank?: number
  notes?: string
  organizationId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'save_grants':
        return await saveGrants(data.grants)
      case 'get_grants':
        return await getGrants(data.filters)
      case 'update_grant_status':
        return await updateGrantStatus(data.grantId, data.status)
      case 'get_grant_by_name':
        return await getGrantByName(data.grantName)
      case 'test_connection':
        return await testGrantsConnection()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Grants API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Test Grants database connection
async function testGrantsConnection() {
  try {
    const response = await notion.databases.retrieve({
      database_id: GRANTS_DATABASE_ID,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Grants database connection successful',
      database: {
        id: response.id,
        title: response.title,
        created_time: response.created_time,
        last_edited_time: response.last_edited_time
      }
    })
  } catch (error) {
    throw new Error(`Grants database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Save multiple grants to Notion database
async function saveGrants(grants: Grant[]) {
  try {
    const savedGrants = []
    
    for (const grant of grants) {
      // Check if grant already exists
      const existingGrant = await checkGrantExists(grant.grantName)
      
      if (existingGrant) {
        console.log(`Grant "${grant.grantName}" already exists, skipping...`)
        savedGrants.push({ ...grant, id: existingGrant.id, status: 'duplicate' })
        continue
      }

      // Create new grant in Notion
      const response = await notion.pages.create({
        parent: {
          database_id: GRANTS_DATABASE_ID,
        },
        properties: {
          'Grant Name': {
            title: [
              {
                text: {
                  content: grant.grantName,
                },
              },
            ],
          },
          'Funder': {
            rich_text: [
              {
                text: {
                  content: grant.funder || '',
                },
              },
            ],
          },
          'Amount': {
            rich_text: [
              {
                text: {
                  content: grant.amount || '',
                },
              },
            ],
          },
          'Deadline': grant.deadline ? {
            date: {
              start: grant.deadline,
            },
          } : { date: null },
          'Status': {
            select: {
              name: grant.status || 'Discovered',
            },
          },
          'Relevance Score': grant.relevanceScore ? {
            number: grant.relevanceScore,
          } : { number: null },
          'Description': {
            rich_text: [
              {
                text: {
                  content: grant.description || '',
                },
              },
            ],
          },
          'Requirements': {
            rich_text: [
              {
                text: {
                  content: grant.requirements || '',
                },
              },
            ],
          },
          'Application URL': grant.applicationUrl ? {
            url: grant.applicationUrl,
          } : { url: null },
          'Priority Rank': grant.priorityRank ? {
            number: grant.priorityRank,
          } : { number: null },
          'Date Added': {
            date: {
              start: new Date().toISOString().split('T')[0],
            },
          },
          'Notes': {
            rich_text: [
              {
                text: {
                  content: grant.notes || '',
                },
              },
            ],
          },
        },
      })

      savedGrants.push({ 
        ...grant, 
        id: response.id, 
        status: 'saved',
        url: response.url,
        created_time: response.created_time 
      })
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${grants.length} grants: ${savedGrants.filter(g => g.status === 'saved').length} saved, ${savedGrants.filter(g => g.status === 'duplicate').length} duplicates`,
      grants: savedGrants
    })
  } catch (error) {
    throw new Error(`Failed to save grants: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Check if grant already exists in database
async function checkGrantExists(grantName: string) {
  try {
    const response = await notion.databases.query({
      database_id: GRANTS_DATABASE_ID,
      filter: {
        property: 'Grant Name',
        title: {
          equals: grantName,
        },
      },
      page_size: 1,
    })

    return response.results.length > 0 ? { id: response.results[0].id } : null
  } catch (error) {
    console.error('Error checking grant existence:', error)
    return null
  }
}

// Get grants with optional filtering
async function getGrants(filters?: { status?: string; limit?: number }) {
  try {
    const queryOptions: any = {
      database_id: GRANTS_DATABASE_ID,
      sorts: [
        {
          property: 'Priority Rank',
          direction: 'ascending',
        },
        {
          property: 'Deadline',
          direction: 'ascending',
        },
      ],
    }

    if (filters?.status) {
      queryOptions.filter = {
        property: 'Status',
        select: {
          equals: filters.status,
        },
      }
    }

    if (filters?.limit) {
      queryOptions.page_size = filters.limit
    }

    const response = await notion.databases.query(queryOptions)
    const grants = response.results.map((page: any) => extractGrantFromNotionPage(page))

    return NextResponse.json({
      success: true,
      message: `Retrieved ${grants.length} grants`,
      grants
    })
  } catch (error) {
    throw new Error(`Failed to get grants: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get specific grant by name
async function getGrantByName(grantName: string) {
  try {
    const response = await notion.databases.query({
      database_id: GRANTS_DATABASE_ID,
      filter: {
        property: 'Grant Name',
        title: {
          equals: grantName,
        },
      },
      page_size: 1,
    })

    if (response.results.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Grant not found',
        grant: null
      })
    }

    const grant = extractGrantFromNotionPage(response.results[0] as any)

    return NextResponse.json({
      success: true,
      message: 'Grant found',
      grant
    })
  } catch (error) {
    throw new Error(`Failed to get grant by name: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Update grant status
async function updateGrantStatus(grantId: string, status: string) {
  try {
    const response = await notion.pages.update({
      page_id: grantId,
      properties: {
        'Status': {
          select: {
            name: status,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Grant status updated successfully',
      grant: {
        id: response.id,
        last_edited_time: response.last_edited_time
      }
    })
  } catch (error) {
    throw new Error(`Failed to update grant status: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to extract grant data from Notion page
function extractGrantFromNotionPage(page: any): Grant & { id: string; url: string } {
  const props = page.properties
  
  return {
    id: page.id,
    url: page.url,
    grantName: props['Grant Name']?.title?.[0]?.text?.content || '',
    funder: props['Funder']?.rich_text?.[0]?.text?.content || '',
    amount: props['Amount']?.rich_text?.[0]?.text?.content || '',
    deadline: props['Deadline']?.date?.start || '',
    status: props['Status']?.select?.name || 'Discovered',
    relevanceScore: props['Relevance Score']?.number || undefined,
    description: props['Description']?.rich_text?.[0]?.text?.content || '',
    requirements: props['Requirements']?.rich_text?.[0]?.text?.content || '',
    applicationUrl: props['Application URL']?.url || '',
    priorityRank: props['Priority Rank']?.number || undefined,
    notes: props['Notes']?.rich_text?.[0]?.text?.content || '',
  }
}

// GET method for simple health check
export async function GET() {
  return NextResponse.json({
    message: 'Grants sync API endpoint is active',
    endpoints: [
      'POST /api/grants-sync with action: test_connection',
      'POST /api/grants-sync with action: save_grants',
      'POST /api/grants-sync with action: get_grants',
      'POST /api/grants-sync with action: update_grant_status',
      'POST /api/grants-sync with action: get_grant_by_name'
    ]
  })
}