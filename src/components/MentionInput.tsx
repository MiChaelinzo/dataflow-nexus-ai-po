import { useState, useRef, useEffect, KeyboardEvent, ReactNode } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { At } from '@phosphor-icons/react'

interface User {
  userId: string
  userName: string
  userColor: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
  availableUsers: User[]
  className?: string
}

interface MentionSuggestion extends User {
  matchIndex: number
}

export function MentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Type @ to mention someone...',
  rows = 3,
  availableUsers,
  className
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStart, setMentionStart] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const detectMention = (text: string, cursorPosition: number) => {
    const beforeCursor = text.substring(0, cursorPosition)
    const lastAtIndex = beforeCursor.lastIndexOf('@')
    
    if (lastAtIndex === -1) {
      setShowSuggestions(false)
      return
    }

    const textAfterAt = beforeCursor.substring(lastAtIndex + 1)
    
    if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
      setShowSuggestions(false)
      return
    }

    const query = textAfterAt.toLowerCase()
    const filtered = availableUsers
      .map((user, index) => ({
        ...user,
        matchIndex: index
      }))
      .filter(user => 
        user.userName.toLowerCase().includes(query) ||
        user.userId.toLowerCase().includes(query)
      )
      .slice(0, 5)

    if (filtered.length > 0) {
      setSuggestions(filtered)
      setMentionQuery(textAfterAt)
      setMentionStart(lastAtIndex)
      setShowSuggestions(true)
      setSelectedIndex(0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    const cursorPosition = e.target.selectionStart || 0
    detectMention(newValue, cursorPosition)
  }

  const insertMention = (user: User) => {
    if (mentionStart === -1) return

    const beforeMention = value.substring(0, mentionStart)
    const afterMention = value.substring(mentionStart + mentionQuery.length + 1)
    const newValue = `${beforeMention}@${user.userName} ${afterMention}`
    
    onChange(newValue)
    setShowSuggestions(false)
    setMentionQuery('')
    setMentionStart(-1)

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + user.userName.length + 2
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
      } else if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        insertMention(suggestions[selectedIndex])
        return
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowSuggestions(false)
        return
      }
    }

    onKeyDown?.(e)
  }

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const cursorPosition = target.selectionStart || 0
    detectMention(value, cursorPosition)
  }

  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const selected = suggestionsRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, showSuggestions])

  const renderTextWithMentions = (text: string): ReactNode[] => {
    const mentionRegex = /@(\w+)/g
    const parts: ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      parts.push(
        <span key={match.index} className="text-accent font-medium">
          {match[0]}
        </span>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 z-50"
          >
            <Card className="border-accent/30 shadow-lg overflow-hidden">
              <div className="p-2 border-b border-border/50 flex items-center gap-2 bg-muted/30">
                <At size={14} className="text-accent" />
                <span className="text-xs font-medium text-muted-foreground">
                  Mention someone
                </span>
              </div>
              <ScrollArea className="max-h-64">
                <div className="p-1">
                  {suggestions.map((user, index) => (
                    <button
                      key={user.userId}
                      data-index={index}
                      onClick={() => insertMention(user)}
                      className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
                        index === selectedIndex
                          ? 'bg-accent/20 text-accent'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: user.userColor }}
                      >
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{user.userName}</p>
                        <p className="text-xs text-muted-foreground">{user.userId}</p>
                      </div>
                      {index === selectedIndex && (
                        <span className="text-xs text-muted-foreground">Enter</span>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {value && (
        <div className="mt-2 text-xs text-muted-foreground">
          <At size={12} className="inline mr-1" />
          Use @ to mention team members
        </div>
      )}
    </div>
  )
}
