'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Bot, User, File, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import FileUpload from './FileUpload'

// Hydration-safe timestamp component
function MessageTimestamp({ timestamp }: { timestamp: Date }) {
  const [displayTime, setDisplayTime] = useState<string>('')

  useEffect(() => {
    // Only set the time after hydration to prevent server/client mismatch
    setDisplayTime(timestamp.toLocaleTimeString())
  }, [timestamp])

  return <span>{displayTime}</span>
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  files?: File[]
}

interface OrganizationProfile {
  id: string
  profileName: string
  legalName: string
  missionStatement?: string
  focusAreas?: string[]
  location?: string
  activeStatus?: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Organization profile state
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  // Character limit for chat input to prevent network timeouts
  const MAX_CHAT_LENGTH = 15000

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Profile detection on component mount
  useEffect(() => {
    const detectProfile = async () => {
      try {
        setProfileLoading(true)
        
        const response = await fetch('/api/notion-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_active_profile'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to check for existing profile')
        }

        const data = await response.json()
        
        if (data.success && data.profile) {
          setOrganizationProfile(data.profile)
        }
        
        // Set initial welcome message based on profile detection
        const welcomeMessage: Message = {
          id: '1',
          role: 'assistant',
          content: generateWelcomeMessage(data.profile),
          timestamp: new Date()
        }
        
        setMessages([welcomeMessage])
        
      } catch (error) {
        console.error('Profile detection error:', error)
        
        // Fallback to generic welcome message
        const fallbackMessage: Message = {
          id: '1',
          role: 'assistant',
          content: generateWelcomeMessage(null),
          timestamp: new Date()
        }
        
        setMessages([fallbackMessage])
      } finally {
        setProfileLoading(false)
      }
    }

    detectProfile()
  }, [])

  // Generate dynamic welcome message based on profile
  const generateWelcomeMessage = (profile: OrganizationProfile | null) => {
    if (profile) {
      const focusAreasText = profile.focusAreas && profile.focusAreas.length > 0 
        ? profile.focusAreas.slice(0, 3).join(', ') 
        : 'your mission areas'
      
      const locationText = profile.location ? ` based in ${profile.location}` : ''
      
      return `# Welcome back! 🎯

I found your profile for **${profile.profileName}**${locationText} - focused on ${focusAreasText}. 

Are we continuing with grant discovery for this organization? I'm ready to help with:

- **Finding new grants** that match your focus areas
- **Updating your profile** with new information  
- **Working on applications** for specific opportunities
- **Analyzing new documents** to enhance your profile

**Quick actions:**
• Type "find grants" to search for new opportunities
• Type "update profile" to modify your organization details
• Type "switch organization" if you want to work with a different org
• Upload new documents about your organization

What would you like to work on today?`
    } else {
      return `# Welcome to your Grant Writing Agent! 🎯

I'm here to help you discover and apply for grants. I can:

- **Learn your organization** from documents and websites
- **Find relevant grants** using real-time web search
- **Rank opportunities** by relevance and urgency  
- **Draft applications** question by question
- **Learn from your feedback** to improve over time

To get started, you can:
1. Upload documents about your organization
2. Share your website URL for analysis
3. Or just tell me about your organization and what grants you're looking for

What would you like to do first?`
    }
  }

  // Function to refresh organization profile from Notion
  const refreshOrganizationProfile = async () => {
    try {
      const response = await fetch('/api/notion-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_active_profile'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.profile) {
          setOrganizationProfile(data.profile)
        }
      }
    } catch (error) {
      console.error('Failed to refresh organization profile:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return
    
    // Check for profile commands
    const inputLower = input.trim().toLowerCase()
    
    if (inputLower === 'update profile' || inputLower === 'edit profile') {
      const responseMessage: Message = {
        id: generateUniqueId(),
        role: 'assistant',
        content: organizationProfile
          ? `I can help update your **${organizationProfile.profileName}** profile! Here are some ways:\n\n- Upload new documents to analyze and enhance your profile\n- Tell me specific changes you'd like to make\n- Share your website URL for additional context\n- Describe new programs or focus areas to add\n\nWhat would you like to update?`
          : `I don't see an existing profile yet. Let's create one! You can:\n- Upload documents about your organization\n- Share your website URL\n- Tell me about your organization`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, {
        id: generateUniqueId(),
        role: 'user',
        content: input.trim(),
        timestamp: new Date()
      }, responseMessage])
      setInput('')
      return
    }
    
    if (inputLower === 'switch organization' || inputLower === 'change organization') {
      const responseMessage: Message = {
        id: generateUniqueId(),
        role: 'assistant',
        content: `Multi-organization support is coming soon! For now, you can:\n- Work with your current profile\n- Upload documents for a new organization (I'll help create a new profile)\n- Let me know if you need to work with a different organization`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, {
        id: generateUniqueId(),
        role: 'user',
        content: input.trim(),
        timestamp: new Date()
      }, responseMessage])
      setInput('')
      return
    }
    
    // Check if message is too long for chat (files can handle large content)
    if (attachedFiles.length === 0 && input.trim().length > MAX_CHAT_LENGTH) {
      const errorMessage: Message = {
        id: generateUniqueId(),
        role: 'assistant',
        content: `That's quite a bit of text! 📄 For large content (over ${MAX_CHAT_LENGTH.toLocaleString()} characters), try uploading a .txt or .md file instead - you'll get better analysis that way!\n\nYou can click the 📎 button to upload your content as a file, or break your message into smaller parts.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: generateUniqueId(),
      role: 'user',
      content: input.trim() || 'I\'ve uploaded some documents for you to analyze.',
      timestamp: new Date(),
      files: attachedFiles.length > 0 ? attachedFiles : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachedFiles([])
    setShowFileUpload(false)
    setIsLoading(true)

    try {
      let response
      
      if (attachedFiles.length > 0) {
        // Handle file upload
        const formData = new FormData()
        attachedFiles.forEach(file => formData.append('files', file))
        formData.append('messages', JSON.stringify([...messages, userMessage]))
        formData.append('userMessage', userMessage.content)

        response = await fetch('/api/analyze-documents', {
          method: 'POST',
          body: formData
        })
      } else {
        // Regular chat message
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage]
          })
        })
      }

      if (!response.ok) throw new Error('Failed to send message')
      
      const data = await response.json()
      
      const assistantMessage: Message = {
        id: generateUniqueId(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // If profile was updated, refresh the organization profile
      if (data.profileUpdated) {
        console.log('Profile updated, refreshing...')
        await refreshOrganizationProfile()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: generateUniqueId(),
        role: 'assistant',
        content: `Sorry, I encountered an error processing your request. ${input.trim().length > 5000 ? 'If you\'re sending a large amount of text, try uploading it as a .txt file instead! 📄' : 'Please try again.'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFilesSelected = (files: File[]) => {
    // Add new files to existing attached files instead of replacing
    setAttachedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      const newFiles = files.filter(f => !existingNames.has(f.name))
      return [...prev, ...newFiles]
    })
    setShowFileUpload(false)
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-900">Grant Writing Agent</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Your AI co-founder for grant discovery and application</p>
          {organizationProfile && (
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Working with: {organizationProfile.profileName}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {profileLoading && messages.length === 0 && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-sm text-gray-600 ml-2">Checking for your organization profile...</span>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
              {message.role === 'user' && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-500">You</span>
                </div>
              )}
              
              <div className={`rounded-lg p-4 ${
                message.role === 'user' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'bg-white border border-gray-200'
              }`}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({children}) => <h1 className="text-lg font-bold mb-3 text-gray-900">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-semibold mb-2 mt-4 text-gray-800">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-semibold mb-2 mt-3 text-gray-700">{children}</h3>,
                        p: ({children}) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">{children}</ol>,
                        li: ({children}) => <li className="text-gray-700">{children}</li>,
                        strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                        code: ({children}) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                        pre: ({children}) => <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm">{children}</pre>
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-900">{message.content}</p>
                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.files.map((file, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            📎 {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-400 mt-1">
                <MessageTimestamp timestamp={message.timestamp} />
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end gap-3">
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Upload files"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              className={`w-full resize-none border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 text-gray-900 placeholder-gray-500 ${
                input.length > MAX_CHAT_LENGTH ? 'border-red-300 bg-red-50' : 
                input.length > MAX_CHAT_LENGTH * 0.8 ? 'border-yellow-300 bg-yellow-50' : 
                'border-gray-300'
              }`}
              rows={1}
              style={{
                minHeight: '44px',
                height: Math.min(input.split('\n').length * 24 + 20, 128) + 'px'
              }}
              disabled={isLoading}
            />
            {input.length > MAX_CHAT_LENGTH * 0.6 && (
              <div className={`text-xs mt-1 ${
                input.length > MAX_CHAT_LENGTH ? 'text-red-600' :
                input.length > MAX_CHAT_LENGTH * 0.8 ? 'text-yellow-600' :
                'text-gray-500'
              }`}>
                {input.length.toLocaleString()} / {MAX_CHAT_LENGTH.toLocaleString()} characters
                {input.length > MAX_CHAT_LENGTH && ' - Too long! Try uploading as a file instead.'}
                {input.length > MAX_CHAT_LENGTH * 0.8 && input.length <= MAX_CHAT_LENGTH && ' - Getting long. Consider uploading as a file.'}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading || (attachedFiles.length === 0 && input.length > MAX_CHAT_LENGTH)}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Attached files ({attachedFiles.length}):
              </span>
            </div>
            <div className="space-y-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    onClick={() => removeAttachedFile(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showFileUpload && (
          <div className="mt-3">
            <FileUpload
              onFilesUploaded={handleFilesSelected}
              onClose={() => setShowFileUpload(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}