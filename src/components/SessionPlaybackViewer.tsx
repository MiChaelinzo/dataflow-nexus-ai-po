import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SessionRecording, SessionEvent, Annotation, AnnotationReply, Bookmark, formatDuration, getEventIcon, getEventDescription, createAnnotation, createBookmark, getCategoryColor, getCategoryIcon } from '@/lib/session-replay'
import { useSessionPlayback } from '@/hooks/use-session-playback'
import { Play, Pause, Stop, FastForward, Rewind, X, Note, BookmarkSimple, ListChecks, ChatCircle, At, ShareNetwork } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CursorPosition } from '@/lib/types'
import { AnnotationMarker } from '@/components/AnnotationMarker'
import { BookmarkMarker } from '@/components/BookmarkMarker'
import { AddAnnotationDialog } from '@/components/AddAnnotationDialog'
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog'
import { AnnotationThread } from '@/components/AnnotationThread'
import { AnnotationCard } from '@/components/AnnotationCard'
import { ExportReplayDialog } from '@/components/ExportReplayDialog'
import { toast } from 'sonner'

interface SessionPlaybackViewerProps {
  recording: SessionRecording
  onClose: () => void
  onUpdateRecording?: (recording: SessionRecording) => void
  currentUserId: string
  currentUserName: string
  currentUserColor: string
}

export function SessionPlaybackViewer({ 
  recording, 
  onClose,
  onUpdateRecording,
  currentUserId,
  currentUserName,
  currentUserColor
}: SessionPlaybackViewerProps) {
  const [selectedEvent, setSelectedEvent] = useState<SessionEvent | null>(null)
  const [showCursors, setShowCursors] = useState(true)
  const [activeTab, setActiveTab] = useState<'events' | 'annotations' | 'bookmarks'>('events')
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false)
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [localRecording, setLocalRecording] = useState(recording)
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null)
  const [showThreadPanel, setShowThreadPanel] = useState(false)

  const annotations = localRecording.annotations || []
  const bookmarks = localRecording.bookmarks || []

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
    recording: localRecording,
    onEventPlay: handleEventPlay
  })

  const handleSeek = (value: number[]) => {
    const time = (value[0] / 100) * localRecording.duration
    seek(time)
  }

  const handleSeekToTime = (timestamp: number) => {
    const relativeTime = timestamp - localRecording.startTime
    seek(relativeTime)
  }

  const handleSpeedChange = (speed: 0.5 | 1 | 1.5 | 2) => {
    setSpeed(speed)
  }

  const handleAddAnnotation = (title: string, category: Annotation['category'], description?: string) => {
    const annotation = createAnnotation(
      localRecording.id,
      localRecording.startTime + playbackState.currentTime,
      currentUserId,
      currentUserName,
      currentUserColor,
      title,
      category,
      description
    )

    const updatedRecording = {
      ...localRecording,
      annotations: [...annotations, annotation]
    }
    
    setLocalRecording(updatedRecording)
    onUpdateRecording?.(updatedRecording)
    toast.success('Annotation added', {
      description: `Marked at ${formatDuration(playbackState.currentTime)}`
    })
  }

  const handleAddBookmark = (label: string, color: string) => {
    const bookmark = createBookmark(
      localRecording.id,
      localRecording.startTime + playbackState.currentTime,
      currentUserId,
      currentUserName,
      currentUserColor,
      label,
      color
    )

    const updatedRecording = {
      ...localRecording,
      bookmarks: [...bookmarks, bookmark]
    }
    
    setLocalRecording(updatedRecording)
    onUpdateRecording?.(updatedRecording)
    toast.success('Bookmark added', {
      description: label
    })
  }

  const handleDeleteAnnotation = (id: string) => {
    const updatedRecording = {
      ...localRecording,
      annotations: annotations.filter(a => a.id !== id)
    }
    
    setLocalRecording(updatedRecording)
    onUpdateRecording?.(updatedRecording)
    toast.success('Annotation deleted')
  }

  const handleDeleteBookmark = (id: string) => {
    const updatedRecording = {
      ...localRecording,
      bookmarks: bookmarks.filter(b => b.id !== id)
    }
    
    setLocalRecording(updatedRecording)
    onUpdateRecording?.(updatedRecording)
    toast.success('Bookmark deleted')
  }

  const handleAddReply = (annotationId: string, reply: AnnotationReply) => {
    const updatedAnnotations = annotations.map(ann => {
      if (ann.id === annotationId) {
        return {
          ...ann,
          replies: [...(ann.replies || []), reply]
        }
      }
      return ann
    })

    const updatedRecording = {
      ...localRecording,
      annotations: updatedAnnotations
    }

    setLocalRecording(updatedRecording)
    onUpdateRecording?.(updatedRecording)
    
    if (selectedAnnotation?.id === annotationId) {
      setSelectedAnnotation({
        ...selectedAnnotation,
        replies: [...(selectedAnnotation.replies || []), reply]
      })
    }
  }

  const handleDeleteReply = (annotationId: string, replyId: string) => {
    const updatedAnnotations = annotations.map(ann => {
      if (ann.id === annotationId) {
        return {
          ...ann,
          replies: (ann.replies || []).filter(r => r.id !== replyId)
        }
      }
      return ann
    })

    const updatedRecording = {
      ...localRecording,
      annotations: updatedAnnotations
    }

    setLocalRecording(updatedRecording)
    onUpdateRecording?.(updatedRecording)

    if (selectedAnnotation?.id === annotationId) {
      setSelectedAnnotation({
        ...selectedAnnotation,
        replies: (selectedAnnotation.replies || []).filter(r => r.id !== replyId)
      })
    }
  }

  const handleResolveAnnotation = (annotationId: string) => {
    const updatedAnnotations = annotations.map(ann => {
      if (ann.id === annotationId) {
        return {
          ...ann,
          resolved: true,
          resolvedBy: currentUserName,
          resolvedAt: Date.now()
        }
      }
      return ann
    })

    const updatedRecording = {
      ...localRecording,
      annotations: updatedAnnotations
    }

    setLocalRecording(updatedRecording)
    onUpdateRecording?.(updatedRecording)

    if (selectedAnnotation?.id === annotationId) {
      setSelectedAnnotation({
        ...selectedAnnotation,
        resolved: true,
        resolvedBy: currentUserName,
        resolvedAt: Date.now()
      })
    }
  }

  const handleUnresolveAnnotation = (annotationId: string) => {
    const updatedAnnotations = annotations.map(ann => {
      if (ann.id === annotationId) {
        return {
          ...ann,
          resolved: false,
          resolvedBy: undefined,
          resolvedAt: undefined
        }
      }
      return ann
    })

    const updatedRecording = {
      ...localRecording,
      annotations: updatedAnnotations
    }

    setLocalRecording(updatedRecording)
    onUpdateRecording?.(updatedRecording)

    if (selectedAnnotation?.id === annotationId) {
      setSelectedAnnotation({
        ...selectedAnnotation,
        resolved: false,
        resolvedBy: undefined,
        resolvedAt: undefined
      })
    }
  }

  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation)
    setShowThreadPanel(true)
  }

  const handleCloseThread = () => {
    setShowThreadPanel(false)
    setSelectedAnnotation(null)
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
              <h2 className="text-xl font-bold">{localRecording.metadata.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-muted-foreground">
                  {localRecording.events.length} events • {localRecording.participants.length} participants
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Note size={12} weight="fill" />
                    {annotations.length} annotations
                  </Badge>
                  {annotations.filter(a => !a.resolved).length > 0 && (
                    <Badge variant="secondary" className="text-xs gap-1 bg-warning/20 text-warning border-warning/40">
                      <ChatCircle size={12} weight="fill" />
                      {annotations.filter(a => !a.resolved).length} open
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs gap-1">
                    <BookmarkSimple size={12} weight="fill" />
                    {bookmarks.length} bookmarks
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowExportDialog(true)} variant="outline" size="sm" className="gap-2">
                <ShareNetwork size={16} weight="duotone" />
                Export
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm" className="gap-2">
                <X size={20} />
                Close
              </Button>
            </div>
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
          <div className="p-4 border-b border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Timeline</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={showCursors ? "default" : "outline"}
                  onClick={() => setShowCursors(!showCursors)}
                  className="text-xs"
                >
                  {showCursors ? 'Hide' : 'Show'} Cursors
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAnnotationDialog(true)}
                size="sm"
                variant="outline"
                className={`gap-2 flex-1 ${
                  localRecording.metadata.title.includes('Demo') && annotations.length === 0
                    ? 'animate-pulse border-accent/50 bg-accent/10 hover:bg-accent/20'
                    : ''
                }`}
              >
                <Note size={16} weight="duotone" />
                Add Annotation
              </Button>
              <Button
                onClick={() => setShowBookmarkDialog(true)}
                size="sm"
                variant="outline"
                className="gap-2 flex-1"
              >
                <BookmarkSimple size={16} weight="duotone" />
                Bookmark
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-border/50">
              <TabsTrigger value="events" className="gap-2">
                <ListChecks size={16} />
                Events
              </TabsTrigger>
              <TabsTrigger value="annotations" className="gap-2">
                <Note size={16} />
                Notes
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="gap-2">
                <BookmarkSimple size={16} />
                Marks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  <Badge variant="secondary" className="text-xs mb-2">
                    {currentEvents.length} / {localRecording.events.length}
                  </Badge>
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
                                {formatDuration(event.timestamp - localRecording.startTime)}
                              </p>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="annotations" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {annotations.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-accent/10 via-accent/5 to-metric-purple/10 border border-accent/30 rounded-lg p-4 mb-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <At size={20} weight="bold" className="text-accent" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-accent mb-1">
                              🚀 Test @Mentions Feature
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Add your first annotation to this recording, then use @ in replies to mention team members and trigger notifications.
                            </p>
                          </div>
                          <div className="bg-card/50 rounded-lg p-3 border border-border/50 space-y-2">
                            <p className="text-xs font-medium">Quick Steps:</p>
                            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                              <li>Click "Add Annotation" button above</li>
                              <li>Create an annotation at any timestamp</li>
                              <li>Click the annotation to open the thread</li>
                              <li>Type @ in the reply box to mention participants</li>
                              <li>Send the reply and watch notifications appear!</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {annotations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <At size={12} weight="bold" className="text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-accent mb-1">
                            💡 Try @mentions in replies
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Click any annotation to open its thread. Type @ in replies to mention team members and send them notifications.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {annotations.length === 0 ? (
                    <div className="text-center py-8">
                      <Note size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No annotations yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Mark important moments and start discussions</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {annotations
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .map((annotation) => {
                          const relativeTime = annotation.timestamp - localRecording.startTime
                          
                          return (
                            <AnnotationCard
                              key={annotation.id}
                              annotation={annotation}
                              relativeTime={relativeTime}
                              onClick={() => handleAnnotationClick(annotation)}
                              onSeek={handleSeekToTime}
                            />
                          )
                        })}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="bookmarks" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-8">
                      <BookmarkSimple size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No bookmarks yet</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {bookmarks
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .map((bookmark) => {
                          const relativeTime = bookmark.timestamp - localRecording.startTime
                          
                          return (
                            <motion.div
                              key={bookmark.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <button
                                onClick={() => handleSeekToTime(bookmark.timestamp)}
                                className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-accent/40 bg-card/50 hover:bg-accent/5 transition-all"
                              >
                                <div className="flex items-start gap-3">
                                  <BookmarkSimple 
                                    size={24} 
                                    weight="fill"
                                    style={{ color: bookmark.color }}
                                    className="flex-shrink-0 mt-0.5"
                                  />
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="font-semibold text-sm">{bookmark.label}</h4>
                                      <span className="text-xs font-mono text-muted-foreground">
                                        {formatDuration(relativeTime)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: bookmark.userColor }}
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        {bookmark.userName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </motion.div>
                          )
                        })}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="border-t border-border/50 bg-card/50 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-muted-foreground min-w-[80px]">
                {formatDuration(playbackState.currentTime)}
              </span>
              <div className="flex-1 relative">
                <div className="relative py-4">
                  <AnimatePresence>
                    {annotations.map(annotation => {
                      const position = ((annotation.timestamp - localRecording.startTime) / localRecording.duration) * 100
                      const isActive = Math.abs((localRecording.startTime + playbackState.currentTime) - annotation.timestamp) < 1000
                      return (
                        <AnnotationMarker
                          key={annotation.id}
                          annotation={annotation}
                          position={position}
                          isActive={isActive}
                          onSeek={handleSeekToTime}
                          onDelete={handleDeleteAnnotation}
                          canDelete={annotation.userId === currentUserId}
                          onClick={() => handleAnnotationClick(annotation)}
                        />
                      )
                    })}
                  </AnimatePresence>
                  <Slider
                    value={[progress]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="cursor-pointer"
                  />
                  <AnimatePresence>
                    {bookmarks.map(bookmark => {
                      const position = ((bookmark.timestamp - localRecording.startTime) / localRecording.duration) * 100
                      const isActive = Math.abs((localRecording.startTime + playbackState.currentTime) - bookmark.timestamp) < 1000
                      return (
                        <BookmarkMarker
                          key={bookmark.id}
                          bookmark={bookmark}
                          position={position}
                          isActive={isActive}
                          onSeek={handleSeekToTime}
                          onDelete={handleDeleteBookmark}
                          canDelete={bookmark.userId === currentUserId}
                        />
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
              <span className="text-sm font-mono text-muted-foreground min-w-[80px] text-right">
                {formatDuration(localRecording.duration)}
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
                  onClick={() => seek(Math.min(localRecording.duration, playbackState.currentTime + 5000))}
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
      
      <AddAnnotationDialog
        open={showAnnotationDialog}
        onOpenChange={setShowAnnotationDialog}
        onAdd={handleAddAnnotation}
        currentTime={formatDuration(playbackState.currentTime)}
      />
      
      <AddBookmarkDialog
        open={showBookmarkDialog}
        onOpenChange={setShowBookmarkDialog}
        onAdd={handleAddBookmark}
        currentTime={formatDuration(playbackState.currentTime)}
      />

      <AnimatePresence>
        {showThreadPanel && selectedAnnotation && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[500px] bg-background border-l border-border/50 shadow-2xl z-[60]"
          >
            <AnnotationThread
              annotation={selectedAnnotation}
              onAddReply={handleAddReply}
              onDeleteReply={handleDeleteReply}
              onResolve={handleResolveAnnotation}
              onUnresolve={handleUnresolveAnnotation}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserColor={currentUserColor}
              availableUsers={localRecording.participants.map(p => ({
                userId: p.userId,
                userName: p.userName,
                userColor: p.userColor
              }))}
              onClose={handleCloseThread}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ExportReplayDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        recording={localRecording}
      />
    </div>
  )
}
