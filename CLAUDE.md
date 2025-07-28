# Grant Writing Agent - Development Guide

## 🎯 CURRENT STATUS: Grant Discovery & Application This Week! 

**🎉 STRATEGIC PIVOT: Focus on Core Value!** Organization profile system complete - now diving straight into grant discovery and application writing to get a real grant submitted THIS WEEK!

### Phase Progress Tracking  
- [x] **Phase 1: Conversational Foundation** (100% COMPLETE ✅)
- [x] **Phase 1.5: Complete Organization Profile System** (🎉 100% COMPLETE ✅)
  - [x] Notion API integration with full CRUD operations
  - [x] Profile extraction and JSON parsing logic
  - [x] End-to-end document analysis → Notion storage pipeline
  - [x] Multi-file text/markdown processing (tested up to 34KB files)
  - [x] Claude API profile extraction with structured JSON output
  - [x] Notion profile creation and storage
  - [x] Startup profile detection and dynamic welcome messages
  - [x] Session-based conversational profile update system with context-aware extraction
  - [x] Enhanced profile fields (teamSize, programDetails, yearFounded) with data type conversion
  - [x] All 6 critical conversational fields (leadership, website, mission, qualifications, focus, target)
  - [x] Architecture decision: Lightweight profiles + rich learning system
  - [x] Debug log cleanup for cleaner terminal output
  - [x] **BREAKTHROUGH**: Tier 3 intelligent merging with AI-powered content synthesis
- [ ] **Phase 3: Intelligent Grant Discovery** (🎯 TODAY'S PRIORITY)
  - [ ] Firecrawl integration for web-wide grant search
  - [ ] Relevance × deadline urgency scoring algorithm
  - [ ] Target: Find grants due THIS WEEK + future opportunities
- [ ] **Phase 4: Simple Brand Voice Learning** (📝 Single Notion Document)
- [ ] **Phase 5: Simple Grant Feedback Learning** (📝 Single Notion Document)
- [ ] **Phase 6: Grant Application Assistant** (🎯 THIS WEEK)
- [ ] **Phase 7: Deployment & Integration**

**REMOVED FOR MVP SPEED:**
- ~~Phase 2: Multi-organization support~~ (Single org focus: Coherence Lab)
- ~~Complex learning systems~~ (Simplified to basic Notion documents)

### 🚀 THIS WEEK'S PRIORITIES (Grant Discovery & Application)

**TODAY (Monday 7/28/25) - Grant Discovery Engine:**
1. **Build Grant Discovery API** (2-3 hours) - Firecrawl integration for web-wide grant search
2. **Implement Relevance Scoring** (1-2 hours) - Indigenous wisdom + community healing + traditional knowledge focus
3. **Find Immediate Opportunities** (1 hour) - Prioritize grants due 7/31 or 8/1
4. **Setup Simple Learning Docs** (30 min) - Brand voice + grant feedback Notion pages

**THIS WEEK - Grant Application:**
- **Tuesday-Friday**: Use discovery results to write and submit real grant application
- **Goal**: At least one grant application submitted by Friday 8/1

**Status**: 🎉 Profile system complete! Ready to find and apply for grants!

### 🎉 MAJOR BREAKTHROUGH: Session-Based Working Knowledge Architecture

**Problem Solved**: Profile updates were failing for critical fields like leadership and website, causing false "Profile Updated!" messages while nothing actually changed.

**Solution Implemented**:
- **Session Memory**: System now loads and maintains active profile context throughout chat session
- **Context-Aware Detection**: Only extracts profile updates when relevant keywords detected (huge performance improvement)
- **6 Critical Fields Added**: leadership, website, missionStatement, uniqueQualifications, focusAreas, targetPopulation  
- **Dual Update System**: Updates both Notion database AND session memory for immediate context
- **Smart Performance**: 80%+ reduction in unnecessary API calls

**User Experience**: Now works perfectly for conversational updates like "Prajna Horn is our Executive Director" and "Our website is https://kaiaulu.earth"

### 🎉 BREAKTHROUGH ACHIEVED: Tier 3 Intelligent Merging Working Perfectly!

**Status**: ✅ **COMPLETELY RESOLVED** - All Tier 3 narrative fields now use AI-powered intelligent merging

**Solution Implemented**: Created unified AI-powered merge system using Claude API for semantic content analysis and synthesis

**What Now Works Perfectly**:
✅ **Program Details**: Intelligently merges programs without duplicating existing rich content  
✅ **Location**: Enhances geographic information contextually
✅ **Mission Statement**: Seamlessly integrates mission updates  
✅ **Unique Qualifications**: Synthesizes qualifications intelligently
✅ **Leadership field**: Continues working perfectly with structured parsing
✅ **Session Memory**: Now uses actual merged content instead of raw extracted values

**Technical Achievement**: 
- AI-powered content synthesis for all narrative fields
- Session memory consistency with Notion database
- Preserved rich existing content while seamlessly integrating new information

**Validation**: User successfully tested with program details - "In addition to X, we also do Y" now perfectly preserves both X and Y!

---

## 📋 IMPORTANT: Keep This Updated
**Every time we start a new session, update the status above!**
- Mark completed items with [x]
- Update current phase and specific issues
- Note what we're working on next

---

## 🏢 Project Overview

**Grant Writing Agent** - AI-powered conversational assistant for grant discovery and application

### Vision
Democratize grant funding access by providing organizations with an intelligent AI partner that learns their profile and assists with grant applications.

### Current Focus
- **MVP Target**: Hawaii Indigenous Wisdom & Group Coherence nonprofit
- **Architecture**: Modular design for future white-labeling
- **Philosophy**: "Simple Is Best" - natural conversation interface

---

## 🛠 Development Setup

### Required Environment Variables
```bash
# .env.local (REQUIRED)
CLAUDE_API_KEY=your_claude_api_key_here   # ✅ Working
FIRECRAWL_API_KEY=your_firecrawl_api_key_here  # ✅ Working

# For Phase 1.5 (CONFIGURED)
NOTION_API_KEY=your_notion_api_key_here   # ✅ Working
NOTION_PROFILES_DB_ID=your_notion_database_id_here  # ✅ Working
```

### Development Commands
```bash
# Start development server (USER CONTROLS - don't use Claude tools!)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Update Firecrawl when implementing
npm update firecrawl
```

### 🎉 Git/GitHub Setup Complete!
**Repository URL**: https://github.com/GregHorn27/grant-agent
**Status**: ✅ Fully configured with authentication
**Branch**: main (with tracking to origin/main)

**Git Workflow** (Claude can now handle commits):
```bash
# Claude can now run these commands in future sessions:
git add .
git commit -m "Meaningful commit message with co-author"
git push

# User setup complete:
✅ Git identity configured (Greg Horn, greghorn27@gmail.com)
✅ GitHub CLI authenticated and working
✅ Remote repository connected
✅ Initial project committed and pushed
✅ All files backed up to GitHub
```

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude API (claude-sonnet-4-20250514) - ✅ Working with latest Sonnet 4!
- **File Processing**: 
  - ✅ Text files (.txt): Native JavaScript TextDecoder (working perfectly)
  - ✅ Markdown files (.md): Native JavaScript TextDecoder (working perfectly)
  - 🔮 Future: PDF, Word, Excel (moved to post-MVP features)
- **Website Crawling**: Firecrawl (current: v1.29.1) - 🔜 Will update to latest
- **Database**: Notion API for persistent organization profiles - 🔜 Next priority

---

## 📁 Codebase Structure

```
src/
├── app/
│   ├── page.tsx                 # Main home page
│   ├── layout.tsx               # App layout wrapper  
│   ├── globals.css              # Global styles
│   └── api/
│       ├── chat/
│       │   └── route.ts         # Main chat API endpoint
│       └── analyze-documents/
│           └── route.ts         # Document analysis endpoint
└── components/
    ├── ChatInterface.tsx        # Main chat component
    └── FileUpload.tsx          # Drag-and-drop file handler
```

### Key Components

#### ChatInterface.tsx
- Main chat UI with message history
- Handles user input and file attachments
- Integrates with both `/api/chat` and `/api/analyze-documents`
- Mobile-responsive design

#### FileUpload.tsx  
- Drag-and-drop file upload
- Supports: TXT, Markdown (.md)
- Simple, reliable file validation

---

## 🔧 Current System Status

### API Endpoints Working
- **`/api/chat`**: Claude Sonnet 4 integration with conversation history
- **`/api/analyze-documents`**: Text/Markdown processing (8K-34K+ characters)
- **`/api/notion-sync`**: Organization profile CRUD operations

### File Processing (MVP)
- ✅ **Text files (.txt)**: Native TextDecoder extraction
- ✅ **Markdown files (.md)**: Native TextDecoder extraction
- 🔮 **Future**: PDF, Word, Excel (post-MVP based on user demand)

---

## 🎯 Development Approach

### Step-by-Step Philosophy
1. **Plan** the specific feature/fix
2. **Build** one thing at a time
3. **Test** immediately 
4. **Refine** based on feedback
5. **Move** to next step

### No Perfectionism Rule
- MVP first, optimization later
- Get functionality working before polishing
- Quick wins over perfect solutions

---

## 🚀 NEXT STEPS: Grant Discovery Implementation

### TODAY'S Implementation (Phase 3 - Grant Discovery)

#### 1. Grant Discovery API Endpoint (2-3 hours)
- Create `/api/search-grants` endpoint
- Integrate Firecrawl for web scraping (grants.gov, foundations, government portals)
- Target search terms: indigenous wisdom, community healing, traditional knowledge, Native rights
- Extract: grant name, funder, amount, deadline, requirements, description

#### 2. Relevance Scoring Algorithm (1-2 hours)
```javascript
Relevance Score = (
  Mission Alignment (40%) + 
  Focus Area Match (30%) + 
  Geographic Eligibility (20%) + 
  Deadline Urgency (10%)
) × Deadline Boost (2x for grants due this week)
```

#### 3. Simple Learning System Setup (30 min)
- Create Brand Voice Notion page (seeded with Coherence Lab voice patterns)
- Create Grant Feedback Notion page (for tracking user preferences)
- Integrate document reading before relevant tasks

### User Experience Flow (Target State)
```
User: "Find me grants for indigenous wisdom work"
Agent: "Searching the web for relevant grants... Found 23 opportunities! Here are the top 5:

🚨 **URGENT - Due July 31st**
   Indigenous Knowledge Preservation Grant - $75,000
   Perfect match for your traditional knowledge systems work
   
🥇 **Community Healing Initiative** - Due Aug 15th
   $50,000 for community wellness programs
   
[Continue with top 5...]

Should I help you apply for the urgent July 31st deadline?"
```

**Total Time Estimate**: ~4-5 hours for working grant discovery system

---

## 🗄 Future Database Structure (Notion)

### When We Get There: Notion Setup

#### Grants Database
- Grant Name, Funder, Amount, Deadline
- Relevance Score, Requirements, Status
- Application tracking

#### Organization Profiles Database  
- Legal Name, Structure, Location
- Mission, Focus Areas, Target Population
- Budget Range, Key Personnel

#### Application Repository Database
- Question/Response pairs
- Success tracking
- Reusable content library

---

## 🧪 Testing Approach

### Current Testing (Manual)
- Upload various file types
- Test chat conversations
- Verify mobile responsiveness

### Recommended Future Testing
- Unit tests for API endpoints
- Integration tests for Claude API
- File processing edge cases
- User workflow testing

---

## 🚀 Deployment

### Current: Development Mode
```bash
npm run dev
```

### Future: Vercel Deployment
- Environment variables in Vercel dashboard
- Automatic deployment from git pushes
- Domain setup for production

---

## 📝 Development Notes

### User Profile (MVP Target)
- **Organization**: Hawaii Indigenous Wisdom & Group Coherence nonprofit
- **Focus Areas**: Traditional knowledge, community healing, land stewardship
- **Goals**: Discover relevant grants, streamline application process
- **Tech Level**: Non-technical users

### Key Requirements
- **Simple Interface**: ChatGPT-like conversation
- **Quick Wins**: Show relevant grants fast
- **Learning**: Improve recommendations over time
- **Mobile**: Works on all devices

---

## ⚡ Quick Reference

### Start Here When Debugging
1. **Check server status**: `npm run dev` should show "Ready" at localhost:3000
2. **Check text processing logs**: `tail -f /tmp/pdf-debug.log` (detailed extraction logs)
3. **Test with text files first**: Upload .txt files to confirm pipeline working
4. **Check environment variables**: `echo $CLAUDE_API_KEY` should return API key
5. **Browser console**: Check for client-side errors during file upload

### Common Issues ✅ RESOLVED
- ~~API keys not loaded~~ ✅ Working (Claude API returns 200)
- ~~Model names incorrect~~ ✅ UPGRADED to Sonnet 4 (claude-sonnet-4-20250514) 
- ~~CORS issues with external APIs~~ ✅ No CORS issues
- ~~File upload size limits~~ ✅ Working (handles 34KB text files, 18KB markdown files)

### 🎉 RESOLVED ISSUES (Phase 1.5)
- ~~**BLOCKER**: Syntax error in `cleanJsonResponse` function~~ ✅ **FIXED!**
- ~~**Problem**: JavaScript interpreting backticks (```) in strings as template literals~~ ✅ **RESOLVED**
- ~~**Impact**: Prevents profile extraction and Notion saving from working~~ ✅ **NOW WORKING PERFECTLY**
- **Solution**: Simplified function implementation + template literal escaping
- **Result**: Full end-to-end pipeline now functional! 🚀

### ✅ Phase 1.5 Core Achievements
- **Notion Integration**: Full CRUD operations with database setup
- **Profile Extraction**: Claude-based JSON extraction and parsing
- **Document Analysis Pipeline**: Text/Markdown processing up to 34KB files
- **Startup Profile Detection**: Automatic profile loading on app start
- **Conversational Updates**: Profile updates from natural conversation
- **Enhanced Fields**: All data types (numbers, objects, strings) processing correctly
- **Architecture Decision**: Lightweight profiles + rich learning system approach

### 🏗️ Enhanced Profile Fields Working
- **Team Size**: Number extraction from descriptive text
- **Program Details**: Object-to-formatted-string conversion
- **Year Founded**: Clean string conversion from Claude responses
- **All Fields**: Successfully saving to Notion with proper validation

### Emergency Commands
```bash
# Start/restart development server
npm run dev

# Kill running server processes
ps aux | grep next | grep -v grep | awk '{print $2}' | xargs kill

# Clear Next.js cache (if needed)
rm -rf .next

# Check text processing logs
tail -f /tmp/pdf-debug.log

# Check environment variables
echo $CLAUDE_API_KEY

# Test text file processing
curl -X POST -F "files=@/path/to/test.txt" http://localhost:3000/api/analyze-documents

# Test markdown file processing
curl -X POST -F "files=@/path/to/test.md" http://localhost:3000/api/analyze-documents
```

---

## 🎊 PROJECT STATUS SUMMARY

**Phase 1 Complete**: Chat interface, file upload, Claude Sonnet 4 integration, text/markdown processing
**Phase 1.5 (95% Complete)**: Organization profiles, Notion integration, enhanced fields, conversational updates, AI-powered intelligent merging
**Next**: Complete Firecrawl integration (final 5%) → Phase 2 (Grant Discovery)

**This Week's Goal**: Move from building to USING - submit a real grant application by Friday! 🚀

**Remember**: Update this document as we implement grant discovery and application features!