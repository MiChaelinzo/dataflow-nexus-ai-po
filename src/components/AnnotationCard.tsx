import { Annotation, getCategoryColor, getCategoryIcon, formatDuration } from '@/lib/session-replay'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChatCircle, CheckCircle, Clock } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface AnnotationCardProps {
  annotation: Annotation
  relativeTime: number
  onClick: () => void
  onSeek?: (timestamp: number) => void
}

export function AnnotationCard({ 
  annotation, 
  relativeTime, 
  onClick,
  onSeek 
}: AnnotationCardProps) {
  const color = getCategoryColor(annotation.category)
  const icon = getCategoryIcon(annotation.category)
  const replyCount = annotation.replies?.length || 0

  const handleSeek = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSeek?.(annotation.timestamp)
  }

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        annotation.resolved 
          ? 'bg-success/5 border-success/20 opacity-75 hover:opacity-100' 
          : 'bg-card/50 border-border/50 hover:border-accent/40 hover:bg-accent/5'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: `${color}20`,
                color: color,
                borderColor: `${color}40`
              }}
            >
              {icon} {annotation.category}
            </Badge>
            {annotation.resolved && (
              <Badge className="text-xs bg-success/20 text-success border-success/40">
                <CheckCircle size={10} weight="fill" className="mr-1" />
                Resolved
              </Badge>
            )}
          </div>
          {onSeek && (
            <Button
              onClick={handleSeek}
              variant="ghost"
              size="sm"
              className="h-6 px-2 gap-1"
            >
              <Clock size={12} />
              <span className="text-xs font-mono">
                {formatDuration(relativeTime)}
              </span>
            </Button>
          )}
        </div>
        
        <h4 className="font-semibold text-sm">{annotation.title}</h4>
        
        {annotation.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {annotation.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: annotation.userColor }}
            />
            <span className="text-xs text-muted-foreground">
              {annotation.userName}
            </span>
          </div>
          
          {replyCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ChatCircle size={14} weight="fill" />
              <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
