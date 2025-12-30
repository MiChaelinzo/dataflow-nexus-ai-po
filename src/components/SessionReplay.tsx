import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSessionRecorder } from '@/hooks/use-session-recorder'
import { SessionRecordingCard } from '@/components/SessionRecordingCard'
import { SessionPlaybackViewer } from '@/components/SessionPlaybackViewer'
import { ExportReplayDialog } from '@/components/ExportReplayDialog'
import { SessionRecording, createSessionEvent } from '@/lib/session-replay'
import { MentionFeatureShowcase } from '@/components/MentionFeatureShowcase'
import { MentionTestingCard } from '@/components/MentionTestingCard'
import { Record, StopCircle, Video, List, Info, Sparkle, At, ShareNetwork } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface SessionReplayProps {
  currentUserId: string
  currentUserName: string
  currentUserColor: string
  currentView: string
}

export function SessionReplay({
  currentUserId,
  currentUserName,
  currentUserColor,
  currentView
}: SessionReplayProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'recordings'>('record')
  const [playingRecording, setPlayingRecording] = useState<SessionRecording | null>(null)
  const [exportingRecording, setExportingRecording] = useState<SessionRecording | null>(null)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')

  const {
    isRecording,
    currentSession,
    recordings,
    startRecording,
    stopRecording,
    deleteRecording,
    updateRecordingMetadata
  } = useSessionRecorder({
    enabled: true,
    currentUserId,
    currentUserName,
    currentUserColor,
    currentView
  })

  const createDemoRecording = () => {
    const now = Date.now()
    const durationMs = 60000 // 60 second demo
    
    const demoUsers = [
      { userId: 'user-001', userName: 'Alice', userColor: 'oklch(0.60 0.18 290)' },
      { userId: 'user-002', userName: 'Bob', userColor: 'oklch(0.65 0.15 195)' },
      { userId: 'user-003', userName: 'Charlie', userColor: 'oklch(0.65 0.15 145)' },
      { userId: currentUserId, userName: currentUserName, userColor: currentUserColor }
    ]
    
    const events = [
      createSessionEvent('interaction', demoUsers[0].userId, demoUsers[0].userName, demoUsers[0].userColor, 
        { description: 'Started session', action: 'start' }),
      createSessionEvent('tab-change', demoUsers[0].userId, demoUsers[0].userName, demoUsers[0].userColor,
        { tab: 'dashboard', from: 'replay' }),
      createSessionEvent('cursor', demoUsers[0].userId, demoUsers[0].userName, demoUsers[0].userColor,
        { x: 150, y: 200 }),
      createSessionEvent('click', demoUsers[0].userId, demoUsers[0].userName, demoUsers[0].userColor,
        { x: 150, y: 200, target: 'BUTTON', id: 'insight-btn' }),
      createSessionEvent('tab-change', demoUsers[1].userId, demoUsers[1].userName, demoUsers[1].userColor,
        { tab: 'insights', from: 'dashboard' }),
      createSessionEvent('cursor', demoUsers[1].userId, demoUsers[1].userName, demoUsers[1].userColor,
        { x: 400, y: 300 }),
      createSessionEvent('interaction', demoUsers[2].userId, demoUsers[2].userName, demoUsers[2].userColor,
        { description: 'Generated AI insights', action: 'generate' }),
    ]
    
    events.forEach((event, i) => {
      event.timestamp = now + (i * 8000)
    })
    
    const demoRecording: SessionRecording = {
      id: `demo-session-${now}`,
      startTime: now,
      endTime: now + durationMs,
      duration: durationMs,
      events: events,
      participants: demoUsers.map((user, i) => ({
        ...user,
        joinedAt: now + (i * 5000),
        leftAt: now + durationMs
      })),
      metadata: {
        title: '🎯 Demo Session - Test @Mentions Here',
        description: 'Sample recording with multiple participants for testing @mention functionality',
        tags: ['demo', 'tutorial', 'mentions'],
        views: ['dashboard', 'insights', 'replay']
      },
      annotations: [],
      bookmarks: []
    }
    
    updateRecordingMetadata(demoRecording.id, demoRecording)
    setActiveTab('recordings')
    toast.success('Demo recording created!', {
      description: 'Switch to Recordings tab to test @mentions'
    })
  }

  const handleStartRecording = () => {
    if (!sessionTitle.trim()) {
      toast.error('Please enter a session title')
      return
    }

    startRecording(sessionTitle)
    setShowStartDialog(false)
    setSessionTitle('')
    setSessionDescription('')
    toast.success('Recording started', {
      description: 'All collaboration activities are being captured'
    })
  }

  const handleStopRecording = () => {
    stopRecording()
    toast.success('Recording stopped', {
      description: 'Session has been saved successfully'
    })
  }

  const handlePlayRecording = (recording: SessionRecording) => {
    setPlayingRecording(recording)
    toast.info('Playback started', {
      description: 'Use controls to play, pause, and seek'
    })
  }

  const handleDeleteRecording = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      deleteRecording(sessionId)
      toast.success('Recording deleted')
    }
  }

  const handleClosePlayback = () => {
    setPlayingRecording(null)
  }

  const handleUpdateRecording = (updatedRecording: SessionRecording) => {
    updateRecordingMetadata(updatedRecording.id, updatedRecording)
  }

  const handleExportRecording = (recording: SessionRecording) => {
    setExportingRecording(recording)
  }

  const sortedRecordings = [...(recordings || [])].sort((a, b) => b.startTime - a.startTime)

  return (
    <>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Video size={24} weight="duotone" className="text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Session Replay</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Record and playback collaboration sessions with cursor tracking, interactions, and timeline events.
                  Perfect for reviewing team workflows and training.
                </p>
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <Button
                      onClick={() => setShowStartDialog(true)}
                      className="gap-2"
                    >
                      <Record size={18} weight="fill" />
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Badge className="gap-2 px-4 py-2 bg-destructive/20 text-destructive border-destructive/30">
                        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                        Recording
                      </Badge>
                      <Button
                        onClick={handleStopRecording}
                        variant="destructive"
                        className="gap-2"
                      >
                        <StopCircle size={18} weight="fill" />
                        Stop Recording
                      </Button>
                      {currentSession && (
                        <span className="text-sm text-muted-foreground">
                          {currentSession.events.length} events captured
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'record' | 'recordings')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="record" className="gap-2">
              <Info size={16} weight="duotone" />
              About
            </TabsTrigger>
            <TabsTrigger value="recordings" className="gap-2">
              <List size={16} weight="duotone" />
              Recordings ({recordings?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MentionTestingCard onStartDemoRecording={createDemoRecording} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <MentionFeatureShowcase />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <Card className="p-6">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Record size={20} weight="duotone" className="text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Recording</h3>
                <p className="text-sm text-muted-foreground">
                  Capture all collaboration activities including cursor movements, clicks, tab changes, and interactions.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center mb-4">
                  <Video size={20} weight="duotone" className="text-success" />
                </div>
                <h3 className="font-semibold mb-2">Playback Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Play, pause, seek, and adjust playback speed. See exactly how team members collaborated.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-10 h-10 rounded-lg bg-metric-purple/20 flex items-center justify-center mb-4">
                  <Sparkle size={20} weight="duotone" className="text-metric-purple" />
                </div>
                <h3 className="font-semibold mb-2">Event Timeline</h3>
                <p className="text-sm text-muted-foreground">
                  View detailed timeline of all events with user attribution and timestamps.
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-warning/10 border-accent/30">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <ShareNetwork size={20} weight="duotone" className="text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Export & Share</h3>
                <p className="text-sm text-muted-foreground">
                  Generate shareable links or export as JSON/video with annotations included.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-accent">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Start Recording</h4>
                      <p className="text-sm text-muted-foreground">
                        Click "Start Recording" and give your session a descriptive title. All collaboration activities will be captured automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-accent">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Collaborate Normally</h4>
                      <p className="text-sm text-muted-foreground">
                        Work with your team as usual. Every cursor movement, click, tab change, and interaction is recorded.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-accent">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Stop & Review</h4>
                      <p className="text-sm text-muted-foreground">
                        Stop recording when done. Access your recordings from the Recordings tab to playback and review.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-accent">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Export & Share</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate shareable links with password protection and expiration. Export as JSON for archival or future video export.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="recordings" className="space-y-4 mt-6">
            {sortedRecordings.length === 0 ? (
              <div className="space-y-4">
                <Card className="p-12 text-center border-dashed">
                  <Video size={64} weight="thin" className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Recordings Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Start recording a collaboration session to capture cursor movements, interactions, and team activity.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button onClick={() => setShowStartDialog(true)} className="gap-2">
                      <Record size={18} weight="fill" />
                      Start First Recording
                    </Button>
                    <Button 
                      onClick={createDemoRecording} 
                      variant="outline" 
                      className="gap-2 border-accent/30 hover:bg-accent/10"
                    >
                      <Sparkle size={18} weight="fill" className="text-accent" />
                      Create Demo for @Mention Testing
                    </Button>
                  </div>
                </Card>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/30">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <At size={24} weight="fill" className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          Want to Test @Mentions Right Away?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create a demo recording pre-populated with multiple participants. Perfect for testing @mentions in annotation replies and seeing notifications in action!
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                            <div className="font-semibold mb-1">✅ Multiple Users</div>
                            <div className="text-muted-foreground">Demo includes Alice, Bob, Charlie + you</div>
                          </div>
                          <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                            <div className="font-semibold mb-1">⚡ Instant Setup</div>
                            <div className="text-muted-foreground">No recording needed, ready to use</div>
                          </div>
                          <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                            <div className="font-semibold mb-1">🎯 Test @Mentions</div>
                            <div className="text-muted-foreground">Add annotations and mention users</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {sortedRecordings.map((recording) => (
                  <SessionRecordingCard
                    key={recording.id}
                    recording={recording}
                    onPlay={handlePlayRecording}
                    onDelete={handleDeleteRecording}
                    onExport={handleExportRecording}
                  />
                ))}
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Session Recording</DialogTitle>
            <DialogDescription>
              Give your recording session a descriptive title to help identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-title">Session Title *</Label>
              <Input
                id="session-title"
                placeholder="e.g., Dashboard Design Review"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-description">Description (Optional)</Label>
              <Textarea
                id="session-description"
                placeholder="Add notes about this session..."
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowStartDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartRecording} className="gap-2">
              <Record size={18} weight="fill" />
              Start Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {playingRecording && (
        <SessionPlaybackViewer
          recording={playingRecording}
          onClose={handleClosePlayback}
          onUpdateRecording={handleUpdateRecording}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserColor={currentUserColor}
        />
      )}

      {exportingRecording && (
        <ExportReplayDialog
          open={!!exportingRecording}
          onOpenChange={(open) => !open && setExportingRecording(null)}
          recording={exportingRecording}
        />
      )}
    </>
  )
}
