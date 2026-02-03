import { useState } from 'react'
import { Annotation, AnnotationReply, getCategoryColor, getCategoryIcon, formatTimestamp, createAnnotationReply, extractMentions } from '@/lib/session-replay'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ChatCircle, CheckCircle, PaperPlaneRight, Trash, X, At } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { MentionInput } from '@/components/MentionInput'
import { useKV } from '@github/spark/hooks'
import { createMentionNotification } from '@/components/MentionNotifications'

interface AnnotationThreadProps {
  annotation: Annotation
  onAddReply: (annotationId: string, reply: AnnotationReply) => void
  onDeleteReply: (annotationId: string, replyId: string) => void
  onResolve: (annotationId: string) => void
  onUnresolve: (annotationId: string) => void
  currentUserId: string
  currentUserName: string
  currentUserColor: string
  availableUsers: Array<{ userId: string; userName: string; userColor: string }>
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
  availableUsers,
  onClose
}: AnnotationThreadProps) {
  const [replyContent, setReplyContent] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  
  const color = getCategoryColor(annotation.category)
  const icon = getCategoryIcon(annotation.category)
  const replies = annotation.replies || []

  const sendMentionNotifications = async (mentions: string[], replyContent: string) => {
    for (const mentionedUserName of mentions) {
      const mentionedUser = availableUsers.find(
        u => u.userName.toLowerCase() === mentionedUserName.toLowerCase()
      )
      
      if (mentionedUser && mentionedUser.userId !== currentUserId) {
        const notification = createMentionNotification(
          mentionedUser.userId,
          currentUserName,
          currentUserColor,
          annotation.id,
          annotation.title,
          replyContent
        )

        const storageKey = `mentions-${mentionedUser.userId}`
        const existingNotifications: any[] = await (window.spark as any).kv.get(storageKey) || []
        await (window.spark as any).kv.set(storageKey, [...existingNotifications, notification])
      }
    }
  }

  const handleAddReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty')
      return
    }

    const mentions = extractMentions(replyContent)
    const reply = createAnnotationReply(
      annotation.id,
      currentUserId,
      currentUserName,
      currentUserColor,
      replyContent,
      mentions
    )

    onAddReply(annotation.id, reply)
    
    if (mentions.length > 0) {
      await sendMentionNotifications(mentions, replyContent)
      const mentionedNames = mentions.map(m => `@${m}`).join(', ')
      toast.success('🎉 Reply sent with mentions!', {
        description: `Notified ${mentions.length} ${mentions.length === 1 ? 'person' : 'people'}: ${mentionedNames}`,
        duration: 5000
      })
    } else {
      toast.success('Reply added')
    }
    
    setReplyContent('')
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
                    <div className="whitespace-pre-wrap pl-8 text-sm">
                      {reply.content.split(/(@\w+)/g).map((part, i) => {
                        if (part.startsWith('@')) {
                          const userName = part.substring(1)
                          const mentionedUser = availableUsers.find(
                            u => u.userName.toLowerCase() === userName.toLowerCase()
                          )
                          return (
                            <span
                              key={i}
                              className="text-accent font-medium bg-accent/10 px-1 rounded"
                              style={mentionedUser ? { color: mentionedUser.userColor } : undefined}
                            >
                              {part}
                            </span>
                          )
                        }
                        return <span key={i}>{part}</span>
                      })}
                    </div>
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
            {replies.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-2"
              >
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <At size={12} weight="bold" className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-accent mb-1">
                      💬 Start the conversation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Type @ followed by a name to mention someone. Try <span className="font-mono bg-card px-1 rounded">@Alice</span>, <span className="font-mono bg-card px-1 rounded">@Bob</span>, or <span className="font-mono bg-card px-1 rounded">@Charlie</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-1"
                style={{ backgroundColor: currentUserColor }}
              >
                {currentUserName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <MentionInput
                  value={replyContent}
                  onChange={setReplyContent}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a reply... Type @ to mention someone (Cmd/Ctrl+Enter to send)"
                  rows={3}
                  availableUsers={availableUsers}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <At size={12} />
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
