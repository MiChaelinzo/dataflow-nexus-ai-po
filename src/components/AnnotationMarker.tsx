import { Annotation, getCategoryColor, getCategoryIcon } from '@/lib/session-replay'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash, ChatCircle, CheckCircle } from '@phosphor-icons/react'

interface AnnotationMarkerProps {
  annotation: Annotation
  position: number
  isActive?: boolean
  onSeek: (timestamp: number) => void
  onDelete?: (id: string) => void
  canDelete?: boolean
  onClick?: () => void
}

export function AnnotationMarker({ 
  annotation, 
  position, 
  isActive,
  onSeek,
  onDelete,
  canDelete,
  onClick
}: AnnotationMarkerProps) {
  const color = getCategoryColor(annotation.category)
  const icon = getCategoryIcon(annotation.category)
  const replyCount = annotation.replies?.length || 0

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      onSeek(annotation.timestamp)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="absolute top-0"
      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
    >
      <div className="relative group">
        <button
          onClick={handleClick}
          className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all hover:scale-125 ${
            isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-125' : ''
          } ${annotation.resolved ? 'opacity-60' : ''}`}
          style={{ backgroundColor: color }}
          title={annotation.title}
        >
          {icon}
          {replyCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[8px] font-bold flex items-center justify-center border border-background">
              {replyCount}
            </div>
          )}
          {annotation.resolved && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success flex items-center justify-center">
              <CheckCircle size={10} weight="fill" className="text-white" />
            </div>
          )}
        </button>

        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
          <Card className="p-3 w-64 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${color}20`,
                        color: color,
                        borderColor: `${color}40`
                      }}
                    >
                      {annotation.category}
                    </Badge>
                    {annotation.resolved && (
                      <Badge className="text-xs bg-success/20 text-success border-success/40">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm">{annotation.title}</h4>
                </div>
                {canDelete && onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(annotation.id)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash size={14} />
                  </Button>
                )}
              </div>
              
              {annotation.description && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {annotation.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: annotation.userColor }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {annotation.userName}
                  </span>
                </div>
                {replyCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChatCircle size={12} weight="fill" />
                    <span>{replyCount}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
