import { Annotation, getCategoryColor, getCategoryIcon } from '@/lib/session-replay'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash } from '@phosphor-icons/react'

interface AnnotationMarkerProps {
  annotation: Annotation
  position: number
  isActive?: boolean
  onSeek: (timestamp: number) => void
  onDelete?: (id: string) => void
  canDelete?: boolean
}

export function AnnotationMarker({ 
  annotation, 
  position, 
  isActive,
  onSeek,
  onDelete,
  canDelete
}: AnnotationMarkerProps) {
  const color = getCategoryColor(annotation.category)
  const icon = getCategoryIcon(annotation.category)

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
          onClick={() => onSeek(annotation.timestamp)}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all hover:scale-125 ${
            isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-125' : ''
          }`}
          style={{ backgroundColor: color }}
          title={annotation.title}
        >
          {icon}
        </button>

        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
          <Card className="p-3 w-64 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Badge 
                    className="mb-2 text-xs"
                    style={{ 
                      backgroundColor: `${color}20`,
                      color: color,
                      borderColor: `${color}40`
                    }}
                  >
                    {annotation.category}
                  </Badge>
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
              
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: annotation.userColor }}
                />
                <span className="text-xs text-muted-foreground">
                  {annotation.userName}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
