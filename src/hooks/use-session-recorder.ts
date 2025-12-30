import { useState, useCallback, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { SessionRecording, SessionEvent, createSessionEvent } from '@/lib/session-replay'

interface UseSessionRecorderOptions {
  enabled?: boolean
  currentUserId: string
  currentUserName: string
  currentUserColor: string
  currentView: string
}

export function useSessionRecorder({
  enabled = false,
  currentUserId,
  currentUserName,
  currentUserColor,
  currentView
}: UseSessionRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [currentSession, setCurrentSession] = useState<SessionRecording | null>(null)
  const [recordings, setRecordings] = useKV<SessionRecording[]>('session-recordings', [])
  const eventsBuffer = useRef<SessionEvent[]>([])
  const sessionStartTime = useRef<number>(0)
  const saveInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastScrollTime = useRef<number>(0)
  const lastCursorTime = useRef<number>(0)

  const recordEvent = useCallback((type: SessionEvent['type'], data: any) => {
    if (!isRecording || !currentSession) return

    const event = createSessionEvent(
      type,
      currentUserId,
      currentUserName,
      currentUserColor,
      data
    )

    eventsBuffer.current.push(event)

    setCurrentSession(prev => {
      if (!prev) return null
      return {
        ...prev,
        events: [...prev.events, event],
        duration: Date.now() - prev.startTime
      }
    })
  }, [isRecording, currentSession, currentUserId, currentUserName, currentUserColor])

  const startRecording = useCallback((title: string = 'Untitled Session') => {
    const now = Date.now()
    sessionStartTime.current = now

    const newSession: SessionRecording = {
      id: `session-${now}-${Math.random().toString(36).substring(7)}`,
      startTime: now,
      duration: 0,
      events: [],
      participants: [{
        userId: currentUserId,
        userName: currentUserName,
        userColor: currentUserColor,
        joinedAt: now
      }],
      metadata: {
        title,
        tags: [],
        views: [currentView]
      }
    }

    setCurrentSession(newSession)
    setIsRecording(true)
    eventsBuffer.current = []

    recordEvent('interaction', { description: 'Started recording session', action: 'start' })

    saveInterval.current = setInterval(() => {
      if (eventsBuffer.current.length > 0) {
        setRecordings((prev) => {
          const current = prev || []
          const existing = current.find(r => r.id === newSession.id)
          if (existing) {
            return current.map(r => r.id === newSession.id 
              ? { ...r, events: [...r.events, ...eventsBuffer.current], duration: Date.now() - r.startTime }
              : r
            )
          }
          return current
        })
        eventsBuffer.current = []
      }
    }, 5000)
  }, [currentUserId, currentUserName, currentUserColor, currentView, recordEvent, setRecordings])

  const stopRecording = useCallback(() => {
    if (!currentSession) return

    recordEvent('interaction', { description: 'Stopped recording session', action: 'stop' })

    const finalSession: SessionRecording = {
      ...currentSession,
      endTime: Date.now(),
      duration: Date.now() - currentSession.startTime,
      events: [...currentSession.events, ...eventsBuffer.current],
      participants: currentSession.participants.map(p => 
        p.userId === currentUserId && !p.leftAt 
          ? { ...p, leftAt: Date.now() }
          : p
      )
    }

    setRecordings((prev) => {
      const current = prev || []
      const existing = current.find(r => r.id === finalSession.id)
      if (existing) {
        return current.map(r => r.id === finalSession.id ? finalSession : r)
      }
      return [...current, finalSession]
    })

    setIsRecording(false)
    setCurrentSession(null)
    eventsBuffer.current = []

    if (saveInterval.current) {
      clearInterval(saveInterval.current)
      saveInterval.current = undefined
    }
  }, [currentSession, currentUserId, recordEvent, setRecordings])

  const deleteRecording = useCallback((sessionId: string) => {
    setRecordings((prev) => (prev || []).filter(r => r.id !== sessionId))
  }, [setRecordings])

  const updateRecordingMetadata = useCallback((
    sessionId: string,
    updates: Partial<SessionRecording>
  ) => {
    setRecordings((prev) => 
      (prev || []).map(r => 
        r.id === sessionId 
          ? { ...r, ...updates }
          : r
      )
    )
  }, [setRecordings])

  useEffect(() => {
    if (!isRecording) return

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastCursorTime.current < 100) return
      lastCursorTime.current = now

      recordEvent('cursor', { x: e.clientX, y: e.clientY })
    }

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)
      recordEvent('click', {
        x: e.clientX,
        y: e.clientY,
        target: target.tagName,
        id: target.id,
        className: target.className
      })
    }

    const handleScroll = () => {
      const now = Date.now()
      if (now - lastScrollTime.current < 200) return
      lastScrollTime.current = now

      recordEvent('scroll', {
        scrollX: window.scrollX,
        scrollY: window.scrollY
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isRecording, recordEvent])

  useEffect(() => {
    if (isRecording && currentSession) {
      const views = currentSession.metadata.views
      if (!views.includes(currentView)) {
        setCurrentSession(prev => {
          if (!prev) return null
          return {
            ...prev,
            metadata: {
              ...prev.metadata,
              views: [...views, currentView]
            }
          }
        })
      }

      recordEvent('tab-change', { tab: currentView, from: views[views.length - 1] })
    }
  }, [currentView, isRecording, currentSession, recordEvent])

  return {
    isRecording,
    currentSession,
    recordings,
    startRecording,
    stopRecording,
    recordEvent,
    deleteRecording,
    updateRecordingMetadata
  }
}
