import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const DATABASE_ID = process.env.NOTION_PROFILES_DB_ID!

// Organization Profile Interface
interface OrganizationProfile {
  profileName: string
  legalName: string
  legalStructure?: string
  location?: string
  missionStatement?: string
  focusAreas?: string[]
  targetPopulation?: string
  uniqueQualifications?: string
  leadership?: string
  budgetRange?: string
  website?: string
  activeStatus?: boolean
  documentsAnalyzed?: string[]
  // Enhanced fields for richer profile information
  teamSize?: number
  keyPersonnel?: string
  programDetails?: string
  fundingHistory?: string
  researchMethodology?: string
  communityPartnerships?: string
  yearFounded?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body


    switch (action) {
      case 'save_profile':
        return await saveOrganizationProfile(data)
      case 'get_active_profile':
        return await getActiveProfile()
      case 'get_all_profiles':
        return await getAllProfiles()
      case 'delete_profile':
        return await deleteProfile(data.id)
      case 'update_profile':
        return await updateProfile(data.id, data.updates)
      case 'set_active_profile':
        return await setActiveProfile(data.id)
      case 'test_connection':
        return await testConnection()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Test Notion connection
async function testConnection() {
  try {
    const response = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Notion connection successful',
      database: {
        id: response.id,
        title: response.title,
        created_time: response.created_time,
        last_edited_time: response.last_edited_time
      }
    })
  } catch (error) {
    throw new Error(`Notion connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Save organization profile to Notion
async function saveOrganizationProfile(profile: OrganizationProfile) {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties: {
        'Profile Name': {
          title: [
            {
              text: {
                content: profile.profileName,
              },
            },
          ],
        },
        'Legal Name': {
          rich_text: [
            {
              text: {
                content: profile.legalName || '',
              },
            },
          ],
        },
        'Legal Structure': profile.legalStructure ? {
          select: {
            name: profile.legalStructure,
          },
        } : { select: null },
        'Location': {
          rich_text: [
            {
              text: {
                content: profile.location || '',
              },
            },
          ],
        },
        'Mission Statement': {
          rich_text: [
            {
              text: {
                content: profile.missionStatement || '',
              },
            },
          ],
        },
        'Focus Areas': profile.focusAreas ? {
          multi_select: profile.focusAreas.map(area => ({ name: area })),
        } : { multi_select: [] },
        'Target Population': {
          rich_text: [
            {
              text: {
                content: profile.targetPopulation || '',
              },
            },
          ],
        },
        'Unique Qualifications': {
          rich_text: [
            {
              text: {
                content: profile.uniqueQualifications || '',
              },
            },
          ],
        },
        'Leadership': {
          rich_text: [
            {
              text: {
                content: profile.leadership || '',
              },
            },
          ],
        },
        'Budget Range': profile.budgetRange ? {
          select: {
            name: profile.budgetRange,
          },
        } : { select: null },
        'Website': profile.website ? {
          url: profile.website,
        } : { url: null },
        'Active Status': {
          checkbox: profile.activeStatus || true,
        },
        // Enhanced fields
        'Team Size': profile.teamSize ? {
          number: profile.teamSize,
        } : { number: null },
        'Key Personnel': {
          rich_text: [
            {
              text: {
                content: profile.keyPersonnel || '',
              },
            },
          ],
        },
        'Program Details': {
          rich_text: [
            {
              text: {
                content: profile.programDetails || '',
              },
            },
          ],
        },
        'Funding History': {
          rich_text: [
            {
              text: {
                content: profile.fundingHistory || '',
              },
            },
          ],
        },
        'Research Methodology': {
          rich_text: [
            {
              text: {
                content: profile.researchMethodology || '',
              },
            },
          ],
        },
        'Community Partnerships': {
          rich_text: [
            {
              text: {
                content: profile.communityPartnerships || '',
              },
            },
          ],
        },
        'Year Founded': profile.yearFounded ? {
          rich_text: [
            {
              text: {
                content: profile.yearFounded,
              },
            },
          ],
        } : { rich_text: [] },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Organization profile saved successfully',
      profile: {
        id: response.id,
        url: response.url,
        created_time: response.created_time
      }
    })
  } catch (error) {
    throw new Error(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get active organization profile
async function getActiveProfile() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Active Status',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Last Updated',
          direction: 'descending',
        },
      ],
      page_size: 1,
    })

    if (response.results.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active profile found',
        profile: null
      })
    }

    const page = response.results[0] as any
    const profile = extractProfileFromNotionPage(page)

    return NextResponse.json({
      success: true,
      message: 'Active profile retrieved',
      profile
    })
  } catch (error) {
    throw new Error(`Failed to get active profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Update organization profile
async function updateProfile(pageId: string, updates: Partial<OrganizationProfile>) {
  
  try {
    const properties: any = {}

    // Build update properties dynamically
    if (updates.profileName) {
      properties['Profile Name'] = {
        title: [{ text: { content: updates.profileName } }],
      }
    }
    
    if (updates.legalName) {
      properties['Legal Name'] = {
        rich_text: [{ text: { content: updates.legalName } }],
      }
    }
    
    if (updates.legalStructure) {
      properties['Legal Structure'] = {
        select: { name: updates.legalStructure },
      }
    }
    
    if (updates.location) {
      properties['Location'] = {
        rich_text: [{ text: { content: updates.location } }],
      }
    }
    
    if (updates.missionStatement) {
      properties['Mission Statement'] = {
        rich_text: [{ text: { content: updates.missionStatement } }],
      }
    }
    
    if (updates.focusAreas) {
      properties['Focus Areas'] = {
        multi_select: updates.focusAreas.map(area => ({ name: area })),
      }
    }
    
    if (updates.targetPopulation) {
      properties['Target Population'] = {
        rich_text: [{ text: { content: updates.targetPopulation } }],
      }
    }
    
    if (updates.uniqueQualifications) {
      properties['Unique Qualifications'] = {
        rich_text: [{ text: { content: updates.uniqueQualifications } }],
      }
    }
    
    if (updates.leadership) {
      properties['Leadership'] = {
        rich_text: [{ text: { content: updates.leadership } }],
      }
    }
    
    if (updates.budgetRange) {
      properties['Budget Range'] = {
        select: { name: updates.budgetRange },
      }
    }
    
    if (updates.website) {
      properties['Website'] = {
        url: updates.website,
      }
    }
    
    if (updates.activeStatus !== undefined) {
      properties['Active Status'] = {
        checkbox: updates.activeStatus,
      }
    }
    
    // Enhanced fields
    if (updates.teamSize !== undefined) {
      properties['Team Size'] = {
        number: updates.teamSize,
      }
    }
    
    if (updates.programDetails) {
      properties['Program Details'] = {
        rich_text: [{ text: { content: updates.programDetails } }],
      }
    }
    
    if (updates.yearFounded) {
      properties['Year Founded'] = {
        rich_text: [{ text: { content: updates.yearFounded } }],
      }
    }


    const response = await notion.pages.update({
      page_id: pageId,
      properties,
    })


    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: response.id,
        last_edited_time: response.last_edited_time
      }
    })
  } catch (error) {
    throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Set active profile (deactivate others, activate specified one)
async function setActiveProfile(pageId: string) {
  try {
    // First, deactivate all profiles
    const allProfiles = await notion.databases.query({
      database_id: DATABASE_ID,
    })

    // Deactivate all profiles
    for (const profile of allProfiles.results) {
      await notion.pages.update({
        page_id: profile.id,
        properties: {
          'Active Status': {
            checkbox: false,
          },
        },
      })
    }

    // Activate the specified profile
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        'Active Status': {
          checkbox: true,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Active profile set successfully',
      profile: {
        id: response.id,
        last_edited_time: response.last_edited_time
      }
    })
  } catch (error) {
    throw new Error(`Failed to set active profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get all organization profiles
async function getAllProfiles() {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: 'Created',
          direction: 'descending',
        },
      ],
    })

    const profiles = response.results.map((page: any) => extractProfileFromNotionPage(page))

    return NextResponse.json({
      success: true,
      message: `Retrieved ${profiles.length} profiles`,
      profiles
    })
  } catch (error) {
    throw new Error(`Failed to get all profiles: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Delete organization profile
async function deleteProfile(pageId: string) {
  try {
    // First get the profile to return its info
    const page = await notion.pages.retrieve({
      page_id: pageId,
    })
    
    const profileInfo = extractProfileFromNotionPage(page as any)
    
    // Archive the page (Notion doesn't have true delete, it archives)
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully',
      deletedProfile: {
        id: profileInfo.id,
        name: profileInfo.profileName
      }
    })
  } catch (error) {
    throw new Error(`Failed to delete profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to extract profile data from Notion page
function extractProfileFromNotionPage(page: any): OrganizationProfile & { id: string; url: string } {
  const props = page.properties
  
  return {
    id: page.id,
    url: page.url,
    profileName: props['Profile Name']?.title?.[0]?.text?.content || '',
    legalName: props['Legal Name']?.rich_text?.[0]?.text?.content || '',
    legalStructure: props['Legal Structure']?.select?.name || '',
    location: props['Location']?.rich_text?.[0]?.text?.content || '',
    missionStatement: props['Mission Statement']?.rich_text?.[0]?.text?.content || '',
    focusAreas: props['Focus Areas']?.multi_select?.map((item: any) => item.name) || [],
    targetPopulation: props['Target Population']?.rich_text?.[0]?.text?.content || '',
    uniqueQualifications: props['Unique Qualifications']?.rich_text?.[0]?.text?.content || '',
    leadership: props['Leadership']?.rich_text?.[0]?.text?.content || '',
    budgetRange: props['Budget Range']?.select?.name || '',
    website: props['Website']?.url || '',
    activeStatus: props['Active Status']?.checkbox || false,
    documentsAnalyzed: [], // This would need special handling for files
    // Enhanced fields
    teamSize: props['Team Size']?.number || undefined,
    keyPersonnel: props['Key Personnel']?.rich_text?.[0]?.text?.content || '',
    programDetails: props['Program Details']?.rich_text?.[0]?.text?.content || '',
    fundingHistory: props['Funding History']?.rich_text?.[0]?.text?.content || '',
    researchMethodology: props['Research Methodology']?.rich_text?.[0]?.text?.content || '',
    communityPartnerships: props['Community Partnerships']?.rich_text?.[0]?.text?.content || '',
    yearFounded: props['Year Founded']?.rich_text?.[0]?.text?.content || ''
  }
}

// GET method for simple health check
export async function GET() {
  return NextResponse.json({
    message: 'Notion sync API endpoint is active',
    endpoints: [
      'POST /api/notion-sync with action: test_connection',
      'POST /api/notion-sync with action: save_profile',
      'POST /api/notion-sync with action: get_active_profile',
      'POST /api/notion-sync with action: get_all_profiles',
      'POST /api/notion-sync with action: delete_profile',
      'POST /api/notion-sync with action: update_profile',
      'POST /api/notion-sync with action: set_active_profile'
    ]
  })
}