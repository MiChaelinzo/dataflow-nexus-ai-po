import { useState } from 'react'
import { Annotation, AnnotationReply, getCategoryColor, getCategoryIcon, formatTimestamp, createAnnotationReply } from '@/lib/session-replay'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ChatCircle, CheckCircle, PaperPlaneRight, Trash, Pencil, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface AnnotationThreadProps {
  annotation: Annotation
  onAddReply: (annotationId: string, reply: AnnotationReply) => void
  onDeleteReply: (annotationId: string, replyId: string) => void
  onResolve: (annotationId: string) => void
  onUnresolve: (annotationId: string) => void
  currentUserId: string
  currentUserName: string
  currentUserColor: string
  onClose?: () => void
}

export function AnnotationThread({
  annotation,
  onAddReply,
  onDeleteReply,
  onResolve,
  onUnresolve,
  currentUserId,
  currentUserName,
  currentUserColor,
  onClose
}: AnnotationThreadProps) {
  const [replyContent, setReplyContent] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  
  const color = getCategoryColor(annotation.category)
  const icon = getCategoryIcon(annotation.category)
  const replies = annotation.replies || []

  const handleAddReply = () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty')
      return
    }

    const reply = createAnnotationReply(
      annotation.id,
      currentUserId,
      currentUserName,
      currentUserColor,
      replyContent
    )

    onAddReply(annotation.id, reply)
    setReplyContent('')
    toast.success('Reply added')
  }

  const handleDeleteReply = (replyId: string) => {
    if (confirm('Are you sure you want to delete this reply?')) {
      onDeleteReply(annotation.id, replyId)
      toast.success('Reply deleted')
    }
  }

  const handleResolve = () => {
    if (annotation.resolved) {
      onUnresolve(annotation.id)
      toast.success('Annotation reopened')
    } else {
      onResolve(annotation.id)
      toast.success('Annotation resolved')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleAddReply()
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
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
                  <CheckCircle size={12} weight="fill" className="mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg">{annotation.title}</h3>
            {annotation.description && (
              <p className="text-sm text-muted-foreground">{annotation.description}</p>
            )}
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X size={16} />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: annotation.userColor }}
            >
              {annotation.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{annotation.userName}</p>
              <p className="text-xs text-muted-foreground">{formatTimestamp(annotation.createdAt)}</p>
            </div>
          </div>
          <Button
            onClick={handleResolve}
            size="sm"
            variant={annotation.resolved ? "outline" : "default"}
            className="gap-2"
          >
            <CheckCircle size={16} weight={annotation.resolved ? "regular" : "fill"} />
            {annotation.resolved ? 'Reopen' : 'Resolve'}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {replies.length === 0 ? (
            <div className="text-center py-8">
              <ChatCircle size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No replies yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to join the discussion</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {replies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                          style={{ backgroundColor: reply.userColor }}
                        >
                          {reply.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{reply.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(reply.createdAt)}
                            {reply.editedAt && ' (edited)'}
                          </p>
                        </div>
                      </div>
                      {reply.userId === currentUserId && (
                        <Button
                          onClick={() => handleDeleteReply(reply.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Trash size={14} />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap pl-8">{reply.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {!annotation.resolved && (
        <>
          <Separator />
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-1"
                style={{ backgroundColor: currentUserColor }}
              >
                {currentUserName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Add a reply... (Cmd/Ctrl+Enter to send)"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Press Cmd/Ctrl+Enter to send
                  </p>
                  <Button
                    onClick={handleAddReply}
                    disabled={!replyContent.trim()}
                    size="sm"
                    className="gap-2"
                  >
                    <PaperPlaneRight size={16} weight="fill" />
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {annotation.resolved && annotation.resolvedBy && (
        <div className="p-4 border-t border-border/50 bg-success/5">
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle size={16} weight="fill" />
            <span>Resolved by {annotation.resolvedBy}</span>
            {annotation.resolvedAt && (
              <span className="text-muted-foreground">• {formatTimestamp(annotation.resolvedAt)}</span>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
