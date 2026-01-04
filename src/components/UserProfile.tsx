import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  User, 
  ChartBar, 
  Clock, 
  Star, 
  Eye,
  GithubLogo,
  Crown,
  TrendUp,
  FileText,
  Sparkle
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface UserInfo {
  avatarUrl: string
  email: string
  id: number
  isOwner: boolean
  login: string
}

interface UserActivity {
  type: 'insight' | 'report' | 'view' | 'bookmark'
  title: string
  timestamp: number
  tab?: string
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
  const [activity, setActivity] = useKV<UserActivity[]>('user-activity', [])
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
  }, [])

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
            <Avatar className="w-20 h-20 border-2 border-accent/30">
              <AvatarImage src={user.avatarUrl} alt={user.login} />
              <AvatarFallback className="bg-accent/20 text-accent text-2xl font-bold">
                {user.login[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">{user.login}</h3>
                {user.isOwner && (
                  <Badge className="gap-1 bg-warning/20 text-warning border-warning/30">
                    <Crown size={14} weight="fill" />
                    Owner
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-3">{user.email}</p>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(`https://github.com/${user.login}`, '_blank')}
              >
                <GithubLogo size={16} weight="fill" />
                View GitHub Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 bg-accent/5 border-accent/20">
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={18} weight="duotone" className="text-accent" />
                  <span className="text-sm text-muted-foreground">Total Views</span>
                </div>
                <p className="text-2xl font-bold font-mono">{stats?.totalViews || 0}</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 bg-metric-purple/5 border-metric-purple/20">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkle size={18} weight="duotone" className="text-metric-purple" />
                  <span className="text-sm text-muted-foreground">Insights</span>
                </div>
                <p className="text-2xl font-bold font-mono">{stats?.insightsGenerated || 0}</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 bg-success/5 border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={18} weight="duotone" className="text-success" />
                  <span className="text-sm text-muted-foreground">Reports</span>
                </div>
                <p className="text-2xl font-bold font-mono">{stats?.reportsCreated || 0}</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 bg-warning/5 border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={18} weight="duotone" className="text-warning" />
                  <span className="text-sm text-muted-foreground">Bookmarks</span>
                </div>
                <p className="text-2xl font-bold font-mono">{stats?.bookmarksCount || 0}</p>
              </Card>
            </motion.div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} weight="duotone" />
              Last visit: {formatTime(stats?.lastVisit || Date.now())}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((act, index) => (
                <motion.div
                  key={`${act.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:bg-accent/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{act.title}</p>
                        {act.tab && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {act.tab}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(act.timestamp)}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <TrendUp size={32} weight="duotone" className="text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Activity Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your recent actions will appear here
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

export function useUserActivity() {
  const [activity, setActivity] = useKV<UserActivity[]>('user-activity', [])

  const trackActivity = (type: UserActivity['type'], title: string, tab?: string) => {
    setActivity((current) => {
      if (!current) return [{
        type,
        title,
        timestamp: Date.now(),
        tab
      }]
      return [
        {
          type,
          title,
          timestamp: Date.now(),
          tab
        },
        ...current.slice(0, 49)
      ]
    })
  }

  return { trackActivity }
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
        [key]: current[key] + 1
      }
    })
  }

  return { stats, incrementStat }
}
