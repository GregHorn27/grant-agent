# Grant Writing Agent - Development Guide

## 🎯 CURRENT STATUS: Phase 1.5 - Complete Organization Profile System (95% COMPLETE)

**BREAKTHROUGH ACHIEVED**: Enhanced profile fields working perfectly! All data type processing issues resolved and successfully saving to Notion.

### Phase Progress Tracking  
- [x] **Phase 1: Conversational Foundation** (100% COMPLETE ✅)
- [x] **Phase 1.5: Complete Organization Profile System** (🎉 95% COMPLETE!)
  - [x] Notion API integration with full CRUD operations
  - [x] Profile extraction and JSON parsing logic
  - [x] End-to-end document analysis → Notion storage pipeline
  - [x] Multi-file text/markdown processing (tested up to 34KB files)
  - [x] Claude API profile extraction with structured JSON output
  - [x] Notion profile creation and storage
  - [x] Startup profile detection and dynamic welcome messages
  - [x] Conversational profile update system
  - [x] Enhanced profile fields (teamSize, programDetails, yearFounded) with data type conversion
  - [x] Architecture decision: Lightweight profiles + rich learning system
  - [ ] **REMAINING**: Debug log cleanup for cleaner terminal output
  - [ ] **REMAINING**: Firecrawl integration for website analysis
  - [ ] Final Phase 1.5 polish and testing
- [ ] **Phase 2: Organization Learning Engine** 
  - [ ] Multi-organization profile switching
  - [ ] End-to-end testing with persistent profiles
- [ ] **Phase 3: Intelligent Grant Discovery** 
- [ ] **Phase 4: Brand Voice Learning System**
- [ ] **Phase 5: Conversational Learning System**
- [ ] **Phase 6: Grant Application Assistant**
- [ ] **Phase 7: Deployment & Integration**

### 🚀 NEXT SESSION PRIORITIES (Final 5% of Phase 1.5)

**Remaining Tasks (Est. 1 hour total)**:
1. **Debug Log Cleanup** (15 min) - Remove excessive debug logging for cleaner terminal output
2. **Firecrawl Integration** (30 min) - Add website analysis capability to enhance profiles
3. **Final Testing & Polish** (15 min) - End-to-end validation with production-ready experience

**Status**: Core enhanced profile system 100% working, just need polish and website integration!

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

## 🚀 NEXT STEPS: Completing Phase 1.5

### Remaining Implementation (Final 5%)

#### 1. Debug Log Cleanup (15 min)
- Remove excessive console.log statements from production routes
- Keep error logging, remove success/debug messages
- Clean terminal output for better user experience

#### 2. Firecrawl Integration (30 min)  
- Update Firecrawl: `npm update firecrawl`
- Review API changes from current v1.29.1
- Implement website crawling for profile enhancement
- Test with kaiaulu.earth URL
- Add website content to existing profiles (append, not replace)

#### 3. Final Testing & Polish (15 min)
- End-to-end validation of complete profile system
- Test startup profile detection
- Verify conversational profile updates
- Confirm clean, production-ready experience

### User Experience Flow (Current Working State)
```
Startup: "Hi! I found your profile for Hawaii Indigenous Wisdom & Group Coherence - focused on traditional knowledge systems and community healing. Are we still working together on grant discovery?"

Profile Updates: "Based on our conversation, I'd like to update your Focus Areas to include 'land stewardship practices'. Should I save this change?"

Website Enhancement: "I can analyze your website to enhance your profile. Should I crawl kaiaulu.earth for additional context?"
```

**Total Remaining Time**: ~1 hour for Phase 1.5 completion

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
**Phase 1.5 (95% Complete)**: Organization profiles, Notion integration, enhanced fields, conversational updates
**Next**: Complete Firecrawl integration → Phase 2 (Grant Discovery)

**Remember**: Keep this document updated as we progress! 🚀