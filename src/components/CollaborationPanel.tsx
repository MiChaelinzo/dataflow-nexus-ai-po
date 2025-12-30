import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPresence } from '@/lib/types'
import { 
  Users, 
  Cursor, 
  Clock, 
  Eye,
  MapPin,
  Circle
} from '@phosphor-icons/react'
import { CollaborationDemo } from '@/components/CollaborationDemo'

interface CollaborationPanelProps {
  activeUsers: UserPresence[]
  currentUser: {
    userId: string
    userName: string
    userColor: string
  }
}

export function CollaborationPanel({ activeUsers, currentUser }: CollaborationPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const filteredUsers = activeUsers.filter(user =>
    user.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <CollaborationDemo />
      
      <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Users size={20} weight="duotone" className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Live Collaboration</h3>
            <p className="text-xs text-muted-foreground">
              Real-time presence & cursor tracking
            </p>
          </div>
        </div>
        <Badge className="bg-success/20 text-success border-success/30 gap-1.5">
          <Circle size={8} weight="fill" className="animate-pulse" />
          {activeUsers.length} Active
        </Badge>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="gap-2">
            <Eye size={14} weight="duotone" />
            Active ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="you" className="gap-2">
            <Cursor size={14} weight="duotone" />
            You
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filteredUsers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <Users size={48} weight="thin" className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No users found' : 'No other users active'}
                  </p>
                </motion.div>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar
                        className="w-10 h-10 border-2"
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
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium truncate">{user.userName}</p>
                        {user.cursor && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Cursor size={10} weight="fill" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin size={12} weight="fill" />
                        <span className="truncate">{user.currentView}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(user.lastSeen)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="you" className="mt-4">
          <Card className="p-4 bg-gradient-to-br from-accent/10 via-card to-metric-purple/10 border-accent/20">
            <div className="flex items-start gap-3">
              <Avatar
                className="w-12 h-12 border-2"
                style={{ borderColor: currentUser.userColor }}
              >
                <AvatarFallback
                  className="text-sm font-semibold"
                  style={{
                    backgroundColor: currentUser.userColor,
                    color: 'white'
                  }}
                >
                  {getInitials(currentUser.userName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{currentUser.userName}</h4>
                  <Badge className="text-xs" style={{ backgroundColor: currentUser.userColor }}>
                    You
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Your cursor and activity are visible to other users in real-time
                </p>

                <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: currentUser.userColor }}
                  >
                    <Cursor size={14} weight="fill" className="text-white" />
                  </div>
                  <span className="text-xs font-medium">Your cursor color</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Collaboration Features
              </h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Circle size={8} weight="fill" className="text-accent mt-1 flex-shrink-0" />
                  <span>See other users' cursors in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Circle size={8} weight="fill" className="text-accent mt-1 flex-shrink-0" />
                  <span>Track who's viewing which sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <Circle size={8} weight="fill" className="text-accent mt-1 flex-shrink-0" />
                  <span>Automatic presence updates every 10 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <Circle size={8} weight="fill" className="text-accent mt-1 flex-shrink-0" />
                  <span>Activity tracked across all dashboard tabs</span>
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      </Card>
    </div>
  )
}
