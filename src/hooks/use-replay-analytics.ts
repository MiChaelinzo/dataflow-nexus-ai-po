import { useState, useCallback, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  ReplayView, 
  createReplayView, 
  addViewerInteraction,
  updateWatchedSegment,
  finalizeReplayView,
  ViewerInteraction
} from '@/lib/replay-analytics'

interface UseReplayAnalyticsOptions {
  sessionId: string
  sessionDuration: number
  viewerId: string
  viewerName: string
  viewerColor: string
  enabled?: boolean
}

export function useReplayAnalytics({
  sessionId,
  sessionDuration,
  viewerId,
  viewerName,
  viewerColor,
  enabled = true
}: UseReplayAnalyticsOptions) {
  const [currentView, setCurrentView] = useState<ReplayView | null>(null)
  const [views, setViews] = useKV<ReplayView[]>('replay-views', [])
  const lastUpdateTime = useRef<number>(0)
  const updateInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  const isInitialized = useRef(false)

  const startTracking = useCallback(() => {
    if (!enabled || currentView) return

    const newView = createReplayView(sessionId, viewerId, viewerName, viewerColor)
    setCurrentView(newView)
    isInitialized.current = true

    updateInterval.current = setInterval(() => {
      setCurrentView((prev) => {
        if (!prev) return null
        
        setViews((existingViews) => {
          const current = existingViews || []
          const viewIndex = current.findIndex(v => v.id === prev.id)
          
          if (viewIndex >= 0) {
            return current.map((v, i) => i === viewIndex ? prev : v)
          } else {
            return [...current, prev]
          }
        })
        
        return prev
      })
    }, 10000)
  }, [enabled, currentView, sessionId, viewerId, viewerName, viewerColor, setViews])

  const stopTracking = useCallback(() => {
    if (!currentView) return

    const finalView = finalizeReplayView(currentView)
    
    setViews((prev) => {
      const current = prev || []
      const viewIndex = current.findIndex(v => v.id === finalView.id)
      
      if (viewIndex >= 0) {
        return current.map((v, i) => i === viewIndex ? finalView : v)
      } else {
        return [...current, finalView]
      }
    })

    setCurrentView(null)
    isInitialized.current = false

    if (updateInterval.current) {
      clearInterval(updateInterval.current)
      updateInterval.current = undefined
    }
  }, [currentView, setViews])

  const trackInteraction = useCallback((
    type: ViewerInteraction['type'],
    playbackTime: number,
    data?: any
  ) => {
    if (!currentView) return

    const updatedView = addViewerInteraction(currentView, type, playbackTime, data)
    setCurrentView(updatedView)
  }, [currentView])

  const updatePlaybackPosition = useCallback((currentTime: number) => {
    if (!currentView) return

    const now = Date.now()
    if (now - lastUpdateTime.current < 1000) return
    lastUpdateTime.current = now

    const updatedView = updateWatchedSegment(currentView, currentTime, sessionDuration)
    setCurrentView(updatedView)
  }, [currentView, sessionDuration])

  useEffect(() => {
    if (enabled && !isInitialized.current) {
      startTracking()
    }

    return () => {
      if (currentView) {
        stopTracking()
      }
    }
  }, [enabled])

  return {
    currentView,
    allViews: views || [],
    startTracking,
    stopTracking,
    trackInteraction,
    updatePlaybackPosition
  }
}
