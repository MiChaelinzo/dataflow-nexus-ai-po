import { Bookmark } from '@/lib/session-replay'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash, BookmarkSimple } from '@phosphor-icons/react'

interface BookmarkMarkerProps {
  bookmark: Bookmark
  position: number
  isActive?: boolean
  onSeek: (timestamp: number) => void
  onDelete?: (id: string) => void
  canDelete?: boolean
}

export function BookmarkMarker({ 
  bookmark, 
  position, 
  isActive,
  onSeek,
  onDelete,
  canDelete
}: BookmarkMarkerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute bottom-0"
      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
    >
      <div className="relative group">
        <button
          onClick={() => onSeek(bookmark.timestamp)}
          className={`flex flex-col items-center cursor-pointer transition-all hover:scale-110 ${
            isActive ? 'scale-110' : ''
          }`}
          title={bookmark.label}
        >
          <BookmarkSimple 
            size={24} 
            weight="fill"
            style={{ color: bookmark.color }}
            className={isActive ? 'drop-shadow-lg' : ''}
          />
        </button>

        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
          <Card className="p-3 w-48 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm flex-1">{bookmark.label}</h4>
                {canDelete && onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(bookmark.id)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash size={14} />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: bookmark.userColor }}
                />
                <span className="text-xs text-muted-foreground">
                  {bookmark.userName}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
