import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import {
  User,
  Clock,
  Eye,
  Sparkle,
  FileText,
  Star,
  ChartBar,
  TrendUp
} from '@phosphor-icons/react'

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

  if (!user) {
    return null
  }

  const recentActivity = (activity || []).slice(0, 5)

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <Sparkle size={16} weight="duotone" className="text-accent" />
      case 'report':
        return <FileText size={16} weight="duotone" className="text-success" />
      case 'view':
        return <Eye size={16} weight="duotone" className="text-primary" />
      case 'bookmark':
        return <Star size={16} weight="duotone" className="text-warning" />
      default:
        return <ChartBar size={16} weight="duotone" className="text-muted-foreground" />
    }
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User size={16} weight="duotone" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Clock size={16} weight="duotone" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 ring-4 ring-background">
              <AvatarImage src={user.avatarUrl} alt={user.login} />
              <AvatarFallback className="text-2xl bg-accent/20 text-accent font-bold">
                {user.login[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{user.login}</h2>
                {user.isOwner && (
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    Owner
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                <div className="flex items-center gap-3 mb-2">
                  <Eye size={20} weight="duotone" className="text-primary" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Views</p>
                </div>
                <p className="text-2xl font-bold font-mono">{stats?.totalViews || 0}</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-accent/10 to-metric-purple/10 border-accent/30">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkle size={20} weight="duotone" className="text-accent" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Insights</p>
                </div>
                <p className="text-2xl font-bold font-mono">{stats?.insightsGenerated || 0}</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-success/10 to-primary/10 border-success/30">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={20} weight="duotone" className="text-success" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Reports</p>
                </div>
                <p className="text-2xl font-bold font-mono">{stats?.reportsCreated || 0}</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-warning/10 to-accent/10 border-warning/30">
                <div className="flex items-center gap-3 mb-2">
                  <Star size={20} weight="duotone" className="text-warning" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Bookmarks</p>
                </div>
                <p className="text-2xl font-bold font-mono">{stats?.bookmarksCount || 0}</p>
              </Card>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Last visit: {new Date(stats?.lastVisit || Date.now()).toLocaleString()}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Activity
            </h3>
            
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
                <Clock size={48} weight="thin" className="text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
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
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1">{item.description}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</p>
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
    metadataOrId?: string | Record<string, any>
  ) => {
    const metadata = typeof metadataOrId === 'string' ? { id: metadataOrId } : metadataOrId
    const newActivity: UserActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
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
        totalViews: 0,
        insightsGenerated: key === 'insightsGenerated' ? 1 : 0,
        reportsCreated: key === 'reportsCreated' ? 1 : 0,
        bookmarksCount: key === 'bookmarksCount' ? 1 : 0,
        lastVisit: Date.now()
      }
      return {
        ...current,
        [key]: (current[key] || 0) + 1,
        lastVisit: Date.now()
      }
    })
  }

  return { stats, incrementStat }
}
