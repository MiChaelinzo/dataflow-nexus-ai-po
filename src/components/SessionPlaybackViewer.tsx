import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SessionRecording, SessionEvent, formatDuration, getEventIcon, getEventDescription } from '@/lib/session-replay'
import { useSessionPlayback } from '@/hooks/use-session-playback'
import { Play, Pause, Stop, FastForward, Rewind, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CursorPosition } from '@/lib/types'

interface SessionPlaybackViewerProps {
  recording: SessionRecording
  onClose: () => void
}

export function SessionPlaybackViewer({ recording, onClose }: SessionPlaybackViewerProps) {
  const [selectedEvent, setSelectedEvent] = useState<SessionEvent | null>(null)
  const [showCursors, setShowCursors] = useState(true)

  const handleEventPlay = (event: SessionEvent) => {
    console.log('Playing event:', event)
  }

  const {
    playbackState,
    currentEvents,
    progress,
    play,
    pause,
    stop,
    seek,
    setSpeed
  } = useSessionPlayback({
    recording,
    onEventPlay: handleEventPlay
  })

  const handleSeek = (value: number[]) => {
    const time = (value[0] / 100) * recording.duration
    seek(time)
  }

  const handleSpeedChange = (speed: 0.5 | 1 | 1.5 | 2) => {
    setSpeed(speed)
  }

  const cursorEvents = currentEvents.filter(e => e.type === 'cursor') as (SessionEvent & { data: { x: number; y: number } })[]
  const latestCursorsByUser = new Map<string, CursorPosition>()
  
  cursorEvents.forEach(event => {
    latestCursorsByUser.set(event.userId, {
      userId: event.userId,
      userName: event.userName,
      userColor: event.userColor,
      x: event.data.x,
      y: event.data.y,
      timestamp: event.timestamp
    })
  })

  const activeCursors = Array.from(latestCursorsByUser.values())

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{recording.metadata.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {recording.events.length} events • {recording.participants.length} participants
              </p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="gap-2">
              <X size={20} />
              Close
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative overflow-hidden bg-background/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                <Play size={48} weight="duotone" className="text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Session Playback</h3>
              <p className="text-muted-foreground mb-6">
                Watch the collaboration session replay with cursor movements and interactions
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-card/50 p-4 rounded-lg border border-border/50">
                  <div className="text-2xl font-mono font-bold text-accent">
                    {formatDuration(playbackState.currentTime)}
                  </div>
                  <div className="text-muted-foreground mt-1">Current Time</div>
                </div>
                <div className="bg-card/50 p-4 rounded-lg border border-border/50">
                  <div className="text-2xl font-mono font-bold text-metric-purple">
                    {currentEvents.length}
                  </div>
                  <div className="text-muted-foreground mt-1">Events Played</div>
                </div>
              </div>
            </div>
          </div>

          {showCursors && (
            <AnimatePresence>
              {activeCursors.map(cursor => (
                <motion.div
                  key={cursor.userId}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.8, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="fixed pointer-events-none z-10"
                  style={{
                    left: `${cursor.x}px`,
                    top: `${cursor.y}px`,
                    transform: 'translate(-2px, -2px)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5.65376 12.3673L9.37816 20.7815C9.56149 21.2216 10.1494 21.3473 10.4903 21.0064L12.6889 18.8078C12.8862 18.6105 13.1614 18.5252 13.4313 18.5772L18.9321 19.5866C19.4722 19.6881 19.9346 19.2257 19.8331 18.6856L13.019 2.03958C12.9104 1.47639 12.2057 1.30219 11.8492 1.75585L5.32091 10.3323C5.04022 10.6871 5.47128 11.1861 5.65376 12.3673Z"
                      fill={cursor.userColor}
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <div
                    className="absolute left-6 top-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg"
                    style={{
                      backgroundColor: cursor.userColor,
                      color: 'white'
                    }}
                  >
                    {cursor.userName}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="w-96 border-l border-border/50 bg-card/30 backdrop-blur flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold mb-2">Event Timeline</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={showCursors ? "default" : "outline"}
                onClick={() => setShowCursors(!showCursors)}
                className="text-xs"
              >
                {showCursors ? 'Hide' : 'Show'} Cursors
              </Button>
              <Badge variant="secondary" className="text-xs">
                {currentEvents.length} / {recording.events.length}
              </Badge>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {currentEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedEvent?.id === event.id
                          ? 'bg-accent/10 border-accent/40'
                          : 'bg-card/50 border-border/50 hover:border-accent/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">{getEventIcon(event.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: event.userColor }}
                            />
                            <span className="text-xs font-medium truncate">{event.userName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {getEventDescription(event)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {formatDuration(event.timestamp - recording.startTime)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="border-t border-border/50 bg-card/50 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-muted-foreground min-w-[80px]">
                {formatDuration(playbackState.currentTime)}
              </span>
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm font-mono text-muted-foreground min-w-[80px] text-right">
                {formatDuration(recording.duration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!playbackState.isPlaying ? (
                  <Button onClick={play} size="sm" className="gap-2">
                    <Play size={16} weight="fill" />
                    {playbackState.isPaused ? 'Resume' : 'Play'}
                  </Button>
                ) : (
                  <Button onClick={pause} size="sm" className="gap-2" variant="secondary">
                    <Pause size={16} weight="fill" />
                    Pause
                  </Button>
                )}
                <Button onClick={stop} size="sm" variant="ghost" className="gap-2">
                  <Stop size={16} weight="fill" />
                  Stop
                </Button>
                <Button
                  onClick={() => seek(Math.max(0, playbackState.currentTime - 5000))}
                  size="sm"
                  variant="ghost"
                >
                  <Rewind size={16} weight="duotone" />
                </Button>
                <Button
                  onClick={() => seek(Math.min(recording.duration, playbackState.currentTime + 5000))}
                  size="sm"
                  variant="ghost"
                >
                  <FastForward size={16} weight="duotone" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Speed:</span>
                {([0.5, 1, 1.5, 2] as const).map(speed => (
                  <Button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    size="sm"
                    variant={playbackState.playbackSpeed === speed ? "default" : "ghost"}
                    className="w-12"
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
