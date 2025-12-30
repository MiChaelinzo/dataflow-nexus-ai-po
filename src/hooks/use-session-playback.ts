import { useState, useCallback, useEffect, useRef } from 'react'
import { SessionRecording, SessionEvent, PlaybackState } from '@/lib/session-replay'

interface UseSessionPlaybackOptions {
  recording: SessionRecording | null
  onEventPlay?: (event: SessionEvent) => void
}

export function useSessionPlayback({ recording, onEventPlay }: UseSessionPlaybackOptions) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    playbackSpeed: 1,
    currentEventIndex: 0
  })

  const playbackInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  const startTimeRef = useRef<number>(0)
  const pauseTimeRef = useRef<number>(0)

  const play = useCallback(() => {
    if (!recording || recording.events.length === 0) return

    if (playbackState.isPaused) {
      const pausedDuration = Date.now() - pauseTimeRef.current
      startTimeRef.current += pausedDuration
    } else {
      startTimeRef.current = Date.now() - playbackState.currentTime
    }

    setPlaybackState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false
    }))
  }, [recording, playbackState.isPaused, playbackState.currentTime])

  const pause = useCallback(() => {
    pauseTimeRef.current = Date.now()
    
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: true
    }))

    if (playbackInterval.current) {
      clearInterval(playbackInterval.current)
      playbackInterval.current = undefined
    }
  }, [])

  const stop = useCallback(() => {
    setPlaybackState({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      playbackSpeed: 1,
      currentEventIndex: 0
    })

    if (playbackInterval.current) {
      clearInterval(playbackInterval.current)
      playbackInterval.current = undefined
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (!recording) return

    const clampedTime = Math.max(0, Math.min(time, recording.duration))
    
    const eventIndex = recording.events.findIndex(
      event => event.timestamp - recording.startTime >= clampedTime
    )

    setPlaybackState(prev => ({
      ...prev,
      currentTime: clampedTime,
      currentEventIndex: eventIndex >= 0 ? eventIndex : recording.events.length - 1
    }))

    if (playbackState.isPlaying) {
      startTimeRef.current = Date.now() - clampedTime
    }
  }, [recording, playbackState.isPlaying])

  const setSpeed = useCallback((speed: PlaybackState['playbackSpeed']) => {
    setPlaybackState(prev => ({ ...prev, playbackSpeed: speed }))
    
    if (playbackState.isPlaying) {
      startTimeRef.current = Date.now() - playbackState.currentTime
    }
  }, [playbackState.isPlaying, playbackState.currentTime])

  useEffect(() => {
    if (!playbackState.isPlaying || !recording) {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current)
        playbackInterval.current = undefined
      }
      return
    }

    playbackInterval.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) * playbackState.playbackSpeed
      
      if (elapsed >= recording.duration) {
        stop()
        return
      }

      const currentEventIndex = recording.events.findIndex(
        event => event.timestamp - recording.startTime >= elapsed
      )

      if (currentEventIndex >= 0 && currentEventIndex !== playbackState.currentEventIndex) {
        const event = recording.events[currentEventIndex]
        onEventPlay?.(event)
      }

      setPlaybackState(prev => ({
        ...prev,
        currentTime: elapsed,
        currentEventIndex: currentEventIndex >= 0 ? currentEventIndex : prev.currentEventIndex
      }))
    }, 16)

    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current)
        playbackInterval.current = undefined
      }
    }
  }, [playbackState.isPlaying, playbackState.playbackSpeed, playbackState.currentEventIndex, recording, onEventPlay, stop])

  const currentEvents = recording 
    ? recording.events.filter(
        event => event.timestamp - recording.startTime <= playbackState.currentTime
      )
    : []

  const progress = recording && recording.duration > 0
    ? (playbackState.currentTime / recording.duration) * 100
    : 0

  return {
    playbackState,
    currentEvents,
    progress,
    play,
    pause,
    stop,
    seek,
    setSpeed
  }
}
