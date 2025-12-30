import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SessionRecording, formatDuration, formatTimestamp } from '@/lib/session-replay'
import { ReplayView, calculateReplayAnalytics } from '@/lib/replay-analytics'
import { Play, Trash, Clock, Users, Eye, Note, BookmarkSimple, ShareNetwork, ChartBar, TrendUp } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'

interface SessionRecordingCardProps {
  recording: SessionRecording
  onPlay: (recording: SessionRecording) => void
  onDelete: (sessionId: string) => void
  onExport?: (recording: SessionRecording) => void
}

export function SessionRecordingCard({ recording, onPlay, onDelete, onExport }: SessionRecordingCardProps) {
  const [allViews] = useKV<ReplayView[]>('replay-views', [])
  
  const participantCount = recording.participants.length
  const eventCount = recording.events.length
  const viewsCount = recording.metadata.views.length
  const annotationCount = recording.annotations?.length || 0
  const bookmarkCount = recording.bookmarks?.length || 0
  
  const sessionViews = (allViews || []).filter(v => v.sessionId === recording.id)
  const hasAnalytics = sessionViews.length > 0
  
  let analytics: ReturnType<typeof calculateReplayAnalytics> | null = null
  if (hasAnalytics) {
    analytics = calculateReplayAnalytics(recording.id, recording.duration, sessionViews)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="p-5 hover:border-accent/40 transition-all group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Play size={24} weight="fill" className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">
                    {recording.metadata.title}
                  </h3>
                  {recording.metadata.tags.includes('demo') && (
                    <Badge className="bg-gradient-to-r from-accent to-metric-purple text-white border-0 text-xs">
                      ✨ Demo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(recording.startTime)} • {formatDuration(recording.duration)}
                </p>
              </div>
            </div>

            {recording.metadata.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {recording.metadata.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users size={16} weight="duotone" />
                <span>{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Eye size={16} weight="duotone" />
                <span>{viewsCount} view{viewsCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock size={16} weight="duotone" />
                <span>{eventCount} events</span>
              </div>
              {annotationCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Note size={16} weight="duotone" />
                  <span>{annotationCount}</span>
                </div>
              )}
              {bookmarkCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BookmarkSimple size={16} weight="duotone" />
                  <span>{bookmarkCount}</span>
                </div>
              )}
            </div>

            {hasAnalytics && analytics && (
              <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-accent/10 to-transparent border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBar size={16} weight="duotone" className="text-accent" />
                  <span className="text-sm font-semibold text-accent">Analytics Available</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Total Views</div>
                    <div className="font-semibold font-mono">{analytics.totalViews}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Watch Time</div>
                    <div className="font-semibold font-mono">{formatDuration(analytics.averageDuration)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Completion</div>
                    <div className="font-semibold font-mono flex items-center gap-1">
                      {analytics.averageCompletionRate.toFixed(0)}%
                      {analytics.averageCompletionRate >= 75 && (
                        <TrendUp size={12} weight="bold" className="text-success" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {recording.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {recording.metadata.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {recording.participants.slice(0, 5).map(participant => (
                <div
                  key={participant.userId}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: participant.userColor }}
                  title={participant.userName}
                >
                  {participant.userName.charAt(0).toUpperCase()}
                </div>
              ))}
              {recording.participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{recording.participants.length - 5}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onPlay(recording)}
              className="gap-2"
              size="sm"
            >
              <Play size={16} weight="fill" />
              Play
            </Button>
            {onExport && (
              <Button
                onClick={() => onExport(recording)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ShareNetwork size={16} weight="duotone" />
                Export
              </Button>
            )}
            <Button
              onClick={() => onDelete(recording.id)}
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash size={16} weight="duotone" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
