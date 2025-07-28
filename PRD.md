# Grant Writing Agent - Product Requirements Document

## Executive Summary

The Grant Writing Agent is an AI-powered conversational assistant that acts as your organization's "AI co-founder" for grant discovery and application. Built on the philosophy of "Simple Is Best," this MVP transforms the complex grant-seeking process into natural conversations while maintaining sophisticated intelligence behind the scenes.

### Vision Statement
Democratize grant funding access by providing every organization with an intelligent, conversational AI partner that learns their unique profile and proactively discovers, ranks, and assists with grant applications.

### Key Value Propositions
- **Natural Conversation**: Chat interface like ChatGPT - no commands or complex workflows
- **Intelligent Learning**: Learns your organization from documents and conversations
- **Proactive Discovery**: Searches the entire web for relevant grant opportunities
- **Smart Ranking**: Prioritizes grants by relevance × urgency (deadlines)
- **Application Assistant**: Question-by-question grant writing support with memory
- **Modular Design**: Built for future white-labeling to other organizations

---

## Problem Statement

### Current Grant-Seeking Challenges
1. **Discovery Gap**: Organizations miss relevant grants buried across thousands of websites
2. **Time Intensive**: Manual searching and application writing consumes hundreds of hours
3. **Expertise Barrier**: Quality grant writing requires specialized knowledge most orgs lack
4. **Poor Tracking**: Organizations lose track of opportunities, deadlines, and application status
5. **No Learning**: Each application starts from scratch without leveraging past experience

### Market Opportunity
- **Primary**: Hawaii-based Indigenous Wisdom & Group Coherence nonprofit (immediate user)
- **Secondary**: Nonprofit organizations nationwide seeking grant funding
- **Tertiary**: White-label SaaS product for grant consultants and nonprofit service providers

---

## Solution Overview

### Core Concept: AI Co-Founder Architecture
A conversational AI that becomes deeply familiar with your organization and acts as an intelligent partner throughout the grant lifecycle.

### "Simple Is Best" Design Philosophy
- **One Interface**: Single chat window for all interactions
- **Natural Language**: No commands, codes, or complex workflows
- **Automatic Background**: All data management happens invisibly
- **Mobile-First**: Accessible from any device via web browser
- **Progressive Complexity**: MVP starts simple, grows sophisticated over time

---

## Detailed Feature Specifications

### Phase 1: Conversational Foundation (🎉 COMPLETE!)
**Goal**: Create ChatGPT-like interface with Claude AI integration ✅ ACHIEVED!

**🎊 BONUS ACHIEVEMENT: Professional Development Workflow Complete!**
- ✅ Git/GitHub setup with full version control
- ✅ Repository: https://github.com/GregHorn27/grant-agent  
- ✅ Claude can now handle commits automatically
- ✅ Professional development practices established

**Features**: ✅ ALL COMPLETE + ENHANCED!
- ✅ Clean chat interface with message history
- ✅ Real-time typing indicators and response streaming
- ✅ Mobile-responsive design  
- ✅ **UPGRADED**: Claude Sonnet 4 API integration for superior conversation
- ✅ **ENHANCED**: Smart error handling with actionable user guidance
- ✅ **ADDED**: Large text input validation (15,000 character limit)
- ✅ **ADDED**: Visual feedback with character counter and warnings

**Success Criteria**: ✅ ALL ACHIEVED + ENHANCED!
- ✅ User can have natural conversations with Sonnet 4 AI agent
- ✅ Interface works seamlessly on mobile and desktop
- ✅ Responses feel conversational, intelligent, and superior quality
- ✅ **BONUS**: Smart large text handling prevents user errors
- ✅ **BONUS**: Sonnet 4 upgrade delivers enhanced analysis

### Phase 1.5: Complete Organization Profile System (100% COMPLETE ✅)
**Goal**: Complete organization profile system with enhanced fields

**STATUS**: 🎉 COMPLETE! Core profile system working end-to-end with AI-powered intelligent merging. Ready for grant discovery!

**Key Innovation: Collaborative Profile Enhancement**
- Agent proposes specific profile changes for user approval  
- User controls all profile updates (no automatic changes)
- Always asks clarifying questions to fill gaps
- Intelligent synthesis vs simple appending of new information

**Document Upload Features**: ✅ COMPLETE
- Drag-and-drop file upload working perfectly
- Supported formats: Text (.txt), Markdown (.md) 
- File processing: 8K-43K+ characters successfully
- Claude API integration: Status 200 responses

**✅ Notion Integration**: FULLY FUNCTIONAL
- Database with comprehensive schema
- CRUD operations (save, retrieve, update, delete)
- Profile extraction with JSON parsing
- Startup profile detection with dynamic welcome messages

**✅ Website Analysis**: REMOVED FOR MVP
- Focus shifted to grant discovery instead of profile enhancement
- Firecrawl integration repurposed for grant search

**✅ Organization Profile Generation**: ALL CORE FEATURES WORKING
- Extract comprehensive profiles from documents (tested up to 34KB files)
- Claude API integration with structured JSON output
- Multi-file analysis with profile extraction
- Conversational profile updates from natural language
- Enhanced profile fields (teamSize, programDetails, yearFounded) with data type conversion
- Architecture: Lightweight profiles + rich learning system approach
- ✅ **BREAKTHROUGH**: AI-powered intelligent merging for all Tier 3 narrative fields
- ✅ **ACHIEVED**: Session memory consistency with Notion database
- [x] **COMPLETE**: All profile system features implemented and working

**NEW Conversation Flow**:
```
User: [Uploads documents] + "Can you analyze kaiaulu.earth too?"
Agent: "Here's your Coherence Lab profile from the documents: [profile]
        Based on the website, I recommend these changes:
        • Focus Areas: Add 'land stewardship, traditional ecological knowledge' 
        • Structure: Add 'Kaiāulu project with separate advisory board'
        Are these changes accurate? Should I modify anything?
        
        Clarifying questions:
        • How do grants differ between Coherence Lab vs Kaiāulu applications?
        • What specific land projects need funding?"

User: "Yes, and Kaiāulu focuses more on place-based ceremony"
Agent: "Perfect! I'll update the profile and save it to your database."
```

### 🏗️ MVP ARCHITECTURE: Lightweight Profiles + Rich Learning System
**Strategic Decision**: Keep organization profiles focused on core identity, build rich learning through grant discovery feedback.

**Approach**:
- **Core Profile**: Essential organizational identity (legal structure, focus areas, location, team, budget)
- **Grant Discovery**: Cast wide net, learn from user feedback ("This grant won't work because...")
- **Application Learning**: Store detailed answers, build reusable knowledge base over time

### Phase 2: Multi-Organization Support (MOVED TO POST-MVP)
**Goal**: Multi-organization management (postponed for single-org MVP focus)
- Multi-organization profile switching
- Enhanced profile templates for different org types  
- Advanced startup detection and context management

**Status**: Moved to post-MVP roadmap - current focus is single organization (Coherence Lab)

### Phase 3: Intelligent Grant Discovery (TODAY'S PRIORITY - 4-5 hours)
**Goal**: Web-wide grant search with smart relevance ranking

**IMPLEMENTATION TODAY (Monday 7/28/25):**

**Search Architecture**:
- Firecrawl integration for real-time web scraping
- Target domains: grants.gov, foundation websites, government portals, nonprofit databases
- Extract: grant name, funder, amount, deadline, requirements, description
- Focus areas: Cultural preservation, traditional knowledge, Indigenous education, land stewardship, community healing

**Relevance Scoring Algorithm**:
```
Relevance Score (0-100) = Weighted average of:
- Mission alignment (40%): How well grant purpose matches org mission
- Focus area match (30%): Overlap in program areas/populations served
- Geographic eligibility (20%): Location requirements compatibility
- Organization size/type fit (10%): Budget level and legal structure match
```

**Results Presentation**:
```
Agent: "I found 47 potential grants. Here are my top 5 recommendations:

🥇 **Indigenous Knowledge Preservation Grant** (Relevance: 94/100)
   • Amount: $75,000
   • Deadline: March 15, 2024 (45 days remaining)
   • Perfect match: Hawaii location + Indigenous wisdom focus
   • Requirements: 501(c)(3) status or fiscal sponsor, 2+ years operation

🥈 **Community Healing & Wellness Initiative** (Relevance: 87/100)
   • Amount: $50,000
   • Deadline: February 28, 2024 (30 days remaining)
   • Great fit: Group coherence + community healing programs
   • Requirements: Focus on underserved communities, cultural practices

[Continue for top 5...]

Would you like me to add these to your grant tracking database in Notion?"
```

### Phase 4: Simple Brand Voice Learning (30 minutes)
**Goal**: Basic brand voice context for grant application writing

**SIMPLIFIED APPROACH - Single Notion Document:**
- Create dedicated Brand Voice Notion page/database
- Seed with initial voice patterns from existing Coherence Lab documents
- Agent reads this document before grant application writing sessions
- User can update document through conversation ("Add this to our voice guide...")

**Initial Voice Elements to Seed:**
- Cultural sensitivity for Indigenous wisdom work
- Emphasis on community healing and traditional knowledge
- Collaborative tone reflecting partnership approach
- Respectful language around ceremonial and sacred practices

**Usage**: Agent consults this document before each application writing session for context

### Phase 5: Simple Grant Feedback Learning (30 minutes)
**Goal**: Track user preferences to improve future grant recommendations

**SIMPLIFIED APPROACH - Single Notion Document:**
- Create dedicated Grant Feedback Notion page/database
- Track user feedback about grant recommendations
- Agent reads this document before each grant search for context
- User can add feedback through conversation

**Example Feedback to Track:**
- "Don't show grants under $25,000" → Minimum amount preference
- "We can't work with funders that don't accept fiscal sponsorship" → Eligibility filter
- "Focus more on Indigenous-specific funders" → Relevance weighting
- "Avoid grants with complex reporting requirements" → Complexity filter

**Usage**: Agent consults this document before each grant search to apply learned preferences

### Phase 6: Grant Application Assistant (THIS WEEK - Target: Real Application by Friday)
**Goal**: Help write and submit actual grant application this week

**Application Workflow**:
1. User pastes grant application questions
2. Agent drafts responses using organization profile
3. User reviews, refines, and approves each response
4. Agent maintains application state and progress
5. Final compilation and formatting for submission

**Key Features**:
- Leverage organization profile and past applications
- Generate tailored responses matching funder priorities
- Maintain consistency across all responses
- Progress tracking with skip/return capabilities

### Phase 7: Deployment & Integration (2 hours)
**Goal**: Web-accessible MVP with data persistence

**Deployment Architecture**:
- Next.js application deployed on Vercel (free tier)
- Environment variables for API keys (Claude, Notion, Firecrawl)
- GitHub repository for version control ✅ **COMPLETE**
- Simple CI/CD pipeline via Vercel Git integration

**✅ Version Control & Development Workflow (COMPLETE)**:
- **Repository**: https://github.com/GregHorn27/grant-agent
- **Authentication**: GitHub CLI with persistent tokens
- **Branch Strategy**: Main branch with direct commits
- **Commit Automation**: Claude can handle git operations in future sessions
- **Collaboration Ready**: Proper git identity and remote tracking configured

**Data Integration**:
- Notion workspace setup with database templates
- API integration for seamless data sync
- Local JSON file backup for learned preferences
- Mobile-responsive testing across devices

---

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **File Upload**: react-dropzone for drag-and-drop functionality

### Backend Services
- **AI Engine**: Claude Sonnet 4 via Anthropic API
- **Web Scraping**: Firecrawl for real-time grant discovery
- **Database**: Notion API for structured data storage
- **File Processing**: 
  - Text (.txt): Native JavaScript TextDecoder (ultra-fast, reliable)
  - Markdown (.md): Native JavaScript TextDecoder (ultra-fast, reliable)
  - Future: PDF/Word/Excel processing libraries (post-MVP)

### API Architecture
```
/api/chat - Main conversation endpoint
/api/analyze-documents - Document upload and analysis
/api/search-grants - Grant discovery and ranking
/api/notion-sync - Database synchronization
/api/application-state - Application progress tracking
```

### Security & Performance
- Environment variable management for API keys
- File size and type restrictions for uploads
- Rate limiting on external API calls
- Error boundaries and graceful degradation
- Mobile-optimized loading and caching

---

## Database Schema (Notion)

### 1. Grants Database
| Field Name | Type | Description |
|------------|------|-------------|
| Grant Name | Title | Primary identifier |
| Funder | Text | Granting organization |
| Amount | Number | Grant amount in USD |
| Deadline | Date | Application deadline |
| Status | Select | Discovery/Interested/Applied/Awarded/Rejected |
| Relevance Score | Number | 0-100 calculated relevance |
| Requirements | Text | Eligibility requirements |
| Description | Text | Grant program description |
| Application Questions | Text | Full question set |
| Our Application | Relation | Link to Application Drafts |
| Date Added | Date | When grant was discovered |
| Priority Rank | Number | Manual priority ranking |
| Notes | Text | Internal notes and feedback |

### 2. Application Repository Database
| Field Name | Type | Description |
|------------|------|-------------|
| Question ID | Title | Unique question identifier |
| Grant | Relation | Source grant |
| Organization | Text | Which org profile used |
| Question Text | Text | Full question |
| Our Response | Text | Generated response |
| Outcome | Select | Successful/Unsuccessful/Unknown |
| Response Quality | Number | 1-5 user rating |
| Date Created | Date | When response was generated |
| Tags | Multi-select | Topic tags for searchability |
| Refinements | Text | User requested changes |
| Final Version | Text | Approved final response |

### 3. Organization Profiles Database (Modular)
| Field Name | Type | Description |
|------------|------|-------------|
| Profile Name | Title | Organization identifier |
| Legal Name | Text | Official organization name |
| Organization EIN | Text | Federal tax ID number (if applicable) |
| Legal Structure | Select | 501c3/Fiscally-Sponsored/LLC/etc |
| Location | Text | Geographic base |
| Mission Statement | Text | Core mission |
| Focus Areas | Multi-select | Program areas |
| Target Population | Text | Who is served |
| Unique Qualifications | Text | Special expertise |
| Leadership | Text | Key personnel |
| Fiscal Sponsor | Text | Sponsor org details (if applicable) |
| Sponsor EIN | Text | Fiscal sponsor's EIN (if applicable) |
| Sponsor Relationship | Select | Comprehensive/Project/Pre-Approved |
| Admin Fee | Number | Fiscal sponsor fee percentage |
| Budget Range | Select | Annual operating budget |
| Documents Analyzed | Files | Source materials |
| Website | URL | Organization website |
| Date Created | Date | Profile creation date |
| Last Updated | Date | Most recent modification |

### 4. Brand Voice Profile Database
| Field Name | Type | Description |
|------------|------|-------------|
| Voice Element ID | Title | Unique identifier |
| Organization | Relation | Which org profile |
| Element Type | Select | Terminology/Tone/Structure/Cultural |
| Preferred Language | Text | Words/phrases to use |
| Avoid Language | Text | Words/phrases to avoid |
| Context Notes | Text | When/how to apply this voice element |
| Source Document | Files | Where this pattern was learned |
| Confidence Score | Number | How certain we are about this pattern |
| Usage Examples | Text | Sample sentences showing proper usage |
| Last Updated | Date | Most recent refinement |
| User Feedback | Text | User comments on voice accuracy |

### 5. Learning Memory Database

**MVP Note**: Document processing simplified for Phase 1 launch - supporting text and markdown files only. PDF, Word, and Excel support moved to future roadmap based on user feedback and demand.

---

## Future File Support (Post-MVP Roadmap)

### Advanced Document Processing
- **PDF files**: Multi-library approach (pdf-parse, pdfjs-dist, external APIs)
- **Word documents**: mammoth library integration  
- **Excel spreadsheets**: xlsx library for data extraction
- **OCR capabilities**: For scanned documents and images
- **Batch processing**: Multiple complex files simultaneously

### 6. Original Learning Memory Database
| Field Name | Type | Description |
|------------|------|-------------|
| Rule ID | Title | Unique identifier |
| Organization | Relation | Which org profile |
| Rule Type | Select | Exclusion/Preference/Weight |
| Rule Text | Text | Natural language rule |
| Source Feedback | Text | Original user statement |
| Date Learned | Date | When rule was created |
| Times Applied | Number | Usage counter |
| Effectiveness | Number | Success rate when applied |

---

## Modular Organization Structure (White-Label Ready)

### Organization Profile Interface
```typescript
interface OrganizationProfile {
  // Basic Identity
  name: string
  legalName: string
  legalStructure: '501c3' | 'Fiscally-Sponsored' | 'LLC' | 'Corporation' | 'Sole Proprietorship' | 'Other'
  ein?: string
  
  // Fiscal Sponsorship Details (if applicable)
  fiscalSponsor?: {
    sponsorName: string
    sponsorEIN: string
    relationshipType: 'Comprehensive' | 'Pre-Approved Grant Relationship' | 'Project Sponsorship'
    adminFeePercentage: number
    agreementStartDate: Date
    agreementEndDate?: Date
    restrictions?: string[]
  }
  
  // Location & Scope
  primaryLocation: string
  serviceArea: string[]
  geographic_constraints: string[]
  
  // Mission & Focus
  missionStatement: string
  focusAreas: string[]
  targetPopulations: string[]
  programDescriptions: string[]
  
  // Qualifications & History
  uniqueQualifications: string[]
  keyPersonnel: PersonProfile[]
  pastGrantHistory: GrantHistory[]
  partnerships: string[]
  
  // Operations
  annualBudget: number
  yearsInOperation: number
  staffSize: number
  volunteerBase?: number
  
  // Resources
  documentsAnalyzed: string[]
  website?: string
  socialMedia?: SocialMediaLinks
}
```

### Configuration System
```json
{
  "deployment_config": {
    "organization_name": "Hawaii STEM Initiative",
    "branding": {
      "logo_url": "/logo.png",
      "primary_color": "#2563eb",
      "organization_display_name": "Your AI Grant Assistant"
    },
    "features": {
      "grant_discovery": true,
      "application_assistance": true,
      "notion_integration": true,
      "document_analysis": true
    }
  }
}
```

---

## User Experience Flows

### First-Time User Onboarding
```
1. Landing → "Welcome! I'm your AI Grant Co-founder. Let's start by learning about your organization."

2. Document Upload → "Upload any documents about your organization, or share your website URL"

3. Analysis & Confirmation → "Based on your materials, here's what I understand... [profile summary]. Is this accurate?"

4. Refinement → User corrects/adds details via conversation

5. First Grant Search → "Great! Let me search for relevant grants. This may take a minute..."

6. Results & Learning → Shows top 5, user provides feedback, agent learns preferences

7. Action Planning → "Which grants interest you most? I can help you prioritize and start applications."
```

### Returning User Experience
```
1. Greeting → "Welcome back! I found 3 new grants since your last visit. Would you like to see them?"

2. Updates → Shows new opportunities with relevance scoring

3. Application Check-in → "How's the Community Foundation application going? Need help with any questions?"

4. Continuous Learning → Processes any new feedback or preferences
```

### Grant Application Session
```
1. Application Start → User pastes questions
2. Question Review → "I see 8 questions. Let's start with #1..."
3. Draft & Refine → Generate → Review → Refine → Approve cycle
4. State Management → Track progress, allow skipping/returning
5. Final Review → Complete application compilation
6. Submission Prep → Format check, final recommendations
```

---

## Success Criteria & KPIs

### MVP Launch Criteria
- [ ] User can upload documents and receive accurate organization profile
- [ ] Agent discovers and ranks at least 10 relevant grants per search
- [ ] Top 5 grant recommendations show clear relevance reasoning
- [ ] All data automatically syncs to Notion databases
- [ ] Agent learns from feedback and applies rules to future searches
- [ ] Grant application questions can be answered one-by-one conversationally
- [ ] Mobile-responsive interface works on all devices
- [ ] Application deployed and accessible via web URL

### User Success Metrics
- **Discovery Efficiency**: Time from search request to relevant results < 2 minutes
- **Relevance Quality**: User rates 80%+ of top 5 recommendations as "relevant"
- **Learning Accuracy**: Agent correctly applies learned preferences in 90%+ of cases
- **Application Speed**: Draft responses generated in < 30 seconds per question
- **User Satisfaction**: Conversational flow feels natural and helpful

### Technical Performance
- **Response Time**: API responses under 3 seconds
- **Uptime**: 99%+ availability
- **Mobile Performance**: Page load under 2 seconds on mobile
- **Data Sync**: Notion updates happen within 10 seconds of user action

---

## Future Roadmap (Post-MVP)

### Phase 2 Enhancements (Months 2-3)
- **Automated Grant Monitoring**: Background searches with email notifications
- **Advanced Analytics**: Grant success rates, funding trends, competition analysis
- **Enhanced Memory**: Move learned preferences from JSON to Notion
- **Deadline Management**: Calendar integration and automatic reminders
- **Bulk Application**: Handle multiple similar applications simultaneously

### Phase 3 Scaling (Months 4-6)
- **White-Label Platform**: Multi-tenant architecture for other organizations
- **Advanced AI Features**: Voice input, document generation, funder research
- **Integration Ecosystem**: Connect to grant databases, CRM systems, accounting software
- **Collaboration Tools**: Team features for multiple users per organization
- **Premium Features**: Advanced search, priority support, custom integrations

### Phase 4 Market Expansion (Months 7-12)
- **Grant Consultant Tools**: Features for professional grant writers
- **Funder Intelligence**: Deep research on foundation preferences and patterns
- **Success Tracking**: Long-term outcome analysis and ROI measurement
- **API Platform**: Allow third-party integrations and custom applications
- **Enterprise Features**: Advanced security, compliance, multi-organization management

---

## Risk Assessment & Mitigation

### Technical Risks
- **API Rate Limits**: Implement caching and request queuing
- **Claude API Costs**: Monitor usage, implement response optimization
- **Web Scraping Reliability**: Multiple fallback sources, error handling
- **Notion API Changes**: Regular integration testing, backup strategies

### Product Risks
- **Grant Discovery Accuracy**: Continuous feedback loop and algorithm refinement
- **User Adoption**: Focus on demonstrable value in first session
- **Competitive Response**: Strong focus on conversational UX and learning capabilities
- **Scalability Challenges**: Design modular architecture from day one

### Business Risks
- **Single Organization Dependency**: Build for white-labeling from MVP
- **Grant Landscape Changes**: Flexible architecture to adapt to new sources
- **AI Technology Evolution**: Stay current with latest models and capabilities
- **Regulatory Compliance**: Ensure data handling meets nonprofit requirements

---

## Getting Started (Implementation Guide)

### Prerequisites
- Next.js development environment
- Anthropic API key (Claude access)
- Notion workspace and API integration
- Firecrawl API access
- Vercel account for deployment

### Development Phases
1. **Foundation** (Day 1): Set up Next.js project with chat interface
2. **AI Integration** (Day 1): Connect Claude API for conversations  
3. **Document Processing** (Day 2): Add file upload and analysis
4. **Grant Discovery** (Day 3): Implement Firecrawl search integration
5. **Notion Integration** (Day 4): Database setup and synchronization
6. **Learning System** (Day 5): Feedback processing and memory
7. **Application Assistant** (Day 6): Question-by-question workflow
8. **Testing & Deployment** (Day 7): Final testing and Vercel deployment

### Immediate Next Steps
1. Clone and examine current codebase structure
2. Set up Notion workspace with database templates
3. Test current document analysis and chat functionality
4. Integrate Firecrawl for grant discovery
5. Begin user testing with real grant applications

---

---

## 🚀 CURRENT PROJECT STATUS - WEEK OF 7/28/25

### ✅ Completed Phases
**Phase 1**: Complete chat interface, Claude Sonnet 4 integration, file processing
**Phase 1.5**: 100% complete - organization profiles, Notion integration, enhanced fields, AI-powered intelligent merging

### 🎯 This Week's Goals
**TODAY (Monday)**: Phase 3 - Grant Discovery Engine
**Tuesday-Friday**: Phase 6 - Write and submit real grant application
**Background**: Simple learning docs (Phases 4 & 5)

### 📅 Weekly Timeline
- **Monday 7/28**: Build grant discovery, find opportunities due this week
- **Tuesday 7/29**: Begin application writing for best immediate opportunity  
- **Wednesday-Thursday**: Complete application drafts
- **Friday 8/1**: Submit grant application(s)

### 📈 Success Metrics Achieved
- Conversational interface working with superior AI (Claude Sonnet 4)
- Document processing up to 34KB+ files
- Complete organization profile system with data persistence
- Startup profile detection and conversational updates
- AI-powered intelligent merging for all narrative fields
- Session memory consistency with Notion database
- Clean, maintainable codebase optimized for performance

### 🎯 This Week's Success Metrics
- Grant discovery engine finds 10+ relevant opportunities
- At least 1 grant identified with deadline this week (7/31 or 8/1)
- Real grant application drafted and submitted by Friday
- Simple learning system operational for future searches

---

*This PRD represents a living document evolving with each development phase. Strong foundation established - ready for grant discovery features.*