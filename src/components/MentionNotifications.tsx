import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Bell, Check, Trash, At } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTimestamp } from '@/lib/session-replay'
import { toast } from 'sonner'

export interface MentionNotification {
  id: string
  mentionedUserId: string
  mentionedBy: string
  mentionedByColor: string
  annotationId: string
  annotationTitle: string
  replyContent: string
  timestamp: number
  read: boolean
}

interface MentionNotificationsProps {
  currentUserId: string
  onNavigateToAnnotation?: (annotationId: string) => void
}

export function MentionNotifications({
  currentUserId,
  onNavigateToAnnotation
}: MentionNotificationsProps) {
  const [notifications, setNotifications] = useKV<MentionNotification[]>(
    `mentions-${currentUserId}`,
    []
  )
  const [open, setOpen] = useState(false)

  const unreadCount = (notifications || []).filter(n => !n.read).length

  const markAsRead = (notificationId: string) => {
    setNotifications(current =>
      (current || []).map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(current =>
      (current || []).map(n => ({ ...n, read: true }))
    )
    toast.success('All notifications marked as read')
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(current =>
      (current || []).filter(n => n.id !== notificationId)
    )
    toast.success('Notification deleted')
  }

  const handleNotificationClick = (notification: MentionNotification) => {
    markAsRead(notification.id)
    onNavigateToAnnotation?.(notification.annotationId)
    setOpen(false)
  }

  useEffect(() => {
    if (unreadCount > 0 && !open) {
      const lastNotification = [...(notifications || [])]
        .filter(n => !n.read)
        .sort((a, b) => b.timestamp - a.timestamp)[0]

      if (lastNotification && Date.now() - lastNotification.timestamp < 5000) {
        toast(
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: lastNotification.mentionedByColor }}
            >
              {lastNotification.mentionedBy.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {lastNotification.mentionedBy} mentioned you
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {lastNotification.replyContent}
              </p>
            </div>
          </div>,
          {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => handleNotificationClick(lastNotification)
            }
          }
        )
      }
    }
  }, [notifications])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-2">
          <Bell size={18} weight={unreadCount > 0 ? 'fill' : 'regular'} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Bell size={18} weight="fill" />
            <h3 className="font-semibold">Mentions</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="gap-1 h-7"
            >
              <Check size={14} />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {(!notifications || notifications.length === 0) ? (
            <div className="p-8 text-center">
              <At size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No mentions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll be notified when someone mentions you
              </p>
            </div>
          ) : (
            <div className="p-2">
              <AnimatePresence mode="popLayout">
                {[...(notifications || [])].sort((a, b) => b.timestamp - a.timestamp).map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    layout
                  >
                    <Card
                      className={`p-3 mb-2 cursor-pointer transition-colors ${
                        notification.read
                          ? 'bg-card/50 opacity-75 hover:opacity-100'
                          : 'bg-accent/5 border-accent/30 hover:bg-accent/10'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                          style={{ backgroundColor: notification.mentionedByColor }}
                        >
                          {notification.mentionedBy.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">
                            <span className="text-accent">@{notification.mentionedBy}</span>
                            {' mentioned you'}
                          </p>
                          <p className="text-xs text-muted-foreground mb-1">
                            in "{notification.annotationTitle}"
                          </p>
                          <p className="text-xs text-foreground/80 line-clamp-2 mb-2">
                            {notification.replyContent}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-accent" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Trash size={12} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export function createMentionNotification(
  mentionedUserId: string,
  mentionedBy: string,
  mentionedByColor: string,
  annotationId: string,
  annotationTitle: string,
  replyContent: string
): MentionNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    mentionedUserId,
    mentionedBy,
    mentionedByColor,
    annotationId,
    annotationTitle,
    replyContent,
    timestamp: Date.now(),
    read: false
  }
}
