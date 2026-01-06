import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import {
  User,
  Eye,
  Sparkle,
  FileText,
  Star,
  Clock,
  TrendUp,
  ChartBar,
  Crown
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface UserInfo {
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
  id: number
}

interface UserActivity {
  id: string
  type: 'view' | 'insight' | 'report' | 'bookmark'
  description: string
  context?: string
  timestamp: number
  metadata?: Record<string, any>
}

interface UserStats {
  totalViews: number
  insightsGenerated: number
  reportsCreated: number
  bookmarksCount: number
  lastVisit: number
}

export function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [activity] = useKV<UserActivity[]>('user-activity', [])
  const [stats, setStats] = useKV<UserStats>('user-stats', {
    totalViews: 0,
    insightsGenerated: 0,
    reportsCreated: 0,
    bookmarksCount: 0,
    lastVisit: Date.now()
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await window.spark.user()
        setUser(userInfo)
        
        setStats((current) => {
          if (!current) return {
            totalViews: 1,
            insightsGenerated: 0,
            reportsCreated: 0,
            bookmarksCount: 0,
            lastVisit: Date.now()
          }
          return {
            ...current,
            totalViews: current.totalViews + 1,
            lastVisit: Date.now()
          }
        })
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    
    loadUser()
  }, [setStats])

  const recentActivity = (activity || []).slice(0, 10)

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'view':
        return <Eye size={16} weight="duotone" className="text-accent" />
      case 'insight':
        return <Sparkle size={16} weight="fill" className="text-accent" />
      case 'report':
        return <FileText size={16} weight="duotone" className="text-accent" />
      case 'bookmark':
        return <Star size={16} weight="fill" className="text-warning" />
      default:
        return <ChartBar size={16} weight="duotone" className="text-accent" />
    }
  }

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">Loading user profile...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 ring-2 ring-border">
              <AvatarImage src={user.avatarUrl} alt={user.login} />
              <AvatarFallback className="text-2xl bg-accent/20 text-accent">
                {user.login[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{user.login}</h2>
                {user.isOwner && (
                  <Badge className="gap-1 bg-warning/20 text-warning border-warning/30">
                    <Crown size={14} weight="fill" />
                    Owner
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Eye size={14} />
                <span>Total Views</span>
              </div>
              <p className="text-2xl font-bold font-mono">{stats?.totalViews || 0}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Sparkle size={14} />
                <span>Insights Generated</span>
              </div>
              <p className="text-2xl font-bold font-mono">{stats?.insightsGenerated || 0}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <FileText size={14} />
                <span>Reports Created</span>
              </div>
              <p className="text-2xl font-bold font-mono">{stats?.reportsCreated || 0}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Star size={14} />
                <span>Bookmarks</span>
              </div>
              <p className="text-2xl font-bold font-mono">{stats?.bookmarksCount || 0}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-muted-foreground">
              Last visit: {stats?.lastVisit ? new Date(stats.lastVisit).toLocaleString() : 'Never'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} weight="thin" className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {recentActivity.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1">{item.description}</p>
                            {item.context && (
                              <p className="text-xs text-muted-foreground mb-2">{item.context}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock size={12} />
                              <span>{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

export function useUserActivity() {
  const [activity, setActivity] = useKV<UserActivity[]>('user-activity', [])

  const trackActivity = (
    type: UserActivity['type'],
    description: string,
    context?: string,
    metadata?: Record<string, any>
  ) => {
    const newActivity: UserActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      context,
      timestamp: Date.now(),
      metadata
    }

    setActivity((current) => [newActivity, ...(current || [])].slice(0, 100))
  }

  return { activity: activity || [], trackActivity }
}

export function useUserStats() {
  const [stats, setStats] = useKV<UserStats>('user-stats', {
    totalViews: 0,
    insightsGenerated: 0,
    reportsCreated: 0,
    bookmarksCount: 0,
    lastVisit: Date.now()
  })

  const incrementStat = (key: keyof Omit<UserStats, 'lastVisit'>) => {
    setStats((current) => {
      if (!current) return {
        totalViews: key === 'totalViews' ? 1 : 0,
        insightsGenerated: key === 'insightsGenerated' ? 1 : 0,
        reportsCreated: key === 'reportsCreated' ? 1 : 0,
        bookmarksCount: key === 'bookmarksCount' ? 1 : 0,
        lastVisit: Date.now()
      }
      return {
        ...current,
        [key]: (current[key] as number) + 1,
        lastVisit: Date.now()
      }
    })
  }

  return { stats, incrementStat }
}
