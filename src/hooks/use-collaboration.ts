import { useState, useEffect, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { CursorPosition, UserPresence } from '@/lib/types'

const USER_COLORS = [
  'oklch(0.70 0.15 195)',
  'oklch(0.60 0.18 290)',
  'oklch(0.65 0.15 145)',
  'oklch(0.70 0.15 70)',
  'oklch(0.65 0.22 25)',
  'oklch(0.55 0.20 335)',
  'oklch(0.60 0.18 180)',
  'oklch(0.70 0.12 45)'
]

interface UseCollaborationOptions {
  currentView: string
  enabled?: boolean
}

export function useCollaboration({ currentView, enabled = true }: UseCollaborationOptions) {
  const [currentUser] = useState(() => {
    const existingUser = localStorage.getItem('collab-user')
    if (existingUser) return JSON.parse(existingUser)
    
    const newUser = {
      userId: `user-${Math.random().toString(36).substring(7)}`,
      userName: `User ${Math.floor(Math.random() * 1000)}`,
      userColor: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
    }
    localStorage.setItem('collab-user', JSON.stringify(newUser))
    return newUser
  })

  const [allPresence, setAllPresence] = useKV<Record<string, UserPresence>>('user-presence', {})
  const [cursors, setCursors] = useState<CursorPosition[]>([])
  const lastMouseMove = useRef<number>(0)
  const inactivityTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  const updatePresence = useCallback((updates: Partial<UserPresence> = {}) => {
    if (!enabled) return

    setAllPresence(current => {
      const updated = { ...(current || {}) }
      updated[currentUser.userId] = {
        ...currentUser,
        currentView,
        isActive: true,
        lastSeen: Date.now(),
        ...updates
      }
      return updated
    })
  }, [currentUser, currentView, enabled, setAllPresence])

  const markInactive = useCallback(() => {
    setAllPresence(current => {
      const updated = { ...(current || {}) }
      if (updated[currentUser.userId]) {
        updated[currentUser.userId].isActive = false
        updated[currentUser.userId].cursor = undefined
      }
      return updated
    })
  }, [currentUser.userId, setAllPresence])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled) return
    
    const now = Date.now()
    if (now - lastMouseMove.current < 50) return
    lastMouseMove.current = now

    const cursor: CursorPosition = {
      ...currentUser,
      x: e.clientX,
      y: e.clientY,
      timestamp: now
    }

    updatePresence({ cursor, isActive: true })

    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current)
    }

    inactivityTimeout.current = setTimeout(() => {
      markInactive()
    }, 30000)
  }, [currentUser, enabled, updatePresence, markInactive])

  useEffect(() => {
    if (!enabled) return

    updatePresence({ isActive: true })

    window.addEventListener('mousemove', handleMouseMove)
    
    const visibilityHandler = () => {
      if (document.hidden) {
        markInactive()
      } else {
        updatePresence({ isActive: true })
      }
    }
    document.addEventListener('visibilitychange', visibilityHandler)

    const heartbeat = setInterval(() => {
      updatePresence({ lastSeen: Date.now() })
    }, 10000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', visibilityHandler)
      clearInterval(heartbeat)
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current)
      }
      markInactive()
    }
  }, [enabled, handleMouseMove, updatePresence, markInactive])

  useEffect(() => {
    if (!allPresence) return

    const now = Date.now()
    const fiveMinutesAgo = now - 300000
    
    const activeCursors: CursorPosition[] = Object.values(allPresence)
      .filter(user => 
        user.userId !== currentUser.userId &&
        user.isActive &&
        user.cursor &&
        user.lastSeen > fiveMinutesAgo
      )
      .map(user => user.cursor!)

    setCursors(activeCursors)

    const cleanup = setInterval(() => {
      setAllPresence(current => {
        const updated = { ...(current || {}) }
        Object.keys(updated).forEach(userId => {
          if (updated[userId].lastSeen < fiveMinutesAgo) {
            delete updated[userId]
          }
        })
        return updated
      })
    }, 60000)

    return () => clearInterval(cleanup)
  }, [allPresence, currentUser.userId, setAllPresence])

  const activeUsers = Object.values(allPresence || {}).filter(
    user => user.isActive && user.lastSeen > Date.now() - 60000
  )

  return {
    currentUser,
    cursors,
    activeUsers,
    updatePresence
  }
}
