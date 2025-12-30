import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { SessionRecording, formatDuration } from '@/lib/session-replay'
import { exportReplayAsShareableLink, exportReplayData, generateShareableId } from '@/lib/export-replay'
import { Link, VideoCamera, DownloadSimple, Copy, Check, Lock, LockOpen, Note, BookmarkSimple, Users, ShareNetwork } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface ExportReplayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recording: SessionRecording
}

export function ExportReplayDialog({ open, onOpenChange, recording }: ExportReplayDialogProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'video' | 'data'>('link')
  const [includeAnnotations, setIncludeAnnotations] = useState(true)
  const [includeBookmarks, setIncludeBookmarks] = useState(true)
  const [requirePassword, setRequirePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [expiresIn, setExpiresIn] = useState<'never' | '1hour' | '24hours' | '7days' | '30days'>('7days')
  const [shareableLink, setShareableLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateLink = async () => {
    setIsGenerating(true)
    
    try {
      const shareId = await generateShareableId(recording.id)
      const link = await exportReplayAsShareableLink(
        recording,
        shareId,
        {
          includeAnnotations,
          includeBookmarks,
          password: requirePassword ? password : undefined,
          expiresIn: expiresIn === 'never' ? undefined : expiresIn
        }
      )
      
      setShareableLink(link)
      toast.success('Shareable link generated!', {
        description: 'Copy the link to share this recording'
      })
    } catch (error) {
      toast.error('Failed to generate link', {
        description: 'Please try again'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = async () => {
    if (shareableLink) {
      await navigator.clipboard.writeText(shareableLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExportData = () => {
    const data = exportReplayData(recording, {
      includeAnnotations,
      includeBookmarks
    })
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `replay-${recording.id}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Replay data exported!', {
      description: 'JSON file downloaded'
    })
  }

  const handleExportVideo = () => {
    toast.info('Video export coming soon!', {
      description: 'This feature will allow you to export replays as MP4 video files'
    })
  }

  const annotationCount = recording.annotations?.length || 0
  const bookmarkCount = recording.bookmarks?.length || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Export Session Replay</DialogTitle>
          <DialogDescription>
            Share your recording or export it for external use
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="gap-2">
              <Link size={16} weight="duotone" />
              Shareable Link
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <VideoCamera size={16} weight="duotone" />
              Video Export
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <DownloadSimple size={16} weight="duotone" />
              Raw Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-6">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Link size={20} weight="duotone" className="text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Generate Shareable Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a secure link that others can use to view this replay with all its annotations and bookmarks.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  <Note size={20} weight="duotone" className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Include Annotations</p>
                    <p className="text-xs text-muted-foreground">{annotationCount} annotation{annotationCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Switch checked={includeAnnotations} onCheckedChange={setIncludeAnnotations} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  <BookmarkSimple size={20} weight="duotone" className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Include Bookmarks</p>
                    <p className="text-xs text-muted-foreground">{bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Switch checked={includeBookmarks} onCheckedChange={setIncludeBookmarks} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  {requirePassword ? (
                    <Lock size={20} weight="duotone" className="text-warning" />
                  ) : (
                    <LockOpen size={20} weight="duotone" className="text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Password Protection</p>
                    <p className="text-xs text-muted-foreground">Require password to view</p>
                  </div>
                </div>
                <Switch checked={requirePassword} onCheckedChange={setRequirePassword} />
              </div>

              {requirePassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label>Link Expiration</Label>
                <div className="grid grid-cols-5 gap-2">
                  {(['1hour', '24hours', '7days', '30days', 'never'] as const).map((option) => (
                    <Button
                      key={option}
                      variant={expiresIn === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExpiresIn(option)}
                      className="text-xs"
                    >
                      {option === 'never' ? 'Never' : 
                       option === '1hour' ? '1 Hour' :
                       option === '24hours' ? '24 Hrs' :
                       option === '7days' ? '7 Days' : '30 Days'}
                    </Button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {shareableLink ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <Card className="p-4 bg-gradient-to-br from-accent/10 via-card to-success/10 border-accent/30">
                      <Label className="text-xs text-muted-foreground mb-2 block">Your Shareable Link</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={shareableLink}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          onClick={handleCopyLink}
                          size="sm"
                          variant="outline"
                          className="gap-2 flex-shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check size={16} weight="bold" className="text-success" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                        <div className="font-semibold mb-1">🔗 Link Ready</div>
                        <div className="text-muted-foreground">Share with anyone</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                        <div className="font-semibold mb-1">{requirePassword ? '🔒 Protected' : '🔓 Open Access'}</div>
                        <div className="text-muted-foreground">{requirePassword ? 'Password required' : 'No password needed'}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                        <div className="font-semibold mb-1">⏰ {expiresIn === 'never' ? 'Never Expires' : 'Auto-expires'}</div>
                        <div className="text-muted-foreground">
                          {expiresIn === 'never' ? 'Permanent link' :
                           expiresIn === '1hour' ? 'In 1 hour' :
                           expiresIn === '24hours' ? 'In 24 hours' :
                           expiresIn === '7days' ? 'In 7 days' : 'In 30 days'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <Button 
                    onClick={handleGenerateLink} 
                    className="w-full gap-2"
                    disabled={isGenerating || (requirePassword && !password)}
                  >
                    <Link size={18} weight="bold" />
                    {isGenerating ? 'Generating...' : 'Generate Shareable Link'}
                  </Button>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-6">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-metric-purple/20 flex items-center justify-center flex-shrink-0">
                  <VideoCamera size={20} weight="duotone" className="text-metric-purple" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Export as Video</h4>
                  <p className="text-sm text-muted-foreground">
                    Export your replay as an MP4 video with cursor animations, annotations, and bookmarks overlaid on the timeline.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">{formatDuration(recording.duration)}</div>
                  <div className="text-xs text-muted-foreground">Video Duration</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-metric-purple mb-1">{recording.participants.length}</div>
                  <div className="text-xs text-muted-foreground">Participants</div>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  <Note size={20} weight="duotone" className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Include Annotations Overlay</p>
                    <p className="text-xs text-muted-foreground">Show annotations on timeline</p>
                  </div>
                </div>
                <Switch checked={includeAnnotations} onCheckedChange={setIncludeAnnotations} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  <BookmarkSimple size={20} weight="duotone" className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Include Bookmark Markers</p>
                    <p className="text-xs text-muted-foreground">Show bookmarks on timeline</p>
                  </div>
                </div>
                <Switch checked={includeBookmarks} onCheckedChange={setIncludeBookmarks} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  <Users size={20} weight="duotone" className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Show Cursor Trails</p>
                    <p className="text-xs text-muted-foreground">Animate user cursors</p>
                  </div>
                </div>
                <Switch checked defaultChecked />
              </div>
            </div>

            <Card className="p-4 bg-gradient-to-br from-warning/10 via-card to-warning/5 border-warning/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                  <VideoCamera size={18} weight="bold" className="text-warning" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Coming Soon</h4>
                  <p className="text-xs text-muted-foreground">
                    Video export functionality is under development. Soon you'll be able to export high-quality MP4 videos of your replay sessions.
                  </p>
                </div>
              </div>
            </Card>

            <Button onClick={handleExportVideo} className="w-full gap-2" disabled>
              <VideoCamera size={18} weight="bold" />
              Export as MP4 Video (Coming Soon)
            </Button>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-6">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                  <DownloadSimple size={20} weight="duotone" className="text-success" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Download Raw Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Export the complete replay data as a JSON file for external processing or archival purposes.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">{recording.events.length}</div>
                  <div className="text-xs text-muted-foreground">Total Events</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-metric-purple mb-1">{annotationCount}</div>
                  <div className="text-xs text-muted-foreground">Annotations</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success mb-1">{bookmarkCount}</div>
                  <div className="text-xs text-muted-foreground">Bookmarks</div>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  <Note size={20} weight="duotone" className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Include Annotations</p>
                    <p className="text-xs text-muted-foreground">Export with all annotation data</p>
                  </div>
                </div>
                <Switch checked={includeAnnotations} onCheckedChange={setIncludeAnnotations} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  <BookmarkSimple size={20} weight="duotone" className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Include Bookmarks</p>
                    <p className="text-xs text-muted-foreground">Export with all bookmark data</p>
                  </div>
                </div>
                <Switch checked={includeBookmarks} onCheckedChange={setIncludeBookmarks} />
              </div>
            </div>

            <Card className="p-4 bg-muted/30">
              <div className="text-xs space-y-1 font-mono text-muted-foreground">
                <div>Format: JSON</div>
                <div>Includes: Events, Participants, Metadata{includeAnnotations && ', Annotations'}{includeBookmarks && ', Bookmarks'}</div>
                <div>Filename: replay-{recording.id}-{Date.now()}.json</div>
              </div>
            </Card>

            <Button onClick={handleExportData} className="w-full gap-2">
              <DownloadSimple size={18} weight="bold" />
              Download JSON Data
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
