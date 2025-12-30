import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserPresence } from '@/lib/types'
import { Eye } from '@phosphor-icons/react'

interface PresenceIndicatorProps {
  users: UserPresence[]
  maxVisible?: number
}

export function PresenceIndicator({ users, maxVisible = 5 }: PresenceIndicatorProps) {
  const activeUsers = users.filter(u => u.isActive)
  const visibleUsers = activeUsers.slice(0, maxVisible)
  const overflowCount = Math.max(0, activeUsers.length - maxVisible)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (activeUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        <AnimatePresence mode="popLayout">
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, scale: 0, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <Avatar
                className="w-8 h-8 border-2 ring-2 ring-background transition-transform hover:scale-110 hover:z-10"
                style={{ borderColor: user.userColor }}
              >
                <AvatarFallback
                  className="text-xs font-semibold"
                  style={{
                    backgroundColor: user.userColor,
                    color: 'white'
                  }}
                >
                  {getInitials(user.userName)}
                </AvatarFallback>
              </Avatar>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background"
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {overflowCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarFallback className="bg-muted text-xs font-semibold">
                +{overflowCount}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        )}
      </div>

      <Badge variant="outline" className="gap-1.5 text-xs">
        <Eye size={14} weight="fill" />
        {activeUsers.length} viewing
      </Badge>
    </div>
  )
}
