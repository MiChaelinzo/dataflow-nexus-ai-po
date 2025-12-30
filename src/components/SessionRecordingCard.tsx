import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SessionRecording, formatDuration, formatTimestamp } from '@/lib/session-replay'
import { Play, Trash, Clock, Users, Eye } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface SessionRecordingCardProps {
  recording: SessionRecording
  onPlay: (recording: SessionRecording) => void
  onDelete: (sessionId: string) => void
}

export function SessionRecordingCard({ recording, onPlay, onDelete }: SessionRecordingCardProps) {
  const participantCount = recording.participants.length
  const eventCount = recording.events.length
  const viewsCount = recording.metadata.views.length

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
                <h3 className="font-semibold text-lg mb-1 truncate">
                  {recording.metadata.title}
                </h3>
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
            </div>

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
