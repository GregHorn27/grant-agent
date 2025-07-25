# Grant Writing Agent - Development Guide

## 🎯 CURRENT STATUS: Phase 1.5 - Complete Organization Profile System (90% COMPLETE! 🚀)

**MAJOR BREAKTHROUGH**: Conversational profile updates are now WORKING PERFECTLY! JSON parsing bug fixed, Notion persistence confirmed!

### Phase Progress Tracking  
- [x] **Phase 1: Conversational Foundation** (100% COMPLETE ✅)
  - [x] Chat interface UI completed
  - [x] Claude API integration setup and working (Status 200)
  - [x] File upload system working perfectly (.txt/.md only)
  - [x] Chat responses working perfectly
  - [x] Claude 4 Sonnet model working  
  - [x] Text/Markdown file analysis working beautifully (8K-34K characters)
  - [x] Simplified, reliable document processing
  - [x] End-to-end testing with text/markdown files (✅ working perfectly)
  - [x] Server management breakthrough - user controls dev server
- [ ] **Phase 1.5: Complete Organization Profile System** (🚀 90% COMPLETE!)
  - [x] Basic Notion API integration setup (database created, CRUD operations)
  - [x] Database cleanup utilities created for testing
  - [x] Profile extraction and JSON parsing logic implemented  
  - [x] **RESOLVED**: Syntax error in cleanJsonResponse function (backtick handling)
  - [x] **WORKING**: End-to-end document analysis → Notion storage pipeline
  - [x] **WORKING**: Multi-file text/markdown processing (8KB + 34KB files tested)
  - [x] **WORKING**: Claude API profile extraction with structured JSON output
  - [x] **WORKING**: Notion profile creation and storage (Profile ID: 236d8188-75be-81c6-9df3-e91ff00148e1)
  - [x] **WORKING**: Startup profile detection and dynamic welcome messages ✅
  - [x] **WORKING**: Conversational profile update code (extraction & API integration) ✅ **BREAKTHROUGH!**
  - [x] **FIXED**: JSON parsing bug - conversational updates now persisting to Notion DB ✅ **MAJOR FIX!**
  - [ ] **IN PROGRESS**: Enhanced profile fields (team size, key personnel, program details) 🔄 **CURRENT PRIORITY**
  - [ ] **NEXT SESSION**: Firecrawl integration for website analysis (kaiaulu.earth)
  - [ ] **ARCHITECTURE DECISION**: Lightweight profiles + rich learning system (feedback loops for grant discovery)
  - [ ] Profile update feedback improvements and debug cleanup
  - [ ] Final Phase 1.5 polish and testing
- [ ] **Phase 2: Organization Learning Engine** 
  - [x] Startup profile detection and user confirmation ✅ **MOVED TO COMPLETE**
  - [x] Chat interface integration for profile management ✅ **MOVED TO COMPLETE**
  - [ ] Multi-organization profile switching
  - [ ] End-to-end testing with persistent profiles
- [ ] **Phase 3: Intelligent Grant Discovery** 
- [ ] **Phase 4: Brand Voice Learning System**
- [ ] **Phase 5: Conversational Learning System**
- [ ] **Phase 6: Grant Application Assistant**
- [ ] **Phase 7: Deployment & Integration**

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

### 🎉 SERVER MANAGEMENT BREAKTHROUGH
**Key Learning**: User starts and controls the development server manually. Claude focuses on building features without killing the server with timeout commands.

**Workflow**: 
1. **User**: `npm run dev` in terminal
2. **User**: Tests features in browser as Claude builds them
3. **Claude**: Builds new features/APIs without touching the server
4. **Result**: Continuous development without server interruptions!

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

## 🔧 API Endpoints

### `/api/chat` - Main Conversation
**Status**: 🎉 PERFECT! All issues resolved!
- ✅ Integrates flawlessly with Claude Sonnet 4 API
- ✅ Handles conversation history beautifully
- ✅ Smart large text handling (15K character limit with visual feedback)
- ✅ Helpful error messages with actionable guidance
- ✅ **MODEL**: `claude-sonnet-4-20250514` - UPGRADE COMPLETE!
- ✅ **RESULT**: Superior conversation quality, reasoning, and analysis

### `/api/analyze-documents` - Document Processing
**Status**: ✅ COMPLETE - Simple & Reliable
- ✅ Extracts text from .txt/.md files perfectly (8K-34K characters)
- ✅ Claude API integration working (Status 200 responses)
- ✅ Multi-file upload support working
- ✅ Clean, minimal error handling
- ✅ Returns structured organization analysis
- ✅ Ultra-fast processing with TextDecoder

---

## ✅ MVP SUCCESS: Text/Markdown Processing Complete!

### 🎯 Current System Status
- ✅ Server running perfectly (`npm run dev`)
- ✅ File upload working (.txt/.md files)
- ✅ Text/Markdown processing working beautifully (8K-34K characters)
- ✅ Claude API working perfectly (Status 200 responses)
- ✅ Clean, fast, reliable document analysis
- ✅ Ready for Phase 2: Organization Learning Engine

### 📁 Supported File Types (MVP)
- ✅ **Text files (.txt)**: Perfect extraction using TextDecoder
- ✅ **Markdown files (.md)**: Perfect extraction using TextDecoder

### 🔮 Future File Support (Post-MVP)
- 📋 **PDF files**: Complex processing - saved for v2.0
- 📄 **Word documents**: Added when user demand exists
- 📊 **Excel spreadsheets**: Added when user demand exists

### 🧹 Codebase Cleanup Completed
- ✅ Removed all PDF processing complexity
- ✅ Removed mammoth (Word), xlsx (Excel), pdf libraries
- ✅ Simplified FileUpload component
- ✅ Streamlined analyze-documents API
- ✅ Clean, maintainable codebase

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

## 🚀 PHASE 1.5 IMPLEMENTATION PLAN

### Goal  
Complete organization profile system with website crawling, persistent storage, and collaborative enhancement workflow.

### Key Breakthrough: Collaborative Profile Enhancement
- **Not just appending**: Agent proposes specific changes for user approval
- **User control**: "Change X from A to B. Is that right?"
- **Always asks clarifying questions**: Continuous profile refinement
- **Intelligent synthesis**: Updates existing fields vs creating redundancy

### Step-by-Step Implementation

#### Step 1: Notion Integration (30 min) - PRIORITY 1
- Get user's Notion API key
- Add `NOTION_API_KEY` to `.env.local`
- Test Notion API connection
- Create "Organization Profiles" database with schema
- Implement `/api/notion-sync` endpoint
- Save current Coherence Lab profile from uploaded docs

#### Step 2: Firecrawl Integration (25 min) - PRIORITY 2  
- Update Firecrawl: `npm update firecrawl`
- Review API changes/breaking changes
- Implement website crawling capability
- Test with kaiaulu.earth URL

#### Step 3: Organization Profiles Database Creation (20 min)
- Create "Organization Profiles" database in Notion with schema:
  - Profile Name (Title), Legal Name, Legal Structure, Location
  - Mission Statement, Focus Areas, Target Population
  - Unique Qualifications, Leadership, Budget Range
  - Documents Analyzed, Website, Creation/Update dates
  - Fiscal Sponsor details (if applicable)
  - Active Status (checkbox for current working profile)

#### Step 4: Notion API Integration (30 min)
- Create `/api/notion-sync` endpoint for database operations
- Implement: `saveOrganizationProfile()`, `getActiveProfile()`, `setActiveProfile()`, `updateProfile()`
- Add error handling and connection testing
- Test CRUD operations with sample data

#### Step 5: Enhanced Document Analysis (25 min)
- Update `/api/analyze-documents` to extract comprehensive org profile
- Parse: mission, focus areas, target population, leadership, location, legal structure
- Structure data to match Notion database schema
- Generate more detailed organization understanding

#### Step 6: Profile Storage & Retrieval System (20 min)
- Connect document analysis to Notion storage
- Auto-save analyzed organization profiles with Active Status = true
- Create profile retrieval function for startup
- Add profile switching capabilities for multiple orgs

#### Step 7: Startup Profile Detection & Confirmation (20 min)
- Add startup check: query Notion for active organization profile
- If profile found: "Hi! Are we still working with [Organization Name] - [brief description]? I have your profile ready."
- If no profile: Standard welcome flow for new organization setup
- If multiple profiles: Let user choose which organization to work with

#### Step 8: Chat Interface Integration (10 min)
- Update ChatInterface to handle startup profile confirmation
- Add profile summary display when confirmed
- Enable "switch organization" and "update profile" chat commands
- Show current organization context in UI

#### Step 9: End-to-End Testing (15 min)
- Upload organization documents and verify Notion storage
- Restart browser/session and test profile detection
- Confirm startup greeting with organization context
- Test profile updates via conversation
- Test switching between multiple organization profiles

### Success Criteria
- Organization profiles persist in Notion database
- Agent detects and confirms organization context on startup
- Users can easily switch between multiple organization profiles
- No need to re-upload documents for continued testing
- Conversational profile updates work seamlessly
- Clean, user-controlled organization management
- Ready for Phase 3: Grant Discovery implementation

### User Experience Flow
```
New Session Startup:
Agent: "Hi! I found your profile for Hawaii Indigenous Wisdom & Group Coherence - focused on traditional knowledge systems and community healing. Are we still working together on grant discovery? I'm ready to help!"

User: "Yes, let's continue"
Agent: "Perfect! Your profile is loaded. What can I help you with today - finding new grants, updating your profile, or working on applications?"

OR

User: "Actually, let's work on my other organization"
Agent: "No problem! I can see you also have profiles for [other orgs]. Which one would you like to work with today?"
```

### Firecrawl Update Strategy
**Before implementing website crawling:**
1. **Check current version**: We have v1.29.1, check what's latest
2. **Update package**: `npm update firecrawl` 
3. **Review breaking changes**: Check [Firecrawl changelog](https://github.com/mendableai/firecrawl)
4. **Update API calls**: Ensure compatibility with latest API format
5. **Test thoroughly**: Use kaiaulu.earth as test case

**Total Estimated Time**: ~1.5 hours for complete Phase 1.5 implementation

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

### 🚀 Phase 1.5 Latest Updates (MAJOR PROGRESS!)
- **Startup Profile Detection**: Detects existing profiles on app startup ✅ **NEW & WORKING**
- **Dynamic Welcome Messages**: Personalized greeting based on organization profile ✅ **NEW & WORKING**
- **Conversational Profile Updates**: Code implemented to extract & update profiles from chat ✅ **NEW & IMPLEMENTED**
- **Profile Refresh System**: UI updates when profile changes detected ✅ **NEW & WORKING**

### ✅ Phase 1.5 Previously Completed Components 
- **Notion Integration**: Database setup, CRUD operations, cleanup utilities ✅
- **Profile Extraction**: Claude-based JSON extraction logic ✅ **WORKING**
- **Database Schema**: Organization Profiles with all required fields ✅
- **Document Analysis Pipeline**: Full .txt/.md file processing ✅ **WORKING**
- **End-to-End Flow**: File upload → Claude analysis → JSON parsing → Notion storage ✅ **WORKING**
- **Multi-File Support**: Processed 2 files (8KB + 34KB) successfully ✅ **TESTED**
- **API Integration**: Claude API (Status 200) + Notion API fully functional ✅ **WORKING**
- **Profile Storage**: Successfully created Notion profile (ID: 236d8188-75be-81c6-9df3-e91ff00148e1) ✅ **CONFIRMED**
- **Environment Setup**: API keys and database connections configured

### ✅ MAJOR BREAKTHROUGH: Conversational Profile Updates WORKING!
- **Issue RESOLVED**: JSON parsing bug identified and fixed
- **Root Cause**: Claude was returning JSON wrapped in markdown code blocks (`\`\`\`json ... \`\`\``) but parsing logic expected raw JSON
- **Solution**: Added `cleanJsonResponse()` function to strip markdown formatting before parsing
- **Status**: ✅ Profile updates now persist perfectly to Notion database
- **Testing**: Confirmed with comprehensive debug logging and real user data

### 🏗️ ARCHITECTURE DECISION: Lightweight Profiles + Rich Learning System
**Decision**: Keep Notion organization profiles relatively lightweight, focus on building rich learning system for grant discovery and application feedback.

**Rationale**:
- **Faster Grant Discovery**: Cast wide net initially, then learn from user feedback
- **Better Learning Loop**: Each "no, this grant won't work because X" teaches the system more than trying to pre-capture everything
- **Scalable**: Works for multiple organizations without overwhelming profile complexity  
- **Practical**: Grant discovery needs breadth first, then depth through feedback

**Implementation**: 
- **Notion Profile**: Core organizational identity (legal structure, focus areas, location, team, budget range)
- **Search Learning**: Rich feedback loop where users provide grant-specific feedback
- **Application Learning**: Detailed answers stored and reused, building knowledge base over time

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

---

## 🎊 PHASE 1 ACHIEVEMENT SUMMARY

**What We Built:**
- 🏗️ **Solid Foundation**: Chat interface + file upload system
- 🧠 **Sonnet 4 Intelligence**: Superior analysis and conversation quality
- 📱 **Smart UX**: 15K character limit with helpful user guidance
- 🗂️ **Reliable Processing**: Text/Markdown files up to 43K+ characters
- 🧹 **Clean Codebase**: 48 dependencies removed, optimized and fast
- ✅ **Zero Known Issues**: Everything working perfectly!

**Ready For**: Phase 2 - Organization Learning Engine → Grant Discovery System

**Remember**: This is a living document. Keep it updated as we build Phase 2! 🚀